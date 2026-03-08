# 🚀 GitHub Pages 部署指南

本文档说明如何将 PrismUI Demo 应用部署到 GitHub Pages。

## 📋 前置条件

- GitHub 仓库已创建
- 代码已推送到 `main` 或 `runtime-v2` 分支
- GitHub Actions 已启用

## 🔧 配置步骤

### 1. 启用 GitHub Pages

1. 访问仓库设置：`https://github.com/medxaidev/prismui/settings/pages`
2. 在 **Source** 部分，选择：
   - Source: **GitHub Actions**
3. 保存设置

### 2. 触发部署

部署会在以下情况自动触发：

- 推送到 `main` 或 `runtime-v2` 分支
- 修改了以下路径的文件：
  - `packages/demo/**`
  - `packages/core/src/**`
  - `packages/react/src/**`
  - `.github/workflows/deploy-demo.yml`

或者手动触发：

1. 访问 Actions 页面：`https://github.com/medxaidev/prismui/actions`
2. 选择 **Deploy Demo to GitHub Pages** 工作流
3. 点击 **Run workflow**
4. 选择分支并运行

### 3. 查看部署状态

1. 访问 Actions 页面查看构建进度
2. 等待构建和部署完成（通常 2-3 分钟）
3. 部署成功后，访问：**https://medxaidev.github.io/prismui/**

## 📁 文件说明

### `.github/workflows/deploy-demo.yml`
GitHub Actions 工作流配置文件，负责：
- 安装依赖
- 构建 `@prismui/core` 和 `@prismui/react`
- 构建 Demo 应用
- 部署到 GitHub Pages

### `packages/demo/vite.config.ts`
Vite 配置文件，包含：
```typescript
base: '/prismui/'  // GitHub Pages 子路径
```

### `packages/demo/public/.nojekyll`
空文件，告诉 GitHub Pages 不要使用 Jekyll 处理文件（避免忽略 `_` 开头的文件）。

## 🔍 本地测试

在推送前，可以本地测试构建：

```bash
# 构建所有包
npm run build

# 预览 Demo（模拟生产环境）
cd packages/demo
npm run preview
```

访问 `http://localhost:4173/prismui/` 查看效果。

## 🐛 故障排查

### 部署失败

1. 检查 Actions 日志查看错误信息
2. 确认所有依赖已正确安装
3. 确认 `npm run build` 在本地可以成功执行

### 页面显示 404

1. 确认 GitHub Pages 设置中 Source 为 **GitHub Actions**
2. 确认 `vite.config.ts` 中 `base: '/prismui/'` 配置正确
3. 等待几分钟让 DNS 生效

### 资源加载失败

1. 检查浏览器控制台的错误信息
2. 确认所有资源路径都使用了正确的 base path
3. 确认 `.nojekyll` 文件存在于 `public/` 目录

## 🔄 更新部署

每次推送代码到 `main` 或 `runtime-v2` 分支时，如果修改了相关文件，GitHub Actions 会自动重新部署。

## 📊 监控

- **Actions 页面**：https://github.com/medxaidev/prismui/actions
- **Live Demo**：https://medxaidev.github.io/prismui/
- **部署环境**：https://github.com/medxaidev/prismui/deployments

## 🎯 自定义域名（可选）

如果想使用自定义域名（如 `demo.prismui.dev`）：

1. 在仓库设置的 Pages 部分添加自定义域名
2. 在 DNS 提供商处添加 CNAME 记录指向 `medxaidev.github.io`
3. 修改 `vite.config.ts` 中的 `base: '/'`
4. 重新部署

## 📝 注意事项

- GitHub Pages 有 1GB 的存储限制
- 每月有 100GB 的带宽限制
- 构建产物会存储在 `gh-pages` 分支（由 Actions 自动管理）
- 不要手动修改 `gh-pages` 分支

## 🔗 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
