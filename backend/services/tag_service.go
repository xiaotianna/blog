package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const defaultTagColor = "#60a5fa"

var tagColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

type TagService struct{}

var Tag = TagService{}

func (TagService) Create(ctx context.Context, req dto.CreateTagRequest) (*vo.TagVO, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("标签名称不能为空")
	}

	color := strings.TrimSpace(req.Color)
	if color == "" {
		color = defaultTagColor
	}
	if !tagColorPattern.MatchString(color) {
		return nil, errors.New("标签颜色不合法")
	}
	color = strings.ToLower(color)

	if _, err := dao.Tag.FindByName(ctx, name); err == nil {
		return nil, errors.New("标签已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	tag := &entities.TagEntity{
		Name:  name,
		Color: color,
	}
	if err := dao.Tag.Create(ctx, tag); err != nil {
		if isTagUniqueError(err) {
			return nil, errors.New("标签已存在")
		}

		return nil, err
	}

	return tagToVO(*tag), nil
}

func isTagUniqueError(err error) bool {
	message := err.Error()

	return strings.Contains(message, "duplicate key value") &&
		strings.Contains(message, "tag")
}

func (TagService) Options(ctx context.Context) ([]vo.TagVO, error) {
	tags, err := dao.Tag.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]vo.TagVO, 0, len(tags))
	for _, tag := range tags {
		res = append(res, *tagToVO(tag))
	}

	return res, nil
}

func (TagService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateTagRequest) (*vo.TagVO, error) {
	tag, err := dao.Tag.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("标签名称不能为空")
	}

	color := strings.TrimSpace(req.Color)
	if color == "" {
		color = defaultTagColor
	}
	if !tagColorPattern.MatchString(color) {
		return nil, errors.New("标签颜色不合法")
	}
	color = strings.ToLower(color)

	if existing, err := dao.Tag.FindByName(ctx, name); err == nil && existing.ID != tag.ID {
		return nil, errors.New("标签已存在")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	tag.Name = name
	tag.Color = color
	if err := dao.Tag.Update(ctx, tag); err != nil {
		if isTagUniqueError(err) {
			return nil, errors.New("标签已存在")
		}

		return nil, err
	}

	return tagToVO(*tag), nil
}

func tagToVO(tag entities.TagEntity) *vo.TagVO {
	color := tag.Color
	if color == "" {
		color = defaultTagColor
	}

	return &vo.TagVO{
		ID:    tag.ID,
		Name:  tag.Name,
		Color: color,
	}
}
