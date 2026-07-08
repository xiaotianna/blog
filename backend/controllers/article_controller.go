package controllers

import "blog/services"

type ArticleController struct {
	service services.ArticleService
}

var Article = ArticleController{
	service: services.Article,
}

func (article ArticleController) Create() {

}
