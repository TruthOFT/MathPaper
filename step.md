## 2026-03-25

- 修复 `MathPaperFront/src/App.tsx` 中 MathLive 的错误接入方式，改为通过 `MathfieldElement` 在 React 中挂载数学输入框。
- 重写 `MathPaperFront/src/App.css`，提供可用的公式输入、LaTeX 预览和示例填充样式。
- 说明公式前端统一保存为 LaTeX，便于后端再接 Symja 做表达式等价判断。
