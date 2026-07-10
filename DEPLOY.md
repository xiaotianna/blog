# Docker 部署步骤

## 1. 本地打包

默认按 `linux/amd64` 架构构建和拉取镜像，适用于常见的 AMD64 Linux 服务器。
在项目根目录执行：

```bash
docker compose build && docker compose pull db redis && docker image save $(docker compose config --images) -o blog-images.tar
```

如需为 ARM64 环境打包，可在 `.env` 中设置：

```dotenv
DOCKER_PLATFORM=linux/arm64
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
