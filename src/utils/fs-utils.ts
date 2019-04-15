import * as Debug from "debug";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

const log = Debug("fsutils");

export const readFileP = util.promisify(fs.readFile);
export const writeFileP = util.promisify(fs.writeFile);

// function to delete a file only it if exists
export const deleteFileP = (filepath: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        fs.unlink(filepath, (err) => {
            if (!err || err.message.startsWith("ENOENT")) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
};

// function to list all the sub-directories in a parent directory
// throws an error if parent does not exist
export const listDirectoriesP = (dirpath: string): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(dirpath, { withFileTypes: true }, (err, entries) => {
            if (!err) {
                try {
                    log("entries.length: " + entries.length);
                    const result: string[] = [];
                    entries.forEach((entry) => {
                        log("entry: " + entry.name);
                        if (entry.isDirectory) {
                            result.push(entry.name);
                        }
                    });
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(err);
            }
        });
    });
};
