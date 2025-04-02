import {env} from 'node:process';
import {logStringifyOf} from "../lib/services/util.js";


export const verbose = env.UMAMI_TEST_VERBOSE === 'true';
export const verboseStringify = obj => verbose && logStringifyOf(obj);
