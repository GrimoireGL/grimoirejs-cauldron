import {
    rollup
} from "rollup";
import path from "path";
import sourcemaps from "rollup-plugin-sourcemaps";
import builtin from "rollup-plugin-node-builtins";
import inject from 'rollup-plugin-inject';
import commonjs from "rollup-plugin-commonjs";
import npm from "rollup-plugin-node-resolve";
import chalk from "chalk";
import {argv} from "yargs";

const bundleTask = function(config) {
    const mainFile = path.join(config.ts.lib, config.main).trim().replace(/\.ts$/, ".js");
    return new Promise((resolve, reject) => {
        rollup({
            entry: "./" + mainFile,
            sourceMap: true,
            plugins: [
                sourcemaps(),
                inject({
                    modules: {
                        __awaiter: 'typescript-awaiter'
                    }
                }),
                builtin(),
                commonjs({
                    ignoreGlobal: true,
                    exclude: ["node_modules/rollup-plugin-node-builtins/**"] // https://github.com/calvinmetcalf/rollup-plugin-node-builtins/issues/5
                }),
                npm({
                    jsnext: true,
                    main: true,
                    browser: true
                })
            ]
        }).then(bundle => {
            resolve(bundle);
        }).catch(err => {
            reject(err);
        });
    });
}


const defaultFunc = async(config) => {
    let bundled = null;
    try {
        bundled = await bundleTask(config);
    } catch (e) {
        console.error(chalk.white.bgRed("BUNDLING FAILED"));
        console.error(chalk.red(e));
        console.error(chalk.yellow(e.stack));
        if(!argv.watch){
          process.exit(1);
        }
    }
    return bundled;
};

export default defaultFunc;
