## 概要

{{{description}}}

## インストール

```sh
$ npm install {{name}} --save
```

[unpkg.com](https://unpkg.com)によるCDNも利用可能。

** [CDN - {{name}} - ](https://unpkg.com/{{name}}/register/{{short_name}}.js) **

## 一覧

### ノード

{{#if nodes}}
  |ノード名|説明|
  |:-:|:-:|
  {{#each nodes}}
  |`<{{@key}}>`|{{this.short_description}}
  {{/each}}
{{else}}
  **このプラグインによって登録されるノードはありません。**  
{{/if}}

### コンポーネント

{{#if components}}
  |コンバーター名|説明|
  |:-:|:-:|
  {{#each converters}}
  |`<{{@key}}>`|{{this.short_description}}
  {{/each}}
{{else}}
  **このプラグインによって登録されるコンポーネントはありません。**  
{{/if}}

### コンバーター

{{#if converters}}
  |ノード名|説明|
  |:-:|:-:|
  {{#each components}}
  |`<{{@key}}>`|{{this.short_description}}
  {{/each}}
{{else}}
  **このプラグインによって登録されるコンポーネントはありません。**  
{{/if}}
