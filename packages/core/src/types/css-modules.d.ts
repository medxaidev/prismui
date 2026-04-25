declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

// Plain stylesheet side-effect imports (v0.4.1 ripple-feedback.css pattern):
//   `import './ripple-feedback.css';`
// These carry no exports — bundlers route them through their CSS pipeline,
// TypeScript only needs to know the module exists.
declare module '*.css';
