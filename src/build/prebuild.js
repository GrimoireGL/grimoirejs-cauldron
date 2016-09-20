import {
    copyDirAsync,
    globAsync,
    writeFileAsync,
    readFileAsync
} from "../async-helper";
import {
    argv
} from "yargs";
import path from "path";
const prebuild = async(config) => {
    await copyDirAsync(config.ts.src, config.ts.temp, true);
    const files = await globAsync(config.ts.temp + '/**/*.ts');
    await writeFileAsync(config.ts.temp + '/entry_files', files.join('\n'));
};

export default prebuild;
