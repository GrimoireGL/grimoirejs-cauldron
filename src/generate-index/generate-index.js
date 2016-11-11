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
        const regex = new RegExp(`"${keyName}"`);
        jsonStr = jsonStr.replace(regex, keyName);
    }
    return jsonStr;
}

async function generateIndex() {
    try {
        const cwd = process.cwd(); // current working directory
        const pkgJson = path.join(cwd, "package.json");
        let main = JSON.parse(await readFileAsync(pkgJson)).main;
        let destFile = path.resolve(path.join(cwd, argv.destJs));
        if (!main) {
          throw new Error("main field is not defined on package.json");
        }
        main = path.resolve(main);
        const baseUrl = path.join(cwd, argv.src); // absolute path of source directory
        const detectedFiles = await globAsync(path.join(cwd, argv.src, "**/*.js")); // glob all javascript files
        const pathMap = {};
        // listup files containing `export default`
        for (let i = 0; i < detectedFiles.length; i++) {
            const relative = path.relative(baseUrl, detectedFiles[i]);
            const absolute = path.resolve(detectedFiles[i]);
            if (destFile === absolute || main === absolute) {
                continue;
            }
            const content = await readFileAsync(detectedFiles[i]);
            if (content.indexOf("export default") >= 0) { // to ignore interfaces
                pathMap[relative] = path.parse(relative);
            }
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
                path: "./" + keyPath.replace(/\.js/g, ""),
                key: jsSafeString(separated[keyPath].reduce((p, c) => p + c))
            });
        }
        let templateArgs = {
            exportObject: objectCode,
            imports: imports
        };
        await writeFileAsync(path.join(cwd, argv.destJs), await templateAsync(path.normalize(__dirname + "/../../src/generate-index/index-template.template"), templateArgs));
        // generate dts
        templateArgs.exportObject = templateArgs.exportObject.replace(/,/g,";").replace(/([\w\}])$(?=\n *\})/mg,"$1;").replace(/("\s*:\s*)(\w+)/g,"$1typeof $2");
        await writeFileAsync(path.join(cwd, argv.destDts), await templateAsync(path.normalize(__dirname + "/../../src/generate-index/dts-template.template"), templateArgs));
    } catch (e) {
        console.log(e);
    }
}

generateIndex();
