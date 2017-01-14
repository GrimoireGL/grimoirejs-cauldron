import path from 'path';
import fs from "fs";
import unzip from "unzip";
import { getSuffix } from "../buildUtil/common";
import {
  readFileAsync,
  writeFileAsync
} from "../async-helper";

import {
  argv
} from "yargs";

async function init() {
  const suffix = getSuffix(argv.name);
  if (suffix) {
    try {
      const cwd = process.cwd();
      const p = path.join(__dirname, argv.ts ? "../../boilerplate.zip" : "../../boilerplate.zip"); //TODO:js boilerplate
      const rs = fs.createReadStream(p);
      const unzipExec = unzip.Extract({ path: cwd });
      unzipExec.on('close', async function () {
        try {
          const packagePath = path.join(cwd, "/package.json");
          let content = await readFileAsync(packagePath);
          content = content.replace("<NAME>", argv.name);
          writeFileAsync(packagePath, content)
        } catch (e) {
          console.error(e);
        }
      });
      rs.pipe(unzipExec); //, { end: false }
    } catch (e) {
      console.error(e);
    }
  } else {
    console.warn("invalid name.")
  }
}

init();
