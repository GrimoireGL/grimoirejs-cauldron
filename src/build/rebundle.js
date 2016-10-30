import {execAsync} from "../async-helper";
export default async(config)=>{
  return await execAsync(`./node_modules/.bin/browserify -e ${config.out.es5 + ".temp"} -o ${config.out.es5}`);
};
