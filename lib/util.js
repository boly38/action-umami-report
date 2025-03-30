import path from 'path';
import fs from 'fs';

export const isSet = value => value !== null && value !== undefined && value !== '';

export const assumeInputIsSet = (inputObject, name) => {
    if (!isSet(inputObject))  {
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

/**
 * Get the JSON webhook payload for the event that triggered the workflow
 */
export const printContext = () => {
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
}

export const logStringifyOf = val => {
    console.info(JSON.stringify(val, null, 2));
}