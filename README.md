# monaco-json-studio-base

Shared core engine, region builders (`header/`, `body/`, `footer/`), and browser Monaco runtime for the Monaco JSON Studio suite (`single`, `double`, `triple`).

- **npm**: [https://www.npmjs.com/package/monaco-json-studio-base](https://www.npmjs.com/package/monaco-json-studio-base)
- **Suite Story & Docs**: [https://keshavsoft.github.io/monaco-json-studio-docs/base.html](https://keshavsoft.github.io/monaco-json-studio-docs/base.html)
- **Repo Docs**: [./docs/index.html](./docs/index.html) | [https://keshavsoft.github.io/monaco-json-studio-base/](https://keshavsoft.github.io/monaco-json-studio-base/)

## Why It Exists

Keeping Monaco loading, CSS, HTML builders, and `dom-primitive-bindings` in a pane-count-agnostic base package lets `single`, `double`, and `triple` focus purely on layout ergonomics without duplicating core code.

## Install

```bash
npm install monaco-json-studio-base
```

## Usage

```js
import { generateStudio } from 'monaco-json-studio-base';

generateStudio({
  title: 'My Studio',
  outputDir: './my-studio',
  panes: [
    { key: 'pane1', label: 'Pane 1', header: 'file-picker', body: 'monaco', footer: 'cursor' }
  ]
});
```
