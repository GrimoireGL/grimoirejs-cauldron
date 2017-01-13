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
  |[`<{{@key}}>`](#{{@key}}ノード)|{{this.short_description}}
  {{/each}}
{{else}}
  **このプラグインによって登録されるノードはありません。**  
{{/if}}

### コンポーネント

{{#if components}}
  |コンバーター名|説明|
  |:-:|:-:|
  {{#each converters}}
  |[`<{{@key}}>`](#{{@key}}コンポーネント)|{{this.short_description}}
  {{/each}}
{{else}}
  **このプラグインによって登録されるコンポーネントはありません。**  
{{/if}}

### コンバーター

{{#if converters}}
  |ノード名|説明|
  |:-:|:-:|
  {{#each components}}
  |[`<{{@key}}>`](#{{@key}}コンバーター)|{{this.short_description}}
  {{/each}}
{{else}}
  **このプラグインによって登録されるコンポーネントはありません。**  
{{/if}}

{{#if nodes}}
## ノード詳細

{{#each nodes}}

### {{@key}}ノード

{{this.description}}

{{/each}}

{{/if}}

{{#if components}}

## コンポーネント詳細

{{#each components}}

### {{@key}}コンポーネント

{{/each}}
{{/if}}

{{#if converters}}

## コンバーター詳細

{{/if}}
