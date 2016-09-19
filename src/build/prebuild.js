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
    await copyDirAsync(config.ts.src, config.ts.copyTo, true);
    const files = await globAsync(config.ts.copyTo + '/**/*.ts');
    await writeFileAsync(config.ts.copyTo + '/entry_files', files.join('\n'));
};

export default prebuild;
