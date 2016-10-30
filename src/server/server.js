import {execAsync} from "../async-helper";
import {argv} from "yargs";
import chalk from "chalk";
async function server(){
  console.log(chalk.bgGreen.white(`Server would be started with port ${argv.p}. You can access this server with http://localhost:${argv.p}`));
  await execAsync(`http-server ./ -p ${argv.p}`);
}

export default server;
