import fs from 'fs';
import path from 'path';
import handleBars from 'handlebars';
import fse from 'fs-extra';
import {
    exec
} from 'child_process';
import watch from 'watch';
import glob from 'glob';
import {
    argv
} from 'yargs';
import chalk from 'chalk';

var isDebug = !!argv.debug;

export function readFileAsync(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, txt) => {
            if (err) {
                reject(err);
            } else {
                resolve(txt);
            }
        });
    });
}


export async function templateAsync(filePath, args) {
    const template = await readFileAsync(filePath);
    return handleBars.compile(template, {
        noEscape: true
    })(args);
}

export function copyDirAsync(src, dest, clobber = false, filter) {
    if (!filter) {
        filter = () => {
            return true;
        };
    }
    return new Promise((resolve, reject) => {
        fse.copy(src, dest, {
            clobber: clobber,
            filter: filter
        }, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function writeFileAsync(filePath, content) {
    return new Promise((resolve, reject) => {
        fse.outputFile(filePath, content, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function unlinkAsync(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function execAsync(command) {
    if (isDebug) {
        console.log(chalk.green(`Executing:${command}`));
        console.log(chalk.cyan(`PATH:${process.env.PATH}`));
    }
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            resolve({
                stdout: stdout,
                stderr: stderr,
                err: err
            });
        });
    });
}

export function* watchItr(src, options) {
    let resolver = {};
    watch.watchTree(src, options, (f, curr, prev) => {
        resolver.resolve(f);
    });
    while (true) {
        const p = new Promise((resolve, reject) => {
            resolver.resolve = resolve;
        });
        yield p;
    }
}

export async function getEntities(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

export async function isDirectory(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err) {
                reject(err);
            } else {
                resolve(stat.isDirectory());
            }
        });
    });
}

export async function getDirectories(srcPath) {
    const files = await getEntities(srcPath);
    const directories = [];
    for (let i = 0; i < files.length; i++) {
        const dirName = path.join(srcPath, files[i]);
        if (await isDirectory(dirName)) {
            directories.push(files[i]);
        }
    }
    return directories;
}

export function emptyDirAsync(src) {
    return new Promise((resolve, reject) => {
        fse.emptyDir(src, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function globAsync(globRegex) {
    return new Promise((resolve, reject) => {
        glob(globRegex, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(files);
        });
    });
}

export function ensureDirAsync(path) {
    return new Promise((resolve, reject) => {
        fse.ensureDir(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function ensureFileAsync(path) {
    return new Promise((resolve, reject) => {
        fse.ensureFile(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function existsAsync(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err === null) {
                resolve(true);
            } else if (err.code == 'ENOENT') {
                // file does not exist
                resolve(false)
            } else {
                reject('Some other error: ', err.code);
            }
        });
    });
}
