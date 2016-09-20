# Cauldron
> A builder for grimoirejs related packages.

## What this package would do?

* Build (= compile + bundling + (babel) + (minify))
* Scaffolding
* Server for local environment
* Document generation

This package would provide you any tasks you need to use your code with grimoire.js.

## Tasks

These tasks can take some of arguments. You can see all of these documents by using `cauldron <cmd> --help`.

### cauldron build

Build the project and generate bundled javascript and sourcemap.

### cauldron server

Start debug server for current project.

### cauldron scaffold

Generate the files used commonly in grimoire.js.

### cauldron doc

Generate document files from component source codes.

## Configurations

All of the configurations this pacakge would load is placed on package.json.

You needs to put something like below into root element of the package.json.

```
"grimoire": {
  "ts": {
    "lib": "./lib",
    "temp": "./lib-ts",
    "src": "./src"
  },
  "main": "index.ts",
  "test":{
    "src":"./test",
    "temp":"./lib-test"
  }
  "out": {
    "es6": "./product/grimoire.es2016.js",
    "es5": "./product/grimoire.js"
  },
  "txt-exts": [
    ".glsl",
    ".html"
  ],
  "doc": {
    "src": "./doc",
    "header": "./doc/header.md",
    "footer": "./doc/footer.md",
    "dest": "./lib-md/index.md"
  },
  "namespace": "HTTP://GRIMOIRE.GL/NS/DEFAULT",
  "dependencies":[]
}
```

### Typescript compiling configurations

You can specify the directories which would be used for typescript compiling.
Cauldron builder would perform compiling as below.

* Copy all of the source files(located in the folder specified in `ts.src`) into the folder specified in `ts.temp`
* Generate file list(entry_files) to be compiled with tsc in `ts.temp`.
* Inject some of codes into the file specified in `main`.
* Compile them and generate js,map and d.ts in the folder specified in `ts.lib`.

The lib folder should be `./lib` for plugin users not to confuse to use internal files of your package.

### Bundling configurations

After the typescript compiling, couldron perform bundling to generated js files.
The bundled js file would be generated in `out.es6`.

**NOTE: that is just es6 bundled code which would not work on not modern browsers**

### Babel configurations

If you needs to support legacy browsers like IE. You need to specify `--babel` flag with build task.

Only when this flag was provided with build task, cauldron would generate es5 javascript file located in `out.es5`.

### txt2js configurations

Cauldron can transform text files into typescript files to be able to be imported easily from typescript source file.

However this feature would only works for the files having extensions specified in `txt-exts` configuration.
