import {
    readFileAsync,
    writeFileAsync,
    templateAsync,
    globAsync,
    ensureFileAsync
} from "../async-helper";
import path from "path";
const templateDir = path.join(__dirname, "../../src/build/templates/");

function getFileNameBody(filePath) {
    return path.parse(filePath).name;
}

function getRelativePath(filePath) {
    const abs = path.resolve(filePath);
    const regex = /(.+)\.[^\.]+$/m;
    return "./" + path.relative(path.resolve('./src/'), abs).replace(regex, "$1");
}

const parseDependency = function*(text) {
    let next = "";
    let isComment = false;
    for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);
        if (c === ";") {
            isComment = true;
            continue;
        }
        if (c === "\n") {
            isComment = false;
            if (!isComment && next.match(/.+/)) {
                yield next;
            }
            next = "";
            continue;
        }
        if (!isComment) {
            next += c;
        }
    }
    if (!isComment&& next.match(/.+/)) {
        yield next;
    }
}

async function parseDependencies() {
    await ensureFileAsync(".grimoire.dependency");
    const txt = await readFileAsync(".grimoire.dependency");
    const dep = [];
    for (let d of parseDependency(txt)) {
        dep.push(d);
    }
    return dep;
}


async function transform(config) {
    const indexPath = path.join(config.ts.temp, config.main);
    let index = await readFileAsync(indexPath);
    // glob component files
    const componentFiles = await globAsync(config.ts.src + '/**/*Component.ts');
    const components = componentFiles.map(v => {
        const nameBody = getFileNameBody(v);
        const tag = nameBody.replace(/^(.+)Component$/, "$1");
        if (!tag) {
            console.error("The name just 'Component' is prohibited for readability");
        }
        return {
            tag: tag,
            key: nameBody,
            path: getRelativePath(v)
        };
    });
    // glob converter files
    const converterFiles = await globAsync(config.ts.src + '/**/*Converter.ts');
    const converters = converterFiles.map(v => {
        const nameBody = getFileNameBody(v);
        const tag = nameBody.replace(/^(.+)Converter$/, "$1");
        if (!tag) {
            console.error("The name just 'Component' is prohibited for readability");
        }
        return {
            tag: tag,
            key: nameBody,
            path: getRelativePath(v)
        };
    });
    const imports = await templateAsync(templateDir + "imports.template", {
        externals: await parseDependencies(),
        components: components,
        converters: converters
    });
    const register = await templateAsync(templateDir + "register.template", {
        namespace: config.namespace ? config.namespace : "HTTP://GRIMOIRE.GL/NS/CUSTOM",
        components: components,
        converters: converters
    });
    index = index.replace(/^\s*\/\/\<\%\=IMPORTS\%\>\s*$/m, imports);
    index = index.replace(/^\s*\/\/\<\%\=REGISTER\%\>\s*$/m, register);
    await writeFileAsync(indexPath, index);
}

export default transform;
