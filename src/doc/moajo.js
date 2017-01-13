import path from 'path';
import comments from 'js-comments';
import del from 'del';

import {
  argv
} from "yargs";

import {
  globAsync,
  readFileAsync,
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
  return source.split("\n")[line - 1];
}

function genComponentDoc(src, obj) {
  if (!obj) { // find by path.
    const lines = src.split(/\r\n|\r|\n/);
    obj = {
      comment: {
        code: null,
        end: null
      }
    };
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/export *default *class */);
      if (m) {
        obj.comment.code = lines[i];
        obj.comment.end = i;
        break;
      }
    }
    if (!obj.comment.code) {
      return null;
    }
  }
  const code = obj.comment.code;
  const front = code.substring(0, code.indexOf("{"));
  const content = getBraceContent(src, getIndex(src, obj.comment.end + 1, "{"));
  const componentSource = front + content;

  const firstLine = getLine(componentSource, 1);
  const className = firstLine.match(/class +(\w+)/)[1];

  const ret = {
    description: obj.description || "",
    super: obj.super,
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
      const name = obj.comment.code.match(/(\w+):/)[1];
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

  const r = {};
  r[className] = ret;
  return r;
}

function genConverterDoc(src, comment) {
  if (!comment) { // find by path.
    const lines = src.split(/\r\n|\r|\n/);
    comment = {
      comment: {
        code: null,
        end: null
      }
    };
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/export *default *function */);
      if (m) {
        comment.comment.code = lines[i];
        comment.comment.end = i;
        break;
      }
    }
    if (!comment.comment.code) {
      return null;
    }
  }
  const code = comment.comment.code;
  const front = code.substring(0, code.lastIndexOf("{"));
  const content = getBraceContent(src, getIndex(src, comment.comment.end + 1, "{"));
  const converterSrc = front + content;

  const firstLine = getLine(converterSrc, 1);
  const className = firstLine.match(/function +(\w+) *\(/)[1];
  const parameters = {};
  if (comment.gr_props) {
    comment.gr_props.forEach(p => {
      parameters[p.type] = p.description || "";
    });
  }

  const ret = {};
  ret[className] = {
    description: comment.description || "",
    output: comment.gr_output,
    input: comment.gr_input,
    parameters: parameters
  };
  return ret;
}

function genNodeDoc(src, comment) {
  if (!comment) { // find by path.
    const lines = src.split(/\r\n|\r|\n/);
    comment = {
      comment: {
        code: null,
        end: null
      }
    };
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/export *default *\{/);
      if (m) {
        comment.comment.code = lines[i];
        comment.comment.end = i;
        break;
      }
    }
    if (!comment.comment.code) {
      return null;
    }
  }
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
    const cwd = process.cwd();
    const rel = path.relative(path.join(cwd, argv.src), filePath);
    const doc = {
      nodes: {},
      components: [],
      converters: []
    };
    if (!rel.startsWith(".") && path.basename(filePath).indexOf("Component.") !== -1) {
      const d = genComponentDoc(sourceCode);
      if (d) {
        for (let key in d) {
          doc.components[key] = d[key];
        }
      }
    } else if (!rel.startsWith(".") && path.basename(filePath).indexOf("Converter.") !== -1) {
      const d = genConverterDoc(sourceCode);
      if (d) {
        for (let key in d) {
          doc.converters[key] = d[key];
        }
      }
    } else if (rel.startsWith("nodes.")) {
      const d = genNodeDoc(sourceCode);
      if (d) {
        for (let key in d) {
          doc.nodes[key] = d[key];
        }
      }
    }

    a.forEach(obj => {
      if (obj.gr_component === true) {
        const d = genComponentDoc(sourceCode, obj);
        if (d) {
          for (let key in d) {
            doc.components[key] = d[key];
          }
        }
      }
      if (obj.gr_converter === true) {
        const d = genConverterDoc(sourceCode, obj);
        if (d) {
          for (let key in d) {
            doc.converters[key] = d[key];
          }
        }
      }
      if (obj.gr_node === true) {
        const d = genNodeDoc(sourceCode, obj);
        if (d) {
          for (let key in d) {
            doc.nodes[key] = d[key];
          }
        }
      }

    });
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
    const ext = argv.ts ? ".ts" : ".js"
    // const nodesPath = argv.nodes || `src/nodes${ext}`;
    const cwd = process.cwd();
    // console.log(`src directory: ${path.join(cwd, argv.src)}`);

    // if (argv.clear) {
    //   const d = path.join(cwd, dest);
    //   const paths = await del([d + "/**"]);
    //   // console.log(`clear dest dir: ${d}`);
    // }

    const projName = JSON.parse(await readFileAsync(path.join(cwd, "package.json"))).name;
    const grdoc = {
      name: projName,
      nodes: {},
      components: {},
      converters: {}
    };

    const detectedFiles = await getTargetFilePathes(path.join(cwd, argv.src));
    // console.log(`detected file:${detectedFiles.length}`);


    for (var i = 0; i < detectedFiles.length; i++) {
      const file = detectedFiles[i];
      // console.log("parsing...:" + file);
      const rel = path.relative(cwd, file);
      // const replace = rel.replace(/[^\/]+\//, dest + "/");
      // console.log(replace);
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
      // if (doc.nodes.length > 0 || doc.components.length > 0 || doc.converters.length > 0) {
      //   writeFileAsync(replace, JSON.stringify(doc, null, "\t"));
      // }
    }
    console.log(JSON.stringify(grdoc, null, "\t"));
  } catch (e) {
    console.error(e);
  }

  // writeFileAsync(path.join(cwd, "grdoc.json"), JSON.stringify(grdoc, null, "\t"));
}

main();
