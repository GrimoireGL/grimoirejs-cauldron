import path from 'path';
import fs from "fs";
import unzip from "unzip";
import { getSuffix } from "../buildUtil/common";

import {
  argv
} from "yargs";

function init() {
  const suffix = getSuffix(argv.name);
  if (suffix) {
    const cwd = process.cwd();
    const p = path.join(__dirname, "../../boilerplate.zip");
    fs.createReadStream(p).pipe(unzip.Extract({ path: cwd }));
  } else {
    console.warn("invalid name.")
  }
}

init();
