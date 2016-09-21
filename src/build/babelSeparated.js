import {
    execAsync
} from "../async-helper";
export default async(config) => {
    try {
        const result = await execAsync(`./node_modules/.bin/babel ${config.ts.lib} --out-dir ${config.ts.es5} --sourceMaps true --presets es2015`);
    } catch (e) {
      console.log(e);
    }
};
