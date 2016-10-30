import {execAsync} from "../async-helper";
export default async(config)=>{
  return await execAsync(`tsc @${config.ts.temp}/entry_files --declaration --outDir ${config.ts.lib} -m es6 -t es6 --moduleResolution node --sourcemap --noEmitHelpers`);
};
