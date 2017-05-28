import chalk from "chalk";
import { argv } from "yargs";
export function jsSafeString(str) {
  return str.replace(/\./g, "_").replace(/\-/g, "_");
}

export function getSuffix(name) {
  if (argv.core) {
    return name;
  }
  const regex = /^[Gg]rimoire(?:js|JS)?-(.+)$/;
  let regexResult;
  if ((regexResult = regex.exec(name))) {
    return jsSafeString(regexResult[1]);
  } else {
    console.warn(chalk.bgBlack.yellow(`Project name ${name} is not valid for grimoirejs package.`));
    return jsSafeString(name);
  }
}
