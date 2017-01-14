import path from 'path';
import comments from 'js-comments';

import {
  argv
} from "yargs";

import {
  globAsync,
  readFileAsync
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
  return source.split("\n")[line - 1];
}

function checkComponentDec(line) {
  return /class \w+Component/.test(line);
}

function checkConverterDec(line) {
  return /function +\w+Converter/.test(line);
}

function checkPathIsComponent(filePath) {
  const cwd = process.cwd();
  const rel = path.relative(path.join(cwd, argv.src), filePath);
  return !rel.startsWith(".") && filePath.indexOf("/Components/") !== -1 && path.basename(filePath).indexOf("Component.") !== -1;
}

function checkPathIsConverter(filePath) {
  const cwd = process.cwd();
  const rel = path.relative(path.join(cwd, argv.src), filePath);
  return !rel.startsWith(".") && filePath.indexOf("/Converters/") !== -1 && path.basename(filePath).indexOf("Converter.") !== -1;
}

function checkPathIsNode(filePath) {
  const cwd = process.cwd();
  const rel = path.relative(path.join(cwd, argv.src), filePath);
  return rel.startsWith("nodes.");
}

function findFirstLine(src, predicate) {
  const lines = src.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length; i++) {
    if (predicate(lines[i])) {
      return {
        line: i,
        content: lines[i]
      };
    }
  }
  return null;
}

function getSource(src, startLine) {
  const code = getLine(src, startLine);
  const front = code.substring(0, code.indexOf("{"));
  const content = getBraceContent(src, getIndex(src, startLine, "{"));
  return front + content;
}

function genComponentDoc(src) {
  const componentDecs = comments.parse(src).filter(c => checkComponentDec(c.comment.code));
  if (componentDecs.length === 1) { // find description comment.
    const c = componentDecs[0];
    const d = parseComponentSource(getSource(src, c.comment.end + 1));
    d.content.description = c.description || "";
    d.content.super = c.super;
    return d;
  } else { // no description comment.
    const dec = findFirstLine(src, l => checkComponentDec(l));
    if (dec) {
      const componentSource = getSource(src, dec.line + 1);
      const d = parseComponentSource(componentSource);
      d.content.description = "";
      return d;
    }
  }
}

function parseComponentSource(componentSource) {
  const firstLine = getLine(componentSource, 1);
  const className = firstLine.match(/class +(\w+)/)[1];

  const ret = {
    attributes: {}
  };

  // attribute eval parsing.
  const m = componentSource.search(/static *(?:get)? *(attributes)/gm);
  if (m !== -1) {
    let lastindex = componentSource.indexOf("{", m);
    lastindex = componentSource.indexOf("{", lastindex + 1);

    const a = getBraceContent(componentSource, lastindex);

    // get comments
    const b = {};
    comments.parse(a).forEach(obj => {
      const name = obj.comment.code.match(/["']?([\w-]+)["']? *:/)[1];
      b[name] = {
        description: obj.description || "",
      };
    });

    // source eval
    try {
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
    } catch (e) {
      // console.log(e);
      console.warn("attribute cant parse: " + className);
    }
  }
  return {
    name: className,
    content: ret
  };
}

function genConverterDoc(src) {
  const converterDecs = comments.parse(src).filter(c => checkConverterDec(c.comment.code));
  if (converterDecs.length === 1) { // find desc.
    const c = converterDecs[0];
    const d = parseConverterSource(getSource(src, c.comment.end + 1));
    d.content.description = c.description || "";
    d.content.output = c.gr_output;
    d.content.input = c.gr_input;
    d.content.parameters = {};
    if (c.gr_props) {
      c.gr_props.forEach(p => {
        d.content.parameters[p.type] = p.description || "";
      });
    }
    return d;
  } else {
    const dec = findFirstLine(src, l => checkConverterDec(l));
    if (dec) {
      const d = parseConverterSource(getSource(src, dec.line + 1));
      d.content.description = "";
      return d;
    }
  }
}

function parseConverterSource(converterSrc) {
  const firstLine = getLine(converterSrc, 1);
  const className = firstLine.match(/function +(\w+) *\(/)[1];

  return {
    name: className,
    content: {}
  }
}

function genNodeDoc(src) {
  const nodeDecs = comments.parse(src).filter(c => /export *default *\{/.test(c.comment.code));
  if (nodeDecs.length === 1) { // find desc.
    const c = nodeDecs[0];
    return parseNodeSource(getBraceContent(src, getIndex(src, c.comment.end + 1, "{")));
  } else {
    const dec = findFirstLine(src, l => /export *default *\{/.test(l));
    if (dec) {
      return parseNodeSource(getBraceContent(src, getIndex(src, dec.line + 1, "{")));
    }
  }
}

function parseNodeSource(nodeSource) {
  const c = comments.parse(nodeSource);
  const descMap = {};
  c.forEach(obj => {
    const m = obj.comment.code.match(/["']?([\w-]+)["']? *:/);
    if (m) {
      descMap[m[1]] = obj.description || "";
    }
  });
  const nodeDec = eval(`(${nodeSource})`);
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
    const doc = {
      nodes: {},
      components: {},
      converters: {}
    };
    if (checkPathIsComponent(filePath)) {
      const d = genComponentDoc(sourceCode);
      if (d) {
        doc.components[d.name] = d.content;
      }
    } else if (checkPathIsConverter(filePath)) {
      const d = genConverterDoc(sourceCode);
      if (d) {
        doc.converters[d.name] = d.content;
      }
    } else if (checkPathIsNode(filePath)) {
      const d = genNodeDoc(sourceCode);
      if (d) {
        for (let key in d) {
          doc.nodes[key] = d[key];
        }
      }
    } else {
      const a = comments.parse(sourceCode);
      a.forEach(obj => {
        if (obj.gr_component === true) {
          const d = genComponentDoc(sourceCode);
          if (d) {
            doc.components[d.name] = d.content;
          }
        }
        if (obj.gr_converter === true) {
          const d = genConverterDoc(sourceCode);
          if (d) {
            doc.converters[d.name] = d.content;
          }
        }
        if (obj.gr_node === true) {
          const d = genNodeDoc(sourceCode);
          if (d) {
            for (let key in d) {
              doc.nodes[key] = d[key];
            }
          }
        }
      });
    }
    return doc;
  } catch (e) {
    console.error(e);
  }
}

async function getTargetFilePathes(targetDir) {
  return await globAsync(path.join(targetDir, argv.ts ? "**/*.ts" : "**/*.js"));
}

async function main() {
  try {
    const cwd = process.cwd();
    const projName = JSON.parse(await readFileAsync(path.join(cwd, "package.json"))).name;
    const grdoc = {
      name: projName,
      nodes: {},
      components: {},
      converters: {}
    };

    const detectedFiles = await getTargetFilePathes(path.join(cwd, argv.src));
    for (var i = 0; i < detectedFiles.length; i++) {
      const file = detectedFiles[i];
      const content = await readFileAsync(file);
      const doc = genDoc(file, content);
      for (let key in doc.nodes) {
        grdoc.nodes[key] = doc.nodes[key];
      }
      for (let key in doc.components) {
        grdoc.components[key] = doc.components[key];
      }
      for (let key in doc.converters) {
        grdoc.converters[key] = doc.converters[key];
      }
    }
    console.log(JSON.stringify(grdoc, null, "\t"));
  } catch (e) {
    console.error(e);
  }
}

main();
