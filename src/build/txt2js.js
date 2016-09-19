import {
    globAsync,
    templateAsync,
    writeFileAsync,
    readFileAsync
} from "../async-helper";
import path from 'path';

const templateDir = path.join(__dirname,"../../src/build/templates/");

const txt2js = async(config,isCjs,noDts) => {
    const dts = await readFileAsync(templateDir + "txt-d.ts.template");
    for (let ext of config["txt-exts"]) {
        const globbedFiles = await globAsync(config.ts.src + "/**/*" + ext);
        try {
            for (let fileName of globbedFiles) {
                const genCode = await templateAsync(templateDir + (isCjs ? "txt-js-es5.template" : "txt-js-es6.template"), {
                    content: JSON.stringify((await readFileAsync(fileName)).toString('utf8'))
                });
                const fromSrc = path.relative(config.ts.src, fileName);
                await writeFileAsync("./" + config.ts.lib + "/" + fromSrc + ".js", genCode);
                if (!noDts) await writeFileAsync("./" + config.ts.src + "/" + fromSrc + ".d.ts", dts);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

export default txt2js;
