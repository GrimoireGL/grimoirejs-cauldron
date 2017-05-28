# 概要

{{{description}}}

# インストール

```sh
$ npm install {{name}} --save
```

[unpkg.com](https://unpkg.com)によるCDNも利用可能。

** [CDN - {{name}} - ](https://unpkg.com/{{name}}/register/{{short_name}}.js) **

# 一覧

## ノード

{{#if nodes}}
  |ノード名|説明|
  |:-:|:-:|
  {{#each nodes}}
  |[`<{{@key}}>`](#{{@key}}ノード)|{{this.short_description}}|
  {{/each}}
{{else}}
  **このプラグインによって登録されるノードはありません。**  
{{/if}}

## コンポーネント

{{#if components}}
  |コンポーネント名|説明|
  |:-:|:-:|
  {{#each components}}
  |[`<{{@key}}>`](#{{@key}}コンポーネント)|{{this.short_description}}|
  {{/each}}
{{else}}
  **このプラグインによって登録されるコンポーネントはありません。**  
{{/if}}

## コンバーター

{{#if converters}}
  |コンバーター名|説明|
  |:-:|:-:|
  {{#each converters}}
  |[`{{@key}}`](#{{@key}}コンバーター)|{{this.short_description}}|
  {{/each}}
{{else}}
  **このプラグインによって登録されるコンポーネントはありません。**  
{{/if}}

{{#if nodes}}
# ノード詳細

{{#each nodes}}

## {{@key}}ノード

{{#if this.super}}
**継承元:&lt;{{this.super}}&gt;**
{{/if}}

{{this.description}}

### コンポーネント

{{#each this.components}}
* {{this}}
{{/each}}

{{/each}}

{{/if}}

{{#if components}}

# コンポーネント詳細

{{#each components}}

## {{@key}}コンポーネント

{{#if this.super}}
  **継承:{{this.super}}コンポーネント**  
{{/if}}

{{this.description}}

{{#if this.attributes}}
### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
{{#each this.attributes}}
|{{@key}}|{{this.converter}}|{{this.short_description}}|
{{/each}}
{{/if}}

{{#each this.attributes}}

#### {{@key}}属性

**初期値** ・・・ `{{this.default}}`  
**コンバーター** ・・・ `{{this.converter}}`

{{this.description}}

{{/each}}

{{/each}}
{{/if}}

{{#if converters}}

# コンバーター詳細

{{#each converters}}
## {{@key}}コンバーター

{{this.description}}

{{/each}}

{{/if}}
