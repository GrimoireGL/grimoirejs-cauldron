import {
    execAsync
} from "../async-helper";
export default async(config) => {
    try {
        const result = await execAsync(`./node_modules/.bin/babel ${config.out.es6} --out-file ${config.out.es5} --inputSourceMap ${config.out.es6 + ".map"} --sourceMaps true -sourceMapTarget ${config.out.es5 + ".map"} --presets es2015`);
    } catch (e) {
      console.log(e);
    }
};
