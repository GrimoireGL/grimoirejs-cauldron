import {
  argv
} from "yargs";
import {
  templateAsync,
  writeFileAsync,
  existsAsync
} from "../async-helper";
import path from "path";
import chalk from "chalk";
import findroot from "find-root";

const projroot = findroot(process.cwd())
const templateDir = path.join(__dirname, "../../src/scaffold/templates/");

const writeScaffoled = async(path, content) => {
  if (!argv.force && await existsAsync(path)) {
    console.log(chalk.bgRed.white(`Specified component already existing. To prevent overwrite modified files, scaffolded result was not generated.\nHowever, if this action was intended, you can use '--force' option to overwrite.`));
  } else {
    await writeFileAsync(path, content);
  }
};

const scaffold = async() => {
  const type = argv.type.toLowerCase();
  if (!argv.name) {
    console.log(`please specify ${type} name you want to scaffold with -n option`);
    return;
  }
  const templated = await templateAsync(templateDir + type + ".template", {
    name: argv.name
  });
  const upperType = type.substr(0, 1).toUpperCase() + type.substring(1) + "s";
  await writeScaffoled(path.join(projroot, `src/${upperType}/` + argv.name + "Component.ts"), templated);
  if (type === "converter") {
    const test = await templateAsync(templateDir + "converter_test.template", {
      key: argv.name + "Converter",
      path: argv.name + "Converter"
    });
    await writeScaffoled(path.join(projroot, "test/Converters/" + argv.name + "ConverterTest.js"), test);
  }
}

scaffold();
