import {
    globAsync,
    readFileAsync,
    templateAsync,
    writeFileAsync,
    ensureFileAsync
} from '../async-helper';
import chalk from 'chalk';
import path from 'path';

function getFileNameBody(filePath) {
    return path.parse(filePath).name;
}

const templateDir = path.join(__dirname, "../../src/doc/templates/");


function* attributeWalker(attributes) {
    let currentHead = "";
    let currentBody = "";
    let parsingHead = true;
    let currentBracket = 0;
    for (let i = 0; i < attributes.length; i++) {
        const current = attributes.charAt(i);
        if (parsingHead) {
            if (current !== ":") {
                currentHead += current;
            } else {
                parsingHead = false;
                currentHead = currentHead.trim();
            }
        } else {
            let needAppend = true;
            if (current === "{" || current === "(" || current === "[" || current === "<") {
                if (currentBracket === 0 && current === "{") {
                    needAppend = false;
                }
                currentBracket++;
            }
            if (current === "}" || current === ")" || current === "]" || current === ">") {
                currentBracket--;
                if (currentBracket === 0 && current === "}") {
                    needAppend = false;
                }
            }
            if (current === "," && currentBracket === 0) {
                yield {
                    name: currentHead,
                    body: currentBody
                };
                currentHead = "";
                currentBody = "";
                currentBracket = 0;
                parsingHead = true;
                needAppend = false;
            }

            if (needAppend) {
                currentBody += current;
            }
        }
    }
    yield {
        name: currentHead,
        body: currentBody
    };
}

const generateForComponents = async(config) => {
    const files = await globAsync(config.ts.src + "/**/*Component.ts");
    for (let i = 0; i < files.length; i++) {
        let content = await readFileAsync(files[i]);
        let contentName = getFileNameBody(files[i]).match(/.+(?=Component)/)[0];
        const regex = /static[\s\n]+attributes[\s\n]*:[^}]*}[\s\n]*=[\s\n*]{([\s\S]+})/g;
        content = content.replace(/\/\*[\s\S]*?\*\//, "").replace(/\/\/.*/, "");
        let result = regex.exec(content);
        const target = result[1];
        let bracketCount = 1;
        let j;
        for (j = 0; j < target.length; j++) {
            const char = target.charAt(j);
            if (char === "{") {
                bracketCount++;
            } else if (char === "}") {
                bracketCount--;
            }
            if (bracketCount === 0) {
                break;
            }
        }
        const attributes = target.substr(0, j);
        generatefiles(attributes, contentName, config);
    }
}

const generatefiles = async(attributes, contentName, config) => {
    const fileName = path.join(config.doc.src, "Components", contentName + '.md');
    let component = {
        componentName: contentName,
        attributes: []
    }
    for (let attrs of attributeWalker(attributes)) {
        if (attrs.name.length === 0 || attrs.body.length === 0) {
            continue;
        }
        let converter = undefined;
        let defaultValue = undefined;
        let other = "";
        for (let attrChild of attributeWalker(attrs.body)) {
            if (attrChild.name === "converter") {
                converter = attrChild.body.trim();
                converter = converter.substring(1, converter.length - 1);
                continue;
            }
            if (attrChild.name === "defaultValue") {
                defaultValue = attrChild.body.trim();
                continue;
            }
            if (attrChild.name.length === 0 || attrChild.body.length === 0) {
                continue;
            }
            other += `\`${attrChild.name}\`</br>${attrChild.body}</br>`;
        }
        other = other.trim();
        other = other.replace(/\n/g, "</br>");
        if (other.length === 0 || other === ":") {
            other = "なし";
        }
        component.attributes.push({
            name: attrs.name.replace(/[\s]/g, ""),
            converter: converter,
            defaultValue: defaultValue,
            other: other
        });
    }
    let fileBody = "";
    try {
        fileBody = await readFileAsync(fileName);
    } catch (e) {

    }
    const regex = /<!-- EDIT HERE\(([\w\d@]+)\)-->([\s\S]*?)<!-- \/EDIT HERE-->/g;
    let regexResult;
    const descriptions = {};
    while ((regexResult = regex.exec(fileBody))) {
        descriptions[regexResult[1]] = regexResult[2];
    }

    if (descriptions["@Component"] === void 0) {
        descriptions["@Component"] = "\n";
    }
    component.attributes.forEach((attr) => {
        if (descriptions[attr.name] === void 0) {
            descriptions[attr.name] = "\n";
        }
    });
    component.attributes.forEach((attr) => {
        attr.description = descriptions[attr.name];
    });
    const headerTemplated = await templateAsync(templateDir + "/markdown-header.template", {
        componentName: contentName,
        description: descriptions["@Component"]
    });
    let tableTemplated = await templateAsync(templateDir + "markdown-attribute-table.template", {
        attributes: component.attributes
    });
    if (component.attributes.length === 0) {
        tableTemplated = "属性なし";
    }
    const attributesDescription = await templateAsync(templateDir + "markdown-attribute.template", {
        attributes: component.attributes
    });
    await writeFileAsync(fileName, headerTemplated + tableTemplated + attributesDescription);
}

const generateIndex = async(config) => {
    await ensureFileAsync(config.doc.header);
    await ensureFileAsync(config.doc.footer);
    const header = await readFileAsync(config.doc.header);
    const footer = await readFileAsync(config.doc.footer);
    const files = await globAsync(config.doc.src + "/**/*.md");
    const content = [];
    for (let i = 0; i < files.length; i++) {
        content.push(await readFileAsync(files[i]));
    }
    const templated = await templateAsync(templateDir + "markdown-index.template", {
        header: header,
        footer: footer,
        component: content
    });
    await writeFileAsync(config.doc.dest, templated);
}

const parseConfig = async() => {
    const config = JSON.parse(await readFileAsync("./package.json"));
    config.grimoire = config.grimoire ? config.grimoire : {};
    return config;
};

const main = async() => {
    const config = (await parseConfig()).grimoire;
    try {
        await generateForComponents(config);
        await generateIndex(config);
    } catch (e) {
        console.log(e);
    }
    console.log("here3");

};

export default main;
