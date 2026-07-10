# Docker 部署步骤

## 1. 本地打包

在项目根目录执行：

```bash
docker compose build && docker compose pull db redis && docker image save $(docker compose config --images) -o blog-images.tar
```

打包完成后，需要上传到服务器：

```txt
blog-images.tar
docker-compose.yml
.env.example
```

## 2. 服务器配置 `.env`

```bash
cp .env.example .env
vim .env
```

## 3. 服务器启动

```bash
cd /opt/blog
docker load -i blog-images.tar
docker compose up -d
```

## 4. 更新部署

重新上传新的 `blog-images.tar` 后执行：

```bash
docker load -i blog-images.tar
docker compose up -d --force-recreate
```
