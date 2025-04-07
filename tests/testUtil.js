import {env} from 'node:process';
import {logStringifyOf} from "../lib/services/util.js";
import {expect} from "chai";


export const verbose = env.UMAMI_TEST_VERBOSE === 'true';
export const verboseStringify = obj => verbose && logStringifyOf(obj);

export const expectNoError = error => {
    if (error !== undefined) {
        console.error("Caught error:", error);
    }
    expect(error).to.be.undefined;
}