import {
    execAsync
} from "../async-helper";
export default async(config) => {
    return await execAsync(`babel ${config.out.es6} --out-file ${config.out.es5 + ".temp"} --inputSourceMap ${config.out.es6 + ".map"} --sourceMaps true --sourceMapTarget ${config.out.es5 + ".temp" + ".map"} --compact false --presets es2015 --plugins transform-runtime`);
};
