import {isVerbose} from "../util.js";
import axios from 'axios'; // TO BE REMOVED / https://github.com/boly38/action-umami-report/issues/73

const verbose = isVerbose;

/**
 * beta : no test coverage for now
 */
export default class UmamiServiceBeta {

    /**
     * prefetch umami api to understand flaky results
     * origin      : https://github.com/boly38/action-umami-report/issues/37
     * improvement : https://github.com/boly38/action-umami-report/issues/73 todo: document+test
     */
    static async prefetchUmamiServerApi({
                                            server, username, password,
                                            nbFetch = 10, timeoutMs = 50000,
                                            successToValid = 2
                                        }) {
        return new Promise(async resolve => {
            let baseURL = `${server}/api`;
            verbose && console.log(`prefetchUmamiServerApi ${baseURL}`);
            const client = axios.create({baseURL: baseURL, timeout: timeoutMs});
            let fetchResults = [];
            let success = 0;
            for (let i = 1; i < nbFetch && success < successToValid; i++) {
                const action = `post ${i}`;
                console.time(action);
                const loginResult = await client.post("/auth/login", {username, password})
                    .catch(error => {
                        console.timeEnd(action);
                        const message = typeof error.response !== "undefined" ? JSON.stringify(error.response.data) : error.message;
                        const status = typeof error.response !== "undefined" ? `${error.response.status} ${error.response.statusText}` : '';
                        const logMessage = status !== message ? `[${status}] ${message}` : message;
                        if (logMessage !== '401 Unauthorized') {
                            console.log(`Login failed: ${logMessage}`);
                        }
                        fetchResults.push(status);
                    });
                if (loginResult !== undefined) {
                    fetchResults.push(`OK ${JSON.stringify(loginResult.status)}`);
                    success++;
                }
            }
            resolve(fetchResults);
        });
    }

}