import {execAsync} from "../async-helper";
export default async(config)=>{
  return await execAsync(`./node_modules/.bin/tsc @${config.ts.copyTo}/entry_files --declaration --outDir ${config.ts.lib} -m es6 -t es6 --moduleResolution node --sourcemap --noEmitHelpers`);
};
