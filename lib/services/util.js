import path from 'path';
import fs from 'fs';

export const isVerbose = process.env.UMAMI_DEBUG_ACTION === 'true';

export const rethrow = (err, prefix = "") => {
    throw new Error(`${prefix} ${err?.message || JSON.stringify(err)}`);
}

export const isSet = value => value !== null && value !== undefined && value !== '';

export const assumeInputIsSet = (inputObject, name) => {
    if (!isSet(inputObject)) {
        throw new Error(`please setup your environment: ${name} expected`);
    }
}

export const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

export const logStringifyOf = val => {
    if (!isSet(val)) {
        return;
    }
    console.info(JSON.stringify(val, null, 2));
}

export const isArrayWithContent = val => Array.isArray(val) && val.length > 0;