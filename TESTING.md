# Vitest 测试配置说明

## 安装依赖

首先安装所有依赖：

```bash
npm install
```

## 配置文件说明

### 1. `package.json`

已添加以下测试相关的依赖和脚本：

**依赖包：**
- `vitest` - 测试框架
- `@vitest/ui` - 测试 UI 界面
- `@vitest/coverage-v8` - 代码覆盖率
- `@testing-library/react` - React 组件测试工具
- `@testing-library/jest-dom` - DOM 断言扩展
- `@testing-library/user-event` - 用户交互模拟
- `jsdom` - DOM 环境模拟
- `@vitejs/plugin-react` - React 支持插件

**测试脚本：**
- `npm test` - 运行测试（watch 模式）
- `npm run test:ui` - 打开测试 UI 界面
- `npm run test:coverage` - 生成测试覆盖率报告
- `npm run typecheck` - TypeScript 类型检查

### 2. `vitest.config.ts`

Vitest 主配置文件，包含：

- **React 插件支持** - 通过 `@vitejs/plugin-react`
- **全局测试 API** - `globals: true` 无需导入 `describe`、`test` 等
- **JSDOM 环境** - 模拟浏览器环境
- **CSS 支持** - `css: true` 支持 CSS Modules
- **路径别名** - `@prismui/core` 和 `@prismui/react`
- **覆盖率配置** - 排除测试文件、stories、demo 等
- **测试文件匹配** - `packages/**/*.{test,spec}.{ts,tsx}`

### 3. `vitest.setup.ts`

测试环境设置文件，包含：

- **自动清理** - 每个测试后自动清理 DOM
- **jest-dom 扩展** - 提供 `toBeInTheDocument()` 等断言
- **全局 Mock**：
  - `window.matchMedia` - 媒体查询
  - `ResizeObserver` - 尺寸观察器
  - `IntersectionObserver` - 交叉观察器

### 4. `tsconfig.json`

TypeScript 配置更新：

- **类型定义** - 添加 `vitest/globals`、`@testing-library/jest-dom`、`node`
- **路径别名** - 配置 `@prismui/core` 和 `@prismui/react` 路径映射
- **baseUrl** - 设置为 `.` 支持路径解析

## 编写测试示例

### 基础组件测试

```typescript
// packages/core/src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### 使用 Provider 的测试

```typescript
import { render } from '@testing-library/react';
import { PrismuiProvider } from '@prismui/core';

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <PrismuiProvider>{ui}</PrismuiProvider>
  );
}

test('component with theme', () => {
  renderWithProvider(<YourComponent />);
  // 测试逻辑
});
```

### Snapshot 测试

```typescript
test('matches snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container.firstChild).toMatchSnapshot();
});
```

## 运行测试

```bash
# Watch 模式（推荐开发时使用）
npm test

# 单次运行
npm test -- --run

# 运行特定文件
npm test Button.test.tsx

# 打开 UI 界面
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

## 覆盖率报告

运行 `npm run test:coverage` 后，覆盖率报告会生成在 `coverage/` 目录：

- `coverage/index.html` - HTML 格式报告
- `coverage/coverage-final.json` - JSON 格式数据

## Monorepo 注意事项

1. **路径别名** - 使用 `@prismui/core` 和 `@prismui/react` 导入，无需相对路径
2. **测试隔离** - 每个 package 的测试相互独立
3. **共享配置** - 根目录的配置适用于所有 packages
4. **排除 demo** - demo 包被排除在测试之外

## 常见问题

### TypeScript 错误

当前的 TypeScript 错误是因为依赖尚未安装。运行 `npm install` 后会自动解决。

### CSS Modules

Vitest 原生支持 CSS Modules，无需额外配置。

### ESM 模式

项目使用 ESM 模式（`"type": "module"`），因此：
- 使用 `import.meta.url` 代替 `__dirname`
- 所有导入必须包含文件扩展名（在配置中已处理）

## 最佳实践

1. **测试文件命名** - 使用 `*.test.tsx` 或 `*.spec.tsx`
2. **测试组织** - 使用 `describe` 分组相关测试
3. **清晰的测试名** - 测试名应描述预期行为
4. **避免实现细节** - 测试用户可见的行为，而非内部实现
5. **使用 Testing Library** - 优先使用 `screen` 查询，避免 `container` 查询
