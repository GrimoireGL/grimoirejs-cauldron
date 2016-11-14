import {
    globAsync,
    readFileAsync,
    templateAsync,
    writeFileAsync
} from "../async-helper";
import {
    argv
} from "yargs";
import path from "path";
import chalk from "chalk";

function getSuffix(name) {
    const regex = /^grimoirejs\-?(.+)?/;
    let regexResult;
    if ((regexResult = regex.exec(name))) {
        if (regexResult[1]) {
            return jsSafeString(regexResult[1]);
        } else {
            return undefined;
        }
    } else {
        console.warn(chalk.bgBlack.yellow(`Project name ${name} is not valid for grimoirejs package.`));
        return jsSafeString(name);
    }
}

function generateStructureRecursively(obj, sepDirs, basePath) {
    if (sepDirs.length < 2) {
        return;
    }
    if (sepDirs[0] === '') {
        obj[sepDirs[1]] = jsSafeString(basePath + sepDirs[1]);
        return;
    }
    basePath = basePath + sepDirs[0];
    if (sepDirs[0] !== '' && obj[sepDirs[0]] === void 0) {
        obj[sepDirs[0]] = {};
    }
    if (sepDirs.length > 2) {
        generateStructureRecursively(obj[sepDirs[0]], sepDirs.slice(1), basePath);
    } else if (sepDirs.length === 2) {
        obj[sepDirs[0]][sepDirs[1]] = jsSafeString(basePath + sepDirs[1]);
    }
}

function jsSafeString(str) {
    return str.replace(/\./g, "_").replace(/\-/g, "_");
}

function asJSIndex(jsonStr, sepDirs) {
    for (let pathKey in sepDirs) {
        const keyName = jsSafeString(sepDirs[pathKey].reduce((p, c) => p + c));
        const regex = new RegExp(`(: *)"${keyName}"`);
        jsonStr = jsonStr.replace(regex, "$1" + keyName);
    }
    return jsonStr;
}

async function generateIndex() {
    try {
        const cwd = process.cwd(); // current working directory
        const pkgJson = JSON.parse(await readFileAsync(path.join(cwd, "package.json")));
        const projectSuffix = getSuffix(pkgJson.name);
        const destFileLocation = path.resolve(path.join(cwd, argv.dest));
        const mainFileLocation = path.resolve(path.join(cwd, argv.main));
        const basePath = path.join(cwd, argv.src); // absolute path of source directory
        const detectedFiles = await globAsync(path.join(cwd, argv.src, argv.ts ? "**/*.ts" : "**/*.js")); // glob all javascript files
        if (argv.debug) {
            console.log(chalk.cyan(`CWD:${cwd} Project Suffix:${projectSuffix}\n destination:${destFileLocation}\n mainFile:${mainFileLocation}\n basePath:${basePath}\n\n DetectedFiles:\n${detectedFiles}`));
        }
        const pathMap = {};
        const interfaces = [];
        // listup files containing `export default`
        for (let i = 0; i < detectedFiles.length; i++) {
            const relative = path.relative(basePath, detectedFiles[i]);
            const absolute = path.resolve(detectedFiles[i]);
            if (destFileLocation === absolute || mainFileLocation === absolute || /\.d\.ts$/.test(absolute)) {
                continue;
            }
            const content = await readFileAsync(detectedFiles[i]);
            if (content.indexOf("interface ") >= 0 && content.indexOf("class ") < 0) { // to ignore interfaces
                interfaces.push(relative);
                continue;
            } else {
                pathMap[relative] = path.parse(relative);
            }
        }
        if (argv.debug) {
            console.log(chalk.cyan(`Target files:\n ${pathMap}`));
        }
        // separate relative path by '/' or '\'
        const separated = {};
        for (let keyPath in pathMap) {
            separated[keyPath] = pathMap[keyPath].dir.split(path.sep);
            separated[keyPath].push(pathMap[keyPath].name); // last element of separated[path] is file name without extension
        }
        // make structure of index
        const structureObject = {};
        for (let keyPath in separated) {
            generateStructureRecursively(structureObject, separated[keyPath], "");
        }
        const jsonCode = JSON.stringify(structureObject, null, "  ");
        const objectCode = asJSIndex(jsonCode, separated);
        const imports = [];
        for (let keyPath in separated) {
            imports.push({
                path: "./" + keyPath.replace(/\.js|\.ts/g, ""),
                key: jsSafeString(separated[keyPath].reduce((p, c) => p + c))
            });
        }
        let index = 0;
        for (let pathes of interfaces) {
            index++;
            imports.push({
                path: "./" + pathes.replace(/\.ts/g, ""),
                key: "__INTERFACE__" + index
            });
        }
        let templateArgs = {
            exportObject: objectCode,
            imports: imports,
            mainPath: "./" + path.relative(basePath, mainFileLocation).replace(/\.ts|\.js/g, ""),
            registerCode:projectSuffix?`window["GrimoireJS"].lib.${projectSuffix} = __EXPOSE__;`:""
        };
        if (!argv.ts) {
            await writeFileAsync(path.join(cwd, argv.dest), await templateAsync(path.normalize(__dirname + "/../../src/generate-exposure/index-template.template"), templateArgs));
        } else {
            await writeFileAsync(path.join(cwd, argv.dest), await templateAsync(path.normalize(__dirname + "/../../src/generate-exposure/ts-template.template"), templateArgs));
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
        }
    } catch (e) {
        console.log(e);
    }
}

generateIndex();