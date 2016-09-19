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
    if (type === "component") {
        if (!argv.name) {
            console.log("please specify component name you want to scaffold with -n option");
            return;
        }
        const templated = await templateAsync(templateDir + "component.template", {
            name: argv.name
        });
        await writeScaffoled("./src/Components/" + argv.name + "Component.ts", templated);
    } else if (type === "converter") {
        if (!argv.name) {
            console.log("please specify converter name you want to scaffold with -n option");
            return;
        }
        const templated = await templateAsync(templateDir + "converter.template", {
            name: argv.name
        });
        await writeScaffoled("./src/Converters/" + argv.name + "Converter.ts", templated);
        const test = await templateAsync("./scripts/templates/converter_test.template", {
            key: argv.name + "Converter",
            path: argv.name + "Converter"
        });
        await writeScaffoled("./test/Converters/" + argv.name + "ConverterTest.js", test);
    } else if (type === "constraint") {
        if (!argv.name) {
            console.log("please specify converter name you want to scaffold with -n option");
            return;
        }
        const templated = await templateAsync(templateDir + "constraint.template", {
            name: argv.name
        });
        await writeScaffoled("./src/Constraint/" + argv.name + "Constraint.ts", templated);
    } else {
        console.log("Please specify valid type to scaffold with -t option. 'component' or 'converter' are available.")
    }
}

scaffold();
