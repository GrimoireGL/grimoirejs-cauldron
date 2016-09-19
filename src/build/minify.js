import {execAsync} from "../async-helper";
import path from "path";

async function minify(config){
  const parsed = path.parse(config.out.es5);
  const generatedPath = path.join(parsed.dir,parsed.name + ".min" + parsed.ext);
  await execAsync(`./node_modules/.bin/uglifyjs ${config.out.es5} --compress -o ${generatedPath}`);
}

export default minify;
