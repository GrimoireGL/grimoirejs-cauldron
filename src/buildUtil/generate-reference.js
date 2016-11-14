import path from "path";
import {readFileAsync,globAsync,writeFileAsync} from "../async-helper";
import {argv} from "yargs";
import {getSuffix} from "./common";

function genRefCode(separatedPath, libPrefix) {
    let refCode = `	Object.defineProperty(exports, "__esModule", {
	    value: true
	});`;
    if (libPrefix) {
        refCode += `exports.default=window.GrimoireJS.Lib.${libPrefix}`;
    } else {
        refCode += `exports.default=window.GrimoireJS`;
    }
    for (let i = 0; i < separatedPath.length; i++) {
        refCode += `.${separatedPath[i]}`;
    }
    return refCode + ";";
}

async function generateReference() {
    try {
        const cwd = process.cwd(); // current working directory
        const pkgJson = JSON.parse(await readFileAsync(path.join(cwd, "package.json")));
        const projectSuffix = getSuffix(pkgJson.name);
        const destFileLocation = path.resolve(path.join(cwd, argv.dest));
        const mainFileLocation = path.resolve(path.join(cwd, argv.main));
        const basePath = path.join(cwd, argv.src); // absolute path of source directory
        const dtsGlobPath = path.join(cwd, argv.dts, "**/*.d.ts");
        const mainFileRelativeWithoutExt = path.relative(basePath, mainFileLocation).replace(/\.ts|\.js/, "");
        const destFileRelativeWithoutExt = path.relative(basePath, destFileLocation).replace(/\.ts|\.js/, "");
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
    } catch (e) {
        console.log(e);
    }
}

generateReference();
