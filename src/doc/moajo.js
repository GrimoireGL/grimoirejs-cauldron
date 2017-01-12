import path from 'path';
import comments from 'js-comments';

import {
  argv
} from "yargs";

import {
  globAsync,
  readFileAsync,
  templateAsync,
  writeFileAsync
} from "../async-helper";

function getBraceEndPos(source, openPos) {
  let depth = 0;
  for (let i = openPos; i < source.length; i++) {
    if (source[i] == "{") {
      depth++;
      continue;
    }
    if (source[i] == "}") {
      depth--;
    }
    if (depth === 0) {
      return i;
    }
  }
}

function getBraceContent(source, openPos) {
  const end = getBraceEndPos(source, openPos);
  return source.substring(openPos, end + 1);
}

function getIndex(source, line, target) {
  let currentLine = 1;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") {
      currentLine++;
      continue;
    }
    if (currentLine === line && source[i] === target) {
      return i;
    }
  }
}

function getLine(source, line) {
  let currentLine = 1;
  let s = 0;
  for (let i = 0; i < source.length; i++) {
    if (currentLine === line && source[i] === "\n") {
      return source.substring(s, i);
    }
    if (source[i] === "\n") {
      currentLine++;
      continue;
    }
  }
}

function genComponentDoc(src, obj) {
  const code = obj.comment.code;
  const front = code.substring(0, code.indexOf("{"));
  const startLine = obj.comment.end + 1;
  const index = getIndex(src, startLine, "{");
  const content = getBraceContent(src, index);
  const componentSource = front + content;

  const firstLine = getLine(componentSource, 1);
  const className = firstLine.match(/class +(\w+)/)[1];
  const c = comments.parse(componentSource, {});

  const attrs = [];
  c.forEach(obj => {
    if (obj.gr_attribute) {
      const name = obj.comment.code.match(/(\w+):/)[1];
      attrs.push({
        name: name,
        description: obj.description || "",
        converter: obj.converter,
        default: obj.default
      });
    } else {
      const m = obj.comment.code.match(/^\$(\w+)\(/);
      if (m) {
        const reciever = m[1];
        // console.log(reciever);
      }
    }
  });

  return {
    name: className,
    description: obj.description,
    super: obj.super,
    attributes: attrs
  };
}

function genConverterDoc(src, comment) {
  console.log(comment);
  const code = comment.comment.code;
  const front = code.substring(0, code.indexOf("{"));
  const content = getBraceContent(src, getIndex(src, comment.comment.end + 1, "{"));
  const converterSrc = front + content;

  const firstLine = getLine(converterSrc, 1);
  const className = firstLine.match(/class +(\w+)/)[1];
  const c = comments.parse(converterSrc, {});
  const parameters = {};

  c.forEach(obj => {
    if (obj.gr_converter_prop === true) {
      const name = obj.comment.code.match(/"(\w+)"/)[1];
      parameters[name] = obj.description;
    }
  });
  return {
    name: className,
    description: comment.description,
    output: comment.gr_output,
    input: comment.gr_input,
    parameters: parameters
  };
}

function genNodeDoc(src, comment) {
  const code = comment.comment.code;
  const front = code.substring(0, code.indexOf("{"));
  const startLine = comment.comment.end + 1;
  const index = getIndex(src, startLine, "{");
  const content = getBraceContent(src, index);
  const nodeSource = front + content;
  // console.log(nodeSource)
  const nodeDec = eval(nodeSource);

  return {
    name: nodeDec.name,
    description: comment.description,
    super: nodeDec.super,
    components: nodeDec.components,
    default: nodeDec.default
  };
}

function genDoc(sourceCode) {
  try {
    const a = comments.parse(sourceCode, {});
    const components = [];
    const converters = [];
    const nodes = [];

    a.forEach(obj => {
      if (obj.gr_component === true) {
        const d = genComponentDoc(sourceCode, obj);
        components.push(d);
      }
      if (obj.gr_converter === true) {
        converters.push(genConverterDoc(sourceCode, obj));
      }
      if (obj.gr_node === true) {
        nodes.push(genNodeDoc(sourceCode, obj));
      }

    });
    return {
      nodes: nodes,
      components: components,
      converters: converters
    };
  } catch (e) {
    console.log(e);
  }
}

async function getTargetFilePathes(targetDir) {
  return await globAsync(path.join(targetDir, argv.ts ? "**/*.ts" : "**/*.js"));
}

async function main() {
  const dest = argv.dest || "doc";
  const cwd = process.cwd(); // current working directory
  // const destFileLocation = path.resolve(path.join(cwd, argv.dest));
  // const mainFileLocation = path.resolve(path.join(cwd, argv.main));
  const basePath = path.join(cwd, argv.src);
  const packageJson = await readFileAsync(path.join(cwd, "package.json"));
  const projName = JSON.parse(packageJson).name;
  console.log(`packageName: ${projName}`);

  const detectedFiles = await getTargetFilePathes(path.join(cwd, argv.src));
  // console.log(detectedFiles);
  const nodes = [];
  const components = [];
  const converters = [];


  for (var i = 0; i < detectedFiles.length; i++) {
    const file = detectedFiles[i];
    console.log("parsing...:" + file);
    const rel = path.relative(cwd, file);
    // console.log(rel);
    const replace = rel.replace(/[^\/]+\//, dest + "/");
    // console.log(replace);
    const content = await readFileAsync(file);
    const doc = genDoc(content);
    console.log(doc);
    doc.nodes.forEach(n => {
      nodes.push(n);
    });
    doc.components.forEach(c => {
      components.push(c);
    });
    doc.converters.forEach(c => {
      converters.push(c);
    });
    writeFileAsync(replace, JSON.stringify(doc, null, "\t"));
  }

  const grdoc = {
    name: projName,
    nodes: nodes,
    components: components,
    converters: converters
  };
  writeFileAsync(path.join(cwd, "grdoc.json"), JSON.stringify(grdoc, null, "\t"));
}


main();
