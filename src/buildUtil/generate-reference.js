import path from "path";
import {
  readFileAsync,
  globAsync,
  writeFileAsync,
  templateCompileAsync
} from "../async-helper";
import {
  argv
} from "yargs";
import {
  getSuffix
} from "./common";
import chalk from "chalk";

let refGen;
function genRefCode(separatedPath, libSuffix) {
  let sepPath = "";
  for (let i = 0; i < separatedPath.length; i++) {
    sepPath += `/${separatedPath[i]}`;
  }
  return refGen({
    libSuffix: (!argv.core ? libSuffix : "grimoirejs") + "/ref",
    separatedPath: sepPath
  });
}

function genDtsCode(isIndex) {
  if (isIndex) {
    return `declare var __PACKAGE_DECL__:{
        __VERSION__:string;
        __NAME__:string;
        [key:string]:any;
      };
export default __PACKAGE_DECL__;`;
  } else {
    return `declare var __MODULE_DECL__:any;
  export default __MODULE_DECL__;`;
  }
}

async function generateReference() {
  try {
    refGen = await templateCompileAsync(path.normalize(__dirname + "/../../src/buildUtil/ref-template.template"));
    const cwd = process.cwd(); // current working directory
    const pkgJson = JSON.parse(await readFileAsync(path.join(cwd, "package.json")));
    const projectSuffix = getSuffix(pkgJson.name);
    const destFileLocation = path.resolve(path.join(cwd, argv.dest));
    const mainFileLocation = path.resolve(path.join(cwd, argv.main));
    const basePath = path.join(cwd, argv.src); // absolute path of source directory
    const mainFileRelativeWithoutExt = path.relative(basePath, mainFileLocation).replace(/\.ts|\.js/, "");
    const destFileRelativeWithoutExt = path.relative(basePath, destFileLocation).replace(/\.ts|\.js/, "");
    if (argv.ts) {
      // Typescript
      const dtsGlobPath = path.join(cwd, argv.dts, "**/*.d.ts");
      const pathes = await globAsync(dtsGlobPath);
      const filteredPath = pathes
        .map(p => path.relative(path.resolve(cwd, argv.dts), p))
        .map(p => p.replace(/\.d\.ts$/, ""))
        .filter(f => (f !== mainFileRelativeWithoutExt));
      if (argv.debug) {
        console.log(chalk.cyan(`Filtered js generation path:\n${filteredPath}`));
      }
      for (let i = 0; i < filteredPath.length; i++) {
        if (filteredPath[i] === destFileRelativeWithoutExt) {
          await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode([], pkgJson.name));
          continue;
        }
        await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode(filteredPath[i].split(path.sep), pkgJson.name));
      }
    } else {
      const jsFiles = path.join(cwd, argv.src, "**/*.js");
      const pathes = await globAsync(jsFiles);
      const filteredPath = pathes
        .map(p => path.relative(path.resolve(cwd, argv.src), p))
        .map(p => p.replace(/\.js$/, ""))
        .filter(f => (f !== mainFileRelativeWithoutExt));
      if (argv.debug) {
        console.log(chalk.cyan(`Filtered js generation path:\n${filteredPath}`));
      }
      for (let i = 0; i < filteredPath.length; i++) {
        if (filteredPath[i] === destFileRelativeWithoutExt) {
          await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode([], pkgJson.name));
          await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".d.ts"), genDtsCode(true));
          continue;
        }
        await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode(filteredPath[i].split(path.sep), pkgJson.name));
        await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".d.ts"), genDtsCode(false));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

generateReference();
