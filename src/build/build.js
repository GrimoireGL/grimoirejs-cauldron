import {
    argv
} from "yargs";
import {
    readFileAsync,
    templateAsync,
    execAsync,
    watchItr,
    globAsync
} from '../async-helper';

import babel from "./babel";
import bundle from "./bundle";
import chalk from "chalk";
import ProgressBar from "progress";
import prebuild from "./prebuild";
import compile from "./compile";
import txt2js from "./txt2js";
import minify from "./minify";
import server from "../server/server";
import transformIndex from "./transform-index";

const parseConfig = async() => {
    const config = JSON.parse(await readFileAsync("./package.json"));
    config.grimoire = config.grimoire ? config.grimoire : {};
    return config;
};

const barLength = 50;

let taskCount = 4;
if (argv.babel) {
    taskCount++;
}
if (argv.minify) {
    taskCount++;
}

const tickBar = (bar, message) => {
    bar.fmt = `:percent[:bar](${message})\n`;
    bar.tick(barLength / taskCount);
};

if (!argv.babel && argv.minify) {
    console.warn("You cannnot minify es2016 script. minify task will be skipped");
    taskCount--;
}

let singleBuild = async(config) => {
    try {
        const bar = new ProgressBar(':bar\nMoving files...\n', {
            total: barLength
        });
        tickBar(bar, "Generating code from template...");
        await txt2js(config, false, false);
        await prebuild(config);
        if (!argv.noIndexReplace) {
            await transformIndex(config);
        }
        tickBar(bar, "Compiling typescript files...");
        const tsResult = await compile(config);
        if (tsResult.stdout) {
            console.log(chalk.red(tsResult.stdout));
            return;
        }
        tickBar(bar, "Bundling es2016 javascript files...");
        let bundled = await bundle(config);
        bundled.write({
            format: 'cjs',
            sourceMap: true,
            dest: config.out.es6
        });
        if (argv.babel) {
            tickBar(bar, "Transpiling into es2015 javascript files...");
            await babel(config);
        }
        if (argv.minify && argv.babel) {
            tickBar(bar, "Uglifying generated javascript");
            await minify(config);
        }
        tickBar(bar, "DONE!");
    } catch (e) {
        console.error(chalk.bgRed.white(e));
        console.error(chalk.yellow(e.stack));
    }
}

const build = async() => {
    const config = (await parseConfig()).grimoire;
    if (!argv.watch) await singleBuild(config);
    else {
        console.log(chalk.white.bgGreen("WATCH MODE ENABLED"));
        for (let changedChunk of watchItr(config.ts.src, {
                interval: 500
            })) {
            await changedChunk;
            console.log(chalk.black.bgWhite("Change was detected. Building was started."))
            await singleBuild(config);
        }
    }
}

build();

if (argv.server) {
    server();
}
