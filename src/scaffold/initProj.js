import simple_git from "simple-git";
import path from 'path';
const git = simple_git()
import { getSuffix } from "../buildUtil/common";
import { argv } from "yargs";
import { readFileAsync, writeFileAsync } from "../async-helper";

const ts_boilerplate = "git@github.com:GrimoireGL/ts-boilerplate.git"
const js_boilerplate = "git@github.com:GrimoireGL/js-boilerplate.git"

async function init() {
  const suffix = getSuffix(argv.name);
  if (suffix) {
    try {
      const bp = argv.js ? js_boilerplate : ts_boilerplate;
      const cwd = process.cwd();
      console.log(`cloning boilerplate from ${bp} ...`);
      git.clone(bp, cwd).removeRemote("origin", async function (e) {
        if (e) {
          console.error(e);
        }
        let package_json = await readFileAsync(path.join(cwd, "package.json"));
        writeFileAsync(path.join(cwd, "package.json"), package_json.replace('"name": "grimoirejs-ts-boilerplate"', `"name": "grimoire-${suffix}"`));

      });
    } catch (e) {
      console.error(e);
    }
  } else {
    console.warn("invalid name.")
  }
}

init();
