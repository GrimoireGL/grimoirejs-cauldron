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
  const content = getBraceContent(src, getIndex(src, obj.comment.end + 1, "{"));
  const componentSource = front + content;

  const firstLine = getLine(componentSource, 1);
  const className = firstLine.match(/class +(\w+)/)[1];
  const ret = {
    name: className,
    description: obj.description || "",
    super: obj.super,
    attributes: {}
  };

  const c = comments.parse(componentSource, {});
  const b = {};
  c.forEach(obj => {
    const name = obj.comment.code.match(/(\w+):/)[1];
    b[name] = {
      description: obj.description || "",
    };
  });
  const m = componentSource.search(/static *(?:get)? *(attributes)/gm);
  if (m !== -1) {
    let lastindex = componentSource.indexOf("{", m);


    lastindex = componentSource.indexOf("{", lastindex + 1);

    const a = getBraceContent(componentSource, lastindex);
    console.log(a);
    const atrs = eval(`(${a})`);
    for (let key in atrs) {
      const aaa = atrs[key];
      const o = {};
      for (let key2 in aaa) {
        o[key2] = String(aaa[key2]);
      }
      o.description = b[key] ? b[key].description : "";
      ret.attributes[key] = o;
    }
  }

  return ret;
}

function genConverterDoc(src, comment) {
  const code = comment.comment.code;
  const front = code.substring(0, code.indexOf("{"));
  const content = getBraceContent(src, getIndex(src, comment.comment.end + 1, "{"));
  const converterSrc = front + content;

  const firstLine = getLine(converterSrc, 1);
  const className = firstLine.match(/function +(\w+) *\(/)[1];
  const parameters = {};
  comment.gr_props.forEach(p => {
    parameters[p.type] = p.description || "";
  });

  return {
    name: className,
    description: comment.description || "",
    output: comment.gr_output,
    input: comment.gr_input,
    parameters: parameters
  };
}

function genNodeDoc(src, comment) {
  const code = comment.comment.code;
  const front = code.substring(0, code.indexOf("{"));
  const content = getBraceContent(src, getIndex(src, comment.comment.end + 1, "{"));
  const nodeSource = front + content;
  const c = comments.parse(nodeSource);
  const descMap = {};
  c.forEach(obj => {
    const m = obj.comment.code.match(/["']?([\w-]+)["']? *:/);
    if (m) {
      descMap[m[1]] = obj.description || "";
    }
  });
  const nodeDec = eval(`(${content})`);
  const ret = {};
  for (let key in nodeDec) {
    ret[key] = {
      description: descMap[key] || "",
      super: nodeDec[key].super,
      components: nodeDec[key].components,
      default: nodeDec[key].default
    };
  }
  return ret;
}

function genDoc(filePath, sourceCode) {
  try {
    const a = comments.parse(sourceCode);
    const doc = {
      nodes: [],
      components: [],
      converters: []
    };

    a.forEach(obj => {
      if (obj.gr_component === true) {
        const d = genComponentDoc(sourceCode, obj);
        doc.components.push(d);
      }
      if (obj.gr_converter === true) {
        doc.converters.push(genConverterDoc(sourceCode, obj));
      }
      if (obj.gr_node === true) {
        doc.nodes.push(genNodeDoc(sourceCode, obj));
      }

    });
    console.log(doc);
    return doc;
  } catch (e) {
    console.log(e);
  }
}

async function getTargetFilePathes(targetDir) {
  return await globAsync(path.join(targetDir, argv.ts ? "**/*.ts" : "**/*.js"));
}

async function main() {
  const ext = argv.ts ? ".ts" : ".js"
  const nodesPath = argv.nodes || `src/nodes${ext}`;
  const dest = argv.dest || "doc";
  const cwd = process.cwd();
  // const destFileLocation = path.resolve(path.join(cwd, argv.dest));
  // const mainFileLocation = path.resolve(path.join(cwd, argv.main));
  const basePath = path.join(cwd, argv.src);

  const projName = JSON.parse(await readFileAsync(path.join(cwd, "package.json"))).name;
  const grdoc = {
    name: projName,
    nodes: [],
    components: [],
    converters: []
  };

  // node document generate.
  // const nodes2 = await readFileAsync(path.join(cwd, nodesPath));
  // const nodeDoc =genNodeDoc(nodes2);
  // console.log(nodeDoc);
  // return;
  const detectedFiles = await getTargetFilePathes(path.join(cwd, argv.src));
  // console.log(detectedFiles);


  for (var i = 0; i < detectedFiles.length; i++) {
    const file = detectedFiles[i];
    console.log("parsing...:" + file);
    const rel = path.relative(cwd, file);
    const replace = rel.replace(/[^\/]+\//, dest + "/");
    // console.log(replace);
    const content = await readFileAsync(file);
    const doc = genDoc(file, content);
    doc.nodes.forEach(n => {
      grdoc.nodes.push(n);
    });
    doc.components.forEach(c => {
      grdoc.components.push(c);
    });
    doc.converters.forEach(c => {
      grdoc.converters.push(c);
    });
    writeFileAsync(replace, JSON.stringify(doc, null, "\t"));
  }

  writeFileAsync(path.join(cwd, "grdoc.json"), JSON.stringify(grdoc, null, "\t"));
}


main();
