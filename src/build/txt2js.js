import {
    globAsync,
    templateAsync,
    writeFileAsync,
    readFileAsync
} from "../async-helper";
import path from 'path';

const templateDir = path.join(__dirname, "../../src/build/templates/");

const parseConfig = async() => {
    const config = JSON.parse(await readFileAsync("./package.json"));
    config.grimoire = config.grimoire ? config.grimoire : {};
    return config;
};

const txt2js = async(config, srcFolder, destFolder, isCjs, noDts) => {
    const dts = await readFileAsync(templateDir + "txt-d.ts.template");
    for (let ext of config["txt-exts"]) {
        const globbedFiles = await globAsync(srcFolder + "/**/*" + ext);
        try {
            for (let fileName of globbedFiles) {
                const genCode = await templateAsync(templateDir + (isCjs ? "txt-js-es5.template" : "txt-js-es6.template"), {
                    content: JSON.stringify((await readFileAsync(fileName)).toString('utf8'))
                });
                const fromSrc = path.relative(srcFolder, fileName);
                await writeFileAsync("./" + destFolder + "/" + fromSrc + ".js", genCode);
                if (!noDts) await writeFileAsync("./" + srcFolder + "/" + fromSrc + ".d.ts", dts);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

export default txt2js;

export async function execTxt2Js(srcFolder, destFolder, isCjs, noDts) {
    const config = (await parseConfig()).grimoire;
    await txt2js(config, srcFolder, destFolder, isCjs, noDts);
}
