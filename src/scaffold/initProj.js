import simple_git from "simple-git";
import path from 'path';
import fse from "fs-extra";
const git = simple_git()
import { getSuffix } from "../buildUtil/common";
import { argv } from "yargs";
import { readFileAsync, writeFileAsync } from "../async-helper";

const ts_boilerplate = "https://github.com/GrimoireGL/ts-boilerplate.git"
const js_boilerplate = "https://github.com/GrimoireGL/js-boilerplate.git"

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

        fse.removeSync(path.join(cwd, ".git"));

        const path_README = path.join(cwd, "README.md");
        writeFileAsync(path_README, `# grimoire-${suffix}\nplugin for Grimoire.js(https://grimoire.gl).\n`);

        let package_json = await readFileAsync(path.join(cwd, "package.json"));
        package_json = package_json.replace(/"name" *: *"[^"]*"/, `"name": "grimoirejs-${suffix}"`);
        package_json = package_json.replace(/"description" *: *"[^"]*"/, `"description": ""`);
        package_json = package_json.replace(/"version" *: *"[^"]*"/, `"version": "0.0.1"`);
        await writeFileAsync(path.join(cwd, "package.json"), package_json.replace('"name": "grimoirejs-ts-boilerplate"', `"name": "grimoire-${suffix}"`));
        git.init().add("./*").commit("Initial commit.");
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    console.warn("invalid name.")
  }
}

init();
