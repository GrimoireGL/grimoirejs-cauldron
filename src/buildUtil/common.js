import chalk from "chalk";
export function jsSafeString(str) {
  return str.replace(/\./g, "_").replace(/\-/g, "_");
}

export function getSuffix(name) {
  const regex = /^[Gg]rimoire(?:js|JS)?-(.+)$/;
  let regexResult;
  if ((regexResult = regex.exec(name))) {
    if (regexResult[1]) {
      return jsSafeString(regexResult[1]);
    } else {
      return undefined;
    }
  } else {
    console.warn(chalk.bgBlack.yellow(`Project name ${name} is not valid for grimoirejs package.`));
    return jsSafeString(name);
  }
}
