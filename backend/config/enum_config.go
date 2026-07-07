package config

import (
	"blog/entities"

	"gorm.io/gorm"
)

type PgEnum struct {
	Name   string
	Values []string
}

var PgEnums = []PgEnum{
	{
		Name: "article_status",
		Values: []string{
			string(entities.ArticleStatusPublish),
			string(entities.ArticleStatusPrivate),
			string(entities.ArticleStatusDraft),
		},
	},
}

func InitEnums(db *gorm.DB) error {
	for _, enum := range PgEnums {
		values := ""
		for i, value := range enum.Values {
			if i > 0 {
				values += ", "
			}
			values += "'" + value + "'"
		}

		sql := `
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '` + enum.Name + `') THEN
		CREATE TYPE ` + enum.Name + ` AS ENUM (` + values + `);
	END IF;
END
$$;
`

		if err := db.Exec(sql).Error; err != nil {
			return err
		}
	}

	return nil
}
