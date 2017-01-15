import path from "path";
import {
    readFileAsync,
    globAsync,
    writeFileAsync
} from "../async-helper";
import {
    argv
} from "yargs";
import {
    getSuffix
} from "./common";
import chalk from "chalk";

function genRefCode(separatedPath, libPrefix) {
    let refCode = `	Object.defineProperty(exports, "__esModule", {
	    value: true
	});`;
    if (libPrefix) {
        refCode += `exports.default=window.GrimoireJS.lib.${libPrefix}`;
    } else {
        refCode += `exports.default=window.GrimoireJS`;
    }
    for (let i = 0; i < separatedPath.length; i++) {
        refCode += `.${separatedPath[i]}`;
    }
    return refCode + ";";
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
                    await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode([], projectSuffix));
                    continue;
                }
                await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode(filteredPath[i].split(path.sep), projectSuffix));
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
                    await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode([], projectSuffix));
                    await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".d.ts"), genDtsCode(true));
                    continue;
                }
                await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".js"), genRefCode(filteredPath[i].split(path.sep), projectSuffix));
                await writeFileAsync(path.join(cwd, argv.dts, filteredPath[i] + ".d.ts"), genDtsCode(false));
            }
        }
    } catch (e) {
        console.log(e);
    }
}

generateReference();
