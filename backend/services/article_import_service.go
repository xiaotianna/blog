package services

import (
	"blog/config"
	"blog/dao"
	"blog/dto"
	"blog/vo"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/JohannesKaufmann/html-to-markdown/v2/converter"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/base"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/commonmark"
	tableplugin "github.com/JohannesKaufmann/html-to-markdown/v2/plugin/table"
	"github.com/PuerkitoBio/goquery"
	feishu2md "github.com/Wsine/feishu2md/core"
	"github.com/google/uuid"
)

const (
	articleImportSourceFeishu = "feishu"
	articleImportSourceJuejin = "juejin"
	articleImportSourceCSDN   = "csdn"
)

const articleImportUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

var (
	errArticleImportEmptyInput = errors.New("请输入公开文章链接，或粘贴 HTML/Markdown 内容")
	errArticleImportEmptyBody  = errors.New("未能解析到文章正文，请粘贴 HTML/Markdown 内容后重试")
	errArticleImportFeishuAuth = errors.New("飞书页面可能需要权限，请粘贴 HTML/Markdown 内容后导入")

	articleImportImagePattern       = regexp.MustCompile(`!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)`)
	articleImportJuejinKeyExpr      = regexp.MustCompile(`"%s"\s*:\s*"((?:\\.|[^"\\])*)"`)
	articleImportFeishuAuthRe       = regexp.MustCompile(`(?i)无权限|权限|登录|login|sign in|access denied|permission`)
	articleImportFeishuTokenRe      = regexp.MustCompile(`^[A-Za-z0-9_-]{8,}$`)
	articleImportEmptyHeadingLinkRe = regexp.MustCompile(`(?m)^(#{1,6}\s+)(?:\[\]\([^)]+\)\s*)+`)
	articleImportRawTableRe         = regexp.MustCompile(`(?is)<table\b[^>]*>.*?</table>`)
)

type articleImportAdapter struct {
	contentSelectors []string
	titleSelectors   []string
}

var articleImportAdapters = map[string]articleImportAdapter{
	articleImportSourceFeishu: {
		titleSelectors: []string{"h1", "[data-doc-title]", ".doc-title", ".suite-page-title", "title"},
		contentSelectors: []string{
			"[data-page-content]",
			".suite-page-content",
			".doc-content",
			".doc-body",
			"article",
			"main",
		},
	},
	articleImportSourceJuejin: {
		titleSelectors:   []string{"h1.article-title", ".article-title", "h1", "title"},
		contentSelectors: []string{".article-content", ".markdown-body", ".article-area", "article", "main"},
	},
	articleImportSourceCSDN: {
		titleSelectors:   []string{"h1.title-article", ".title-article", "h1", "title"},
		contentSelectors: []string{"#content_views", ".blog-content-box", "article", "main"},
	},
}

func (ArticleService) PreviewImport(ctx context.Context, id uuid.UUID, req dto.PreviewArticleImportRequest) (*vo.ArticleImportPreviewVO, error) {
	if _, err := dao.Article.FindByID(ctx, id); err != nil {
		return nil, err
	}

	rawContent := strings.TrimSpace(req.RawContent)
	rawFormat := strings.TrimSpace(req.RawFormat)
	articleURL := strings.TrimSpace(req.URL)

	if articleURL == "" && rawContent == "" {
		return nil, errArticleImportEmptyInput
	}

	var (
		markdown  string
		title     string
		imageURLs []string
		warnings  []string
		err       error
	)

	if rawContent != "" {
		if rawFormat == "markdown" {
			markdown = normalizeArticleImportMarkdown(rawContent)
		} else {
			markdown, err = articleImportHTMLToMarkdown(rawContent, nil)
			if err != nil {
				return nil, err
			}
		}
	} else {
		parsedURL, err := parseArticleImportURL(articleURL)
		if err != nil {
			return nil, err
		}

		if req.Source == articleImportSourceFeishu {
			title, markdown, imageURLs, err = parseFeishuOpenAPIArticle(ctx, parsedURL)
			if err != nil {
				warnings = append(warnings, err.Error())
			}
		}

		if strings.TrimSpace(markdown) == "" {
			html, err := fetchArticleImportHTML(ctx, parsedURL, req.Source)
			if err != nil {
				return nil, mergeArticleImportWarningsError(warnings, err)
			}

			title, markdown, warnings, err = parseArticleImportHTML(html, req.Source, parsedURL)
			if err != nil {
				return nil, err
			}
		}
	}

	if strings.TrimSpace(markdown) == "" {
		return nil, errArticleImportEmptyBody
	}

	if len(imageURLs) == 0 {
		imageURLs = extractArticleImportImageURLs(markdown)
	}

	return &vo.ArticleImportPreviewVO{
		Title:      title,
		Markdown:   markdown,
		ImageCount: len(imageURLs),
		ImageURLs:  imageURLs,
		Warnings:   warnings,
	}, nil
}

func (ArticleService) ApplyImport(ctx context.Context, id uuid.UUID, req dto.ApplyArticleImportRequest) (*vo.ArticleImportApplyVO, error) {
	article, err := dao.Article.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	markdown := strings.TrimSpace(req.Markdown)
	if markdown == "" {
		return nil, errors.New("导入正文不能为空")
	}

	nextMarkdown, savedCount, warnings := downloadArticleImportImages(ctx, id, req.Source, markdown, req.ImageURLs)
	article.Content = nextMarkdown

	if err := dao.Article.Save(ctx, article); err != nil {
		return nil, err
	}

	return &vo.ArticleImportApplyVO{
		ID:         article.ID,
		Path:       toPublicPath(article.Path),
		ImageCount: savedCount,
		Warnings:   warnings,
	}, nil
}

func parseArticleImportURL(value string) (*url.URL, error) {
	parsedURL, err := url.Parse(value)
	if err != nil || parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, errors.New("请输入有效的文章链接")
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return nil, errors.New("文章链接仅支持 http 或 https")
	}

	return parsedURL, nil
}

func parseFeishuOpenAPIArticle(ctx context.Context, articleURL *url.URL) (string, string, []string, error) {
	appID, appSecret := getFeishuArticleImportCredentials()
	if appID == "" || appSecret == "" {
		return "", "", nil, errors.New("未配置飞书开放平台凭证，已尝试使用公开页面解析")
	}

	docToken, _, err := resolveFeishuArticleImportDocToken(ctx, articleURL, appID, appSecret)
	if err != nil {
		return "", "", nil, err
	}

	client := feishu2md.NewClient(appID, appSecret)
	doc, blocks, err := client.GetDocxContent(ctx, docToken)
	if err != nil {
		return "", "", nil, fmt.Errorf("飞书 OpenAPI 获取文档失败，请确认应用权限和文档可见范围")
	}
	if doc == nil || doc.DocumentID == "" || len(blocks) == 0 {
		return "", "", nil, errors.New("飞书 OpenAPI 未返回有效文档内容")
	}

	parser := feishu2md.NewParser(feishu2md.OutputConfig{
		ImageDir:        "uploads/article-images",
		TitleAsFilename: false,
		UseHTMLTags:     false,
		SkipImgDownload: true,
	})

	markdown := normalizeArticleImportMarkdown(parser.ParseDocxContent(doc, blocks))

	return doc.Title, markdown, parser.ImgTokens, nil
}

func resolveFeishuArticleImportDocToken(ctx context.Context, articleURL *url.URL, appID string, appSecret string) (string, string, error) {
	token, linkType := parseFeishuArticleImportToken(articleURL)
	if token == "" {
		return "", "", errors.New("未识别到飞书文档 token，请确认链接格式")
	}

	if linkType != "wiki" {
		return token, linkType, nil
	}

	client := feishu2md.NewClient(appID, appSecret)
	node, err := client.GetWikiNodeInfo(ctx, token)
	if err != nil {
		return "", "", fmt.Errorf("飞书知识库节点获取失败，请确认应用已开通 wiki:wiki:readonly 权限")
	}
	if node == nil || node.ObjToken == "" {
		return "", "", errors.New("飞书知识库节点未返回文档 token")
	}
	if node.ObjType != "" && node.ObjType != "docx" {
		return "", "", fmt.Errorf("当前知识库节点类型为 %s，暂只支持 docx 文档", node.ObjType)
	}

	return node.ObjToken, linkType, nil
}

func parseFeishuArticleImportToken(articleURL *url.URL) (string, string) {
	segments := strings.Split(strings.Trim(articleURL.Path, "/"), "/")
	for index, segment := range segments {
		if segment == "" || index+1 >= len(segments) {
			continue
		}

		switch segment {
		case "docx", "doc", "wiki":
			return segments[index+1], segment
		}
	}

	return "", ""
}

func getFeishuArticleImportCredentials() (string, string) {
	appID := strings.TrimSpace(os.Getenv("FEISHU_APP_ID"))
	appSecret := strings.TrimSpace(os.Getenv("FEISHU_APP_SECRET"))

	if appID == "" && config.GlobalConfig != nil {
		appID = strings.TrimSpace(config.GlobalConfig.Feishu.AppID)
	}
	if appSecret == "" && config.GlobalConfig != nil {
		appSecret = strings.TrimSpace(config.GlobalConfig.Feishu.AppSecret)
	}

	return appID, appSecret
}

func mergeArticleImportWarningsError(warnings []string, err error) error {
	if len(warnings) == 0 {
		return err
	}

	return fmt.Errorf("%s；%s", strings.Join(warnings, "；"), err.Error())
}

func fetchArticleImportHTML(ctx context.Context, articleURL *url.URL, source string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, articleURL.String(), nil)
	if err != nil {
		return "", err
	}

	setArticleImportHTMLHeaders(req, source)

	client := &http.Client{Timeout: 20 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		if source == articleImportSourceFeishu {
			return "", errors.New("Go 服务无法访问该飞书链接，请确认后端所在网络可访问飞书")
		}

		return "", errors.New("外部文章获取失败，请稍后重试")
	}
	defer res.Body.Close()

	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusMultipleChoices {
		if source == articleImportSourceFeishu {
			return "", fmt.Errorf("飞书拒绝后端访问或需要额外权限（HTTP %d）", res.StatusCode)
		}

		return "", fmt.Errorf("外部文章获取失败（HTTP %d）", res.StatusCode)
	}

	contentType := res.Header.Get("Content-Type")
	if contentType != "" && !strings.Contains(contentType, "text/html") {
		return "", errors.New("外部链接不是可解析的 HTML 页面")
	}

	body, err := io.ReadAll(io.LimitReader(res.Body, 5<<20))
	if err != nil {
		return "", errors.New("外部文章读取失败，请稍后重试")
	}

	return string(body), nil
}

func parseArticleImportHTML(html string, source string, baseURL *url.URL) (string, string, []string, error) {
	if source == articleImportSourceJuejin {
		title, markdown := parseJuejinScriptArticle(html, baseURL)
		if markdown != "" {
			return title, markdown, nil, nil
		}
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return "", "", nil, errArticleImportEmptyBody
	}

	removeArticleImportNoise(doc.Selection)

	adapter := articleImportAdapters[source]
	title := readArticleImportFirstText(doc.Selection, adapter.titleSelectors)
	content := selectArticleImportContent(doc.Selection, adapter.contentSelectors)
	contentText := strings.TrimSpace(content.Text())

	if source == articleImportSourceFeishu && articleImportFeishuAuthRe.MatchString(doc.Text()) && len([]rune(contentText)) < 80 {
		return "", "", nil, errArticleImportFeishuAuth
	}

	if content.Length() == 0 || len([]rune(contentText)) < 20 {
		return title, "", []string{"未找到明确的正文区域，已尝试使用页面主体兜底"}, nil
	}

	normalizeArticleImportImages(content, baseURL)
	contentHTML, err := content.Html()
	if err != nil {
		return "", "", nil, err
	}

	markdown, err := articleImportHTMLToMarkdown(contentHTML, baseURL)
	if err != nil {
		return "", "", nil, err
	}

	return title, markdown, nil, nil
}

func parseJuejinScriptArticle(html string, baseURL *url.URL) (string, string) {
	title := readArticleImportEscapedScriptString(html, "title")
	markdown := readArticleImportEscapedScriptString(html, "mark_content")
	if markdown != "" {
		return title, normalizeArticleImportMarkdown(markdown)
	}

	htmlContent := readArticleImportEscapedScriptString(html, "html_content")
	if htmlContent == "" {
		return title, ""
	}

	markdown, err := articleImportHTMLToMarkdown(htmlContent, baseURL)
	if err != nil {
		return title, ""
	}

	return title, markdown
}

func readArticleImportEscapedScriptString(html string, key string) string {
	pattern := regexp.MustCompile(fmt.Sprintf(articleImportJuejinKeyExpr.String(), regexp.QuoteMeta(key)))
	match := pattern.FindStringSubmatch(html)
	if len(match) < 2 {
		return ""
	}

	value, err := strconv.Unquote(`"` + match[1] + `"`)
	if err != nil {
		return ""
	}

	return value
}

func articleImportHTMLToMarkdown(html string, baseURL *url.URL) (string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return "", err
	}

	removeArticleImportNoise(doc.Selection)
	removeArticleImportEmptyHeadingAnchors(doc.Selection)
	if baseURL != nil {
		normalizeArticleImportImages(doc.Selection, baseURL)
		normalizeArticleImportLinks(doc.Selection, baseURL)
	}

	normalizedHTML, err := doc.Html()
	if err != nil {
		return "", err
	}

	options := []converter.ConvertOptionFunc{}
	if baseURL != nil {
		options = append(options, converter.WithDomain(baseURL.Scheme+"://"+baseURL.Host))
	}

	markdown, err := newArticleImportMarkdownConverter().ConvertString(normalizedHTML, options...)
	if err != nil {
		return "", err
	}

	return normalizeArticleImportMarkdown(markdown), nil
}

func newArticleImportMarkdownConverter() *converter.Converter {
	return converter.NewConverter(
		converter.WithPlugins(
			base.NewBasePlugin(),
			commonmark.NewCommonmarkPlugin(),
			tableplugin.NewTablePlugin(
				tableplugin.WithSkipEmptyRows(true),
				tableplugin.WithHeaderPromotion(true),
				tableplugin.WithPresentationTables(true),
				tableplugin.WithNewlineBehavior(tableplugin.NewlineBehaviorPreserve),
				tableplugin.WithCellPaddingBehavior(tableplugin.CellPaddingBehaviorMinimal),
			),
		),
	)
}

func selectArticleImportContent(root *goquery.Selection, selectors []string) *goquery.Selection {
	for _, selector := range selectors {
		current := root.Find(selector).First()
		if current.Length() > 0 && len([]rune(strings.TrimSpace(current.Text()))) >= 20 {
			return current
		}
	}

	return root.Find("body").First()
}

func readArticleImportFirstText(root *goquery.Selection, selectors []string) string {
	for _, selector := range selectors {
		value := strings.TrimSpace(root.Find(selector).First().Text())
		if value != "" {
			return value
		}
	}

	return ""
}

func removeArticleImportEmptyHeadingAnchors(root *goquery.Selection) {
	root.Find("h1 a, h2 a, h3 a, h4 a, h5 a, h6 a").Each(func(_ int, link *goquery.Selection) {
		if strings.TrimSpace(link.Text()) == "" {
			link.Remove()
		}
	})
}

func normalizeArticleImportImages(root *goquery.Selection, baseURL *url.URL) {
	root.Find("img").Each(func(_ int, image *goquery.Selection) {
		rawSrc := firstArticleImportAttr(image, "src", "data-src", "data-original", "data-actualsrc", "data-img-src")
		src := normalizeArticleImportAssetURL(rawSrc, baseURL)
		if src == "" {
			image.Remove()
			return
		}

		image.SetAttr("src", src)
	})
}

func normalizeArticleImportLinks(root *goquery.Selection, baseURL *url.URL) {
	root.Find("a[href]").Each(func(_ int, link *goquery.Selection) {
		href, _ := link.Attr("href")
		if normalized := normalizeArticleImportAssetURL(href, baseURL); normalized != "" {
			link.SetAttr("href", normalized)
		}
	})
}

func normalizeArticleImportAssetURL(value string, baseURL *url.URL) string {
	value = strings.TrimSpace(value)
	if value == "" || strings.HasPrefix(value, "data:") || strings.HasPrefix(value, "blob:") {
		return ""
	}

	parsedURL, err := url.Parse(value)
	if err != nil {
		return ""
	}

	return baseURL.ResolveReference(parsedURL).String()
}

func firstArticleImportAttr(selection *goquery.Selection, names ...string) string {
	for _, name := range names {
		if value, ok := selection.Attr(name); ok && strings.TrimSpace(value) != "" {
			return value
		}
	}

	return ""
}

func extractArticleImportImageURLs(markdown string) []string {
	urls := make([]string, 0)
	seen := make(map[string]struct{})

	for _, match := range articleImportImagePattern.FindAllStringSubmatch(markdown, -1) {
		if len(match) < 2 {
			continue
		}

		imageURL := strings.TrimSpace(match[1])
		if !strings.HasPrefix(imageURL, "http://") && !strings.HasPrefix(imageURL, "https://") {
			continue
		}

		if _, ok := seen[imageURL]; ok {
			continue
		}

		seen[imageURL] = struct{}{}
		urls = append(urls, imageURL)
	}

	return urls
}

func downloadArticleImportImages(ctx context.Context, articleID uuid.UUID, source string, markdown string, imageURLs []string) (string, int, []string) {
	nextMarkdown := markdown
	savedCount := 0
	warnings := make([]string, 0)
	seen := make(map[string]struct{})

	for index, imageURL := range imageURLs {
		imageURL = strings.TrimSpace(imageURL)
		if imageURL == "" {
			continue
		}

		if _, ok := seen[imageURL]; ok {
			continue
		}
		seen[imageURL] = struct{}{}

		localURL, err := downloadArticleImportImage(ctx, articleID, source, imageURL)
		if err != nil || localURL == "" {
			warnings = append(warnings, fmt.Sprintf("第 %d 张图片下载失败，已保留原链接", index+1))
			continue
		}

		nextMarkdown = rewriteArticleImportMarkdownImageURL(nextMarkdown, imageURL, localURL)
		savedCount++
	}

	return nextMarkdown, savedCount, warnings
}

func downloadArticleImportImage(ctx context.Context, articleID uuid.UUID, source string, imageURL string) (string, error) {
	if source == articleImportSourceFeishu && !strings.HasPrefix(imageURL, "http://") && !strings.HasPrefix(imageURL, "https://") {
		return downloadFeishuArticleImportImage(ctx, articleID, imageURL)
	}

	parsedURL, err := parseArticleImportURL(imageURL)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsedURL.String(), nil)
	if err != nil {
		return "", err
	}

	setArticleImportImageHeaders(req, source)

	client := &http.Client{Timeout: 25 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusMultipleChoices {
		return "", fmt.Errorf("image request failed: %d", res.StatusCode)
	}

	if res.ContentLength > maxArticleImageSize {
		return "", ErrArticleImageTooLarge
	}

	body, err := io.ReadAll(io.LimitReader(res.Body, maxArticleImageSize+1))
	if err != nil {
		return "", ErrArticleImageRead
	}

	if int64(len(body)) > maxArticleImageSize {
		return "", ErrArticleImageTooLarge
	}

	contentType := http.DetectContentType(body)
	ext, err := articleImageExtFromContentType(contentType)
	if err != nil {
		return "", err
	}

	if err := os.MkdirAll(filepath.Join("uploads", "article-images"), 0755); err != nil {
		return "", fmt.Errorf("%w: %v", ErrArticleImageDir, err)
	}

	filename := fmt.Sprintf("%s-%d.%s", articleID.String(), time.Now().UnixNano(), ext)
	dst := filepath.Join("uploads", "article-images", filename)

	if err := os.WriteFile(dst, body, 0644); err != nil {
		return "", fmt.Errorf("%w: %v", ErrArticleImageSave, err)
	}

	return "/uploads/article-images/" + filename, nil
}

func downloadFeishuArticleImportImage(ctx context.Context, articleID uuid.UUID, imageToken string) (string, error) {
	imageToken = strings.TrimSpace(imageToken)
	if imageToken == "" || !articleImportFeishuTokenRe.MatchString(imageToken) {
		return "", errors.New("飞书图片 token 不合法")
	}

	appID, appSecret := getFeishuArticleImportCredentials()
	if appID == "" || appSecret == "" {
		return "", errors.New("未配置飞书开放平台凭证，无法下载飞书图片")
	}

	client := feishu2md.NewClient(appID, appSecret)
	_, body, err := client.DownloadImageRaw(ctx, imageToken, "")
	if err != nil {
		return "", err
	}
	if int64(len(body)) > maxArticleImageSize {
		return "", ErrArticleImageTooLarge
	}

	contentType := http.DetectContentType(body)
	ext, err := articleImageExtFromContentType(contentType)
	if err != nil {
		return "", err
	}

	if err := os.MkdirAll(filepath.Join("uploads", "article-images"), 0755); err != nil {
		return "", fmt.Errorf("%w: %v", ErrArticleImageDir, err)
	}

	filename := fmt.Sprintf("%s-%d.%s", articleID.String(), time.Now().UnixNano(), ext)
	dst := filepath.Join("uploads", "article-images", filename)
	if err := os.WriteFile(dst, body, 0644); err != nil {
		return "", fmt.Errorf("%w: %v", ErrArticleImageSave, err)
	}

	return "/uploads/article-images/" + filename, nil
}

func articleImageExtFromContentType(contentType string) (string, error) {
	switch contentType {
	case "image/png":
		return "png", nil
	case "image/jpeg":
		return "jpg", nil
	case "image/webp":
		return "webp", nil
	case "image/gif":
		return "gif", nil
	default:
		return "", ErrArticleImageType
	}
}

func setArticleImportHTMLHeaders(req *http.Request, source string) {
	req.Header.Set("User-Agent", articleImportUserAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

	if source == articleImportSourceJuejin {
		req.Header.Set("Referer", "https://juejin.cn/")
	}
}

func setArticleImportImageHeaders(req *http.Request, source string) {
	req.Header.Set("User-Agent", articleImportUserAgent)
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")

	if source == articleImportSourceJuejin {
		req.Header.Set("Referer", "https://juejin.cn/")
	}
}

func rewriteArticleImportMarkdownImageURL(markdown string, from string, to string) string {
	return articleImportImagePattern.ReplaceAllStringFunc(markdown, func(match string) string {
		parts := articleImportImagePattern.FindStringSubmatch(match)
		if len(parts) < 2 || parts[1] != from {
			return match
		}

		return strings.Replace(match, from, to, 1)
	})
}

func normalizeArticleImportMarkdown(markdown string) string {
	markdown = strings.ReplaceAll(markdown, "\r\n", "\n")
	markdown = strings.ReplaceAll(markdown, "\r", "\n")
	markdown = normalizeArticleImportRawHTMLTables(markdown)
	markdown = articleImportEmptyHeadingLinkRe.ReplaceAllString(markdown, "$1")

	for strings.Contains(markdown, "\n\n\n") {
		markdown = strings.ReplaceAll(markdown, "\n\n\n", "\n\n")
	}

	return strings.TrimSpace(markdown)
}

func normalizeArticleImportRawHTMLTables(markdown string) string {
	return articleImportRawTableRe.ReplaceAllStringFunc(markdown, func(tableHTML string) string {
		nextMarkdown, err := newArticleImportMarkdownConverter().ConvertString(tableHTML)
		if err != nil || strings.TrimSpace(nextMarkdown) == "" {
			return tableHTML
		}

		return "\n\n" + strings.TrimSpace(nextMarkdown) + "\n\n"
	})
}

func removeArticleImportNoise(root *goquery.Selection) {
	root.Find(strings.Join([]string{
		"script",
		"style",
		"noscript",
		"iframe",
		"button",
		"svg",
		"canvas",
		".recommend-box",
		".recommend-list",
		".article-copyright",
		".blog-footer-bottom",
		".csdn-side-toolbar",
		".passport-login-container",
		"[class*='recommend']",
		"[class*='advert']",
		"[class*='copyright']",
	}, ",")).Remove()
}
