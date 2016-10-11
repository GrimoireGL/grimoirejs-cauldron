import {
    execAsync
} from "../async-helper";
export default async(config) => {
    return await execAsync(`./node_modules/.bin/babel ${config.out.es6} --out-file ${config.out.es5} --inputSourceMap ${config.out.es6 + ".map"} --sourceMaps true -sourceMapTarget ${config.out.es5 + ".map"}`);
};
