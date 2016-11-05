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
import babelSeparated from "./babelSeparated";
import rebundle from "./rebundle";

const parseConfig = async() => {
    const config = JSON.parse(await readFileAsync("./package.json"));
    config.grimoire = config.grimoire ? config.grimoire : {};
    return config;
};

const barLength = 50;

let taskCount = 4;
if (argv.babel) {
    taskCount += 2;
}
if (argv.minify) {
    taskCount++;
}
if (argv.noBundle) {
    taskCount = 2;
}
if (argv.babelSeparated) {
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
        await txt2js(config, config.ts.src, config.ts.lib, false, false);
        await prebuild(config);
        if (!argv.noIndexReplace) {
            await transformIndex(config);
        }
        tickBar(bar, "Compiling typescript files...");
        const tsResult = await compile(config);
        if (tsResult.stderr) {
            console.log(chalk.red(tsResult.stderr));
            process.exit(1);
        }
        if (tsResult.stdout) {
            console.log(chalk.bgRed.white("COMPILE ERROR!"));
            console.log(chalk.red(tsResult.stdout));
            if (!argv.watch) {
                process.exit(1);
            }
            return;
        }
        if (argv.babelSeparated) {
            tickBar(bar, "Generating es5 javascript files...");
            await babelSeparated(config);
        }
        if (argv.noBundle) {
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
            try {
                const result = await babel(config);
                if (result.stderr) {
                    console.log(chalk.red(result.stderr));
                    process.exit(1);
                }
            } catch (e) {
                console.log(chalk.red(e.stdout));
                console.log(chalk.red(e.stderr));
                if (!argv.watch) {
                    process.exit(1);
                }
            }
            tickBar(bar, "Rebundling...");
            await rebundle(config);
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
                interval: 1
            })) {
            const changeDesc = await changedChunk;
            if (argv.debug) {
              console.log(chalk.cyan(JSON.stringify(changeDesc)));
            }
            console.log(chalk.black.bgWhite("Rebuilding stat..."))
            await singleBuild(config);
        }
    }
}

build();

if (argv.server) {
    server();
}
