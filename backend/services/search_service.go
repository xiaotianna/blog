package services

import (
	"blog/dao"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"regexp"
	"sort"
	"strings"
	"unicode/utf8"
)

const (
	searchResultLimit = 20
	searchQueryLimit  = 100
	searchSnippetSize = 180
)

var (
	ErrSearchQueryTooLong = errors.New("搜索关键词不能超过100个字符")
	markdownImagePattern  = regexp.MustCompile(`!\[([^\]]*)\]\([^)]*\)`)
	markdownLinkPattern   = regexp.MustCompile(`\[([^\]]+)\]\([^)]*\)`)
	markdownHTMLPattern   = regexp.MustCompile(`<[^>]+>`)
	markdownPrefixPattern = regexp.MustCompile(`(?m)^\s{0,3}(#{1,6}|>|[-+*]|\d+[.)])\s+`)
	markdownMarkPattern   = regexp.MustCompile("[`*_~]+")
	whitespacePattern     = regexp.MustCompile(`\s+`)
)

type SearchService struct{}

var Search = SearchService{}

type rankedSearchResult struct {
	item       vo.SearchResultVO
	score      int
	matchCount int
	updatedAt  int64
}

func (SearchService) Search(ctx context.Context, rawQuery string, includeAllStatuses bool) (*vo.SearchResponseVO, error) {
	query := strings.TrimSpace(rawQuery)
	if utf8.RuneCountInString(query) > searchQueryLimit {
		return nil, ErrSearchQueryTooLong
	}

	if query == "" {
		return recentSearchResults(ctx)
	}

	categories, err := dao.Search.FindCategories(ctx, query, searchResultLimit)
	if err != nil {
		return nil, err
	}

	articles, err := dao.Search.FindArticles(ctx, query, includeAllStatuses, searchResultLimit)
	if err != nil {
		return nil, err
	}

	ranked := make([]rankedSearchResult, 0, len(categories)+len(articles))
	for _, category := range categories {
		ranked = append(ranked, rankCategory(category, query))
	}
	for _, article := range articles {
		ranked = append(ranked, rankArticle(article, query))
	}

	sort.SliceStable(ranked, func(i, j int) bool {
		if ranked[i].score != ranked[j].score {
			return ranked[i].score > ranked[j].score
		}
		if ranked[i].matchCount != ranked[j].matchCount {
			return ranked[i].matchCount > ranked[j].matchCount
		}
		return ranked[i].updatedAt > ranked[j].updatedAt
	})

	if len(ranked) > searchResultLimit {
		ranked = ranked[:searchResultLimit]
	}

	items := make([]vo.SearchResultVO, 0, len(ranked))
	for _, result := range ranked {
		items = append(items, result.item)
	}

	return &vo.SearchResponseVO{Items: items}, nil
}

func recentSearchResults(ctx context.Context) (*vo.SearchResponseVO, error) {
	articles, err := dao.Search.FindRecentArticles(ctx, searchResultLimit)
	if err != nil {
		return nil, err
	}

	items := make([]vo.SearchResultVO, 0, len(articles))
	for _, article := range articles {
		items = append(items, vo.SearchResultVO{
			ID:          article.ID,
			Type:        vo.SearchResultTypeArticle,
			Title:       article.Title,
			Path:        toPublicPath(article.Path),
			Description: truncateRunes(collapseWhitespace(article.Description), searchSnippetSize),
		})
	}

	return &vo.SearchResponseVO{Items: items}, nil
}

func rankCategory(category entities.CategoryEntity, query string) rankedSearchResult {
	titleScore := textScore(category.Name, query, 100, 90, 80)
	descriptionMatched := containsFold(category.Description, query)
	score := titleScore
	matchCount := 0

	if titleScore > 0 {
		matchCount++
	}
	if descriptionMatched {
		matchCount++
		if score < 40 {
			score = 40
		}
	}

	item := vo.SearchResultVO{
		ID:           category.ID,
		Type:         vo.SearchResultTypeDirectory,
		Title:        category.Name,
		Path:         toPublicPath(category.Path),
		TitleMatched: titleScore > 0,
	}
	if descriptionMatched {
		item.Description = buildSnippet(category.Description, query, searchSnippetSize, false)
	}

	return rankedSearchResult{
		item:       item,
		score:      score,
		matchCount: matchCount,
		updatedAt:  category.UpdatedAt.UnixNano(),
	}
}

func rankArticle(article entities.ArticleEntity, query string) rankedSearchResult {
	titleScore := textScore(article.Title, query, 100, 90, 80)
	descriptionMatched := containsFold(article.Description, query)
	contentMatched := containsFold(article.Content, query)
	matchedTags := make([]vo.TagVO, 0)
	tagScore := 0

	for _, tag := range article.Tags {
		score := textScore(tag.Name, query, 70, 60, 50)
		if score == 0 {
			continue
		}
		if score > tagScore {
			tagScore = score
		}

		color := tag.Color
		if color == "" {
			color = defaultTagColor
		}
		matchedTags = append(matchedTags, vo.TagVO{ID: tag.ID, Name: tag.Name, Color: color})
	}

	sort.Slice(matchedTags, func(i, j int) bool {
		return strings.ToLower(matchedTags[i].Name) < strings.ToLower(matchedTags[j].Name)
	})

	score := titleScore
	matchCount := 0
	if titleScore > 0 {
		matchCount++
	}
	if len(matchedTags) > 0 {
		matchCount++
		if tagScore > score {
			score = tagScore
		}
	}
	if descriptionMatched {
		matchCount++
		if score < 40 {
			score = 40
		}
	}
	if contentMatched {
		matchCount++
		if score < 30 {
			score = 30
		}
	}

	item := vo.SearchResultVO{
		ID:           article.ID,
		Type:         vo.SearchResultTypeArticle,
		Title:        article.Title,
		Path:         toPublicPath(article.Path),
		TitleMatched: titleScore > 0,
		Tags:         matchedTags,
	}
	if descriptionMatched {
		item.Description = buildSnippet(article.Description, query, searchSnippetSize, false)
	}
	if contentMatched {
		item.Content = buildSnippet(article.Content, query, searchSnippetSize, true)
	}

	return rankedSearchResult{
		item:       item,
		score:      score,
		matchCount: matchCount,
		updatedAt:  article.UpdatedAt.UnixNano(),
	}
}

func textScore(value string, query string, exact int, prefix int, contains int) int {
	value = strings.ToLower(strings.TrimSpace(value))
	query = strings.ToLower(query)

	if value == query {
		return exact
	}
	if strings.HasPrefix(value, query) {
		return prefix
	}
	if strings.Contains(value, query) {
		return contains
	}
	return 0
}

func containsFold(value string, query string) bool {
	return strings.Contains(strings.ToLower(value), strings.ToLower(query))
}

func buildSnippet(value string, query string, limit int, markdown bool) string {
	normalized := collapseWhitespace(value)
	if markdown {
		cleaned := collapseWhitespace(stripMarkdown(value))
		if containsFold(cleaned, query) {
			normalized = cleaned
		}
	}

	valueRunes := []rune(normalized)
	queryRunes := []rune(strings.ToLower(query))
	lowerRunes := []rune(strings.ToLower(normalized))
	matchIndex := indexRunes(lowerRunes, queryRunes)
	if matchIndex < 0 {
		return truncateRunes(normalized, limit)
	}
	if len(valueRunes) <= limit {
		return normalized
	}

	start := matchIndex - 60
	if start < 0 {
		start = 0
	}
	end := start + limit
	if end < matchIndex+len(queryRunes) {
		end = matchIndex + len(queryRunes)
		start = end - limit
		if start < 0 {
			start = 0
		}
	}
	if end > len(valueRunes) {
		end = len(valueRunes)
		start = end - limit
		if start < 0 {
			start = 0
		}
	}

	prefix := ""
	suffix := ""
	if start > 0 {
		prefix = "…"
	}
	if end < len(valueRunes) {
		suffix = "…"
	}

	return prefix + strings.TrimSpace(string(valueRunes[start:end])) + suffix
}

func stripMarkdown(value string) string {
	value = markdownImagePattern.ReplaceAllString(value, "$1")
	value = markdownLinkPattern.ReplaceAllString(value, "$1")
	value = markdownHTMLPattern.ReplaceAllString(value, " ")
	value = markdownPrefixPattern.ReplaceAllString(value, "")
	return markdownMarkPattern.ReplaceAllString(value, "")
}

func collapseWhitespace(value string) string {
	return strings.TrimSpace(whitespacePattern.ReplaceAllString(value, " "))
}

func truncateRunes(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return strings.TrimSpace(string(runes[:limit])) + "…"
}

func indexRunes(value []rune, query []rune) int {
	if len(query) == 0 || len(query) > len(value) {
		return -1
	}

	for index := 0; index <= len(value)-len(query); index++ {
		matched := true
		for offset := range query {
			if value[index+offset] != query[offset] {
				matched = false
				break
			}
		}
		if matched {
			return index
		}
	}

	return -1
}
