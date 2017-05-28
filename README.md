# Cauldron
> A build environment supoorter for Grimoire.js

## What this package would do?

* Build (= compile + bundling + (babel) + (minify))
* Scaffolding
* Document generation

This package would provide you any tasks you need to use your code with grimoire.js.

## Installation

You can install cauldron by npm or yarn.

### With npm

```sh
$ npm install grimoirejs-cauldron -g
```

### With yarn

```sh
$ yarn global add grimoirejs-cauldron
```

## Tasks

These tasks can take some of arguments. You can see all of these documents by using `cauldron <cmd> --help`.

### cauldron init

Generate project template from ts-boilerplate. (https://github.com/GrimoireGL/ts-boilerplate)

### cauldron scaffold

Generate the files used commonly in grimoire.js.

#### Scaffolding component

```sh
$ cauldron scaffold -t component -n <NAME OF YOUR COMPONENT>
```

#### Scaffolding converter

```sh
$ cauldron scaffold -t converter -n <NAME OF YOUR CONVERTER>
```

### cauldron doc

Generate document files from component source codes.

see [guide](https://grimoire.gl/guide/2_advanced/plugin-specification.html) for more information.
