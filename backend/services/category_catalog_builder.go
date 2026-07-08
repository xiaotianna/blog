package services

import (
	"blog/entities"
	"blog/vo"
	"errors"
	"time"

	"github.com/google/uuid"
)

type categoryCatalogNode struct {
	ID          uuid.UUID
	Type        vo.CategoryCatalogNodeType
	Title       string
	Slug        string
	Description string
	ParentID    *uuid.UUID
	CategoryID  *uuid.UUID
	PublishedAt *time.Time
	Children    []*categoryCatalogNode
}

// 创建文章节点
func newCategoryCatalogArticleNode(article entities.ArticleEntity) *categoryCatalogNode {
	categoryID := article.CategoryID

	return &categoryCatalogNode{
		ID:          article.ID,
		Type:        vo.CategoryCatalogNodeTypeArticle,
		Title:       article.Title,
		Slug:        article.Slug,
		Description: article.Description,
		CategoryID:  &categoryID,
		PublishedAt: article.PublishedAt,
	}
}

func buildCategoryCatalog(
	categories []entities.CategoryEntity,
	articles []entities.ArticleEntity,
) ([]vo.CategoryCatalogVO, error) {
	nodeMap := make(map[uuid.UUID]*categoryCatalogNode, len(categories))
	roots := make([]*categoryCatalogNode, 0)

	for _, category := range categories {
		nodeMap[category.ID] = newCategoryCatalogCategoryNode(category)
	}

	for _, category := range categories {
		node := nodeMap[category.ID]

		if category.ParentID == nil {
			roots = append(roots, node)
			continue
		}

		parent, ok := nodeMap[*category.ParentID]
		if !ok {
			return nil, errors.New("目录数据异常：父级目录不存在")
		}

		parent.Children = append(parent.Children, node)
	}

	for _, article := range articles {
		parent, ok := nodeMap[article.CategoryID]
		if !ok {
			continue
		}

		parent.Children = append(parent.Children, newCategoryCatalogArticleNode(article))
	}

	return toCategoryCatalogVOList(roots), nil
}

// 创建目录节点
func newCategoryCatalogCategoryNode(category entities.CategoryEntity) *categoryCatalogNode {
	return &categoryCatalogNode{
		ID:          category.ID,
		Type:        vo.CategoryCatalogNodeTypeCategory,
		Title:       category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		ParentID:    category.ParentID,
		Children:    []*categoryCatalogNode{},
	}
}

// 递归转换
func toCategoryCatalogVOList(nodes []*categoryCatalogNode) []vo.CategoryCatalogVO {
	res := make([]vo.CategoryCatalogVO, 0, len(nodes))

	for _, node := range nodes {
		res = append(res, toCategoryCatalogVO(node))
	}

	return res
}

func toCategoryCatalogVO(node *categoryCatalogNode) vo.CategoryCatalogVO {
	return vo.CategoryCatalogVO{
		ID:          node.ID,
		Type:        node.Type,
		Title:       node.Title,
		Slug:        node.Slug,
		Description: node.Description,
		ParentID:    node.ParentID,
		CategoryID:  node.CategoryID,
		PublishedAt: node.PublishedAt,
		Children:    toCategoryCatalogVOList(node.Children),
	}
}
