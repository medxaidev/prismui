import { defineConfig } from 'vite';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取项目根目录（确保 hash 稳定性）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig({
  css: {
    modules: {
      // 类名生成规则
      generateScopedName: (name, filename, css) => {
        // 开发环境：可读性优先
        if (process.env.NODE_ENV === 'development') {
          const componentName = filename
            .split('/')
            .pop()
            ?.replace('.module.css', '');
          return `prismui-${componentName}-${name}`;
        }
        // 生产环境：最小化（使用项目根目录确保 hash 确定性）
        const relativePath = path.relative(projectRoot, filename);
        const hash = createHash('md5')
          .update(relativePath + name)
          .digest('hex')
          .substring(0, 6);
        return `p-${hash}`;
      },
      // 驼峰命名转换
      localsConvention: 'camelCaseOnly',
    },
  },
  define: {
    // 组件库开发环境必须设置（启用 Runtime 验证）
    'process.env.PRISMUI_DEV': JSON.stringify(true),
  },
});