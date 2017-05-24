import simple_git from "simple-git";
const git = simple_git()
import { getSuffix } from "../buildUtil/common";
import { argv } from "yargs";

const ts_boilerplate = "git@github.com:GrimoireGL/ts-boilerplate.git"
const js_boilerplate = "git@github.com:GrimoireGL/js-boilerplate.git"

async function init() {
  const suffix = getSuffix(argv.name);
  if (suffix) {
    try {
      const bp = argv.js ? js_boilerplate : ts_boilerplate;
      const cwd = process.cwd();
      console.log(`cloning boilerplate from ${bp} ...`);
      git.clone(bp, cwd).removeRemote("origin", function (e) {
        if (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    console.warn("invalid name.")
  }
}

init();
