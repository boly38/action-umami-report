import core from '@actions/core';
import {assumeInputIsSet, isSet, isVerbose} from "./util.js";

const verbose = isVerbose;

export default class GithubAction {

    static input(variableName, {required = false, trimWhitespace = false}, defaultValue = null) {
        let val = core.getInput(variableName, {required, trimWhitespace}) || defaultValue;
        if (required) {
            assumeInputIsSet(val, variableName);
        }
        return val;
    }

    static inputBoolean(variableName, defaultValue) {
        // core.getBooleanInput wont work : require not undefined value...
        let val = core.getInput(variableName, {required: false, trimWhitespace: true}, defaultValue);
        return ["true", "True", "TRUE"].includes(val);
    }

    static output(resultName, resultValue) {
        verbose && console.info(`produce action result (output): ${resultName}`);
        core.setOutput(resultName, resultValue);// core action output: to be declared as outputs by current job and used by another job
        // disabled by #12 // core.exportVariable(resultName, resultValue);// core action env: to be used by current job by another step
    }

    static getActionInputParameters() {
        //~ GitHub action inputs
        const cloudApiKey = GithubAction.input('umami-cloud-api-key',
            {required: false, trimWhitespace: true}, null);// example : api_xxxyyyzzz
        const server = GithubAction.input('umami-server',
            {required: false, trimWhitespace: true}, null);// example : https://umami.myinstance.com
        const username = GithubAction.input('umami-user',
            {required: false}); // example : admin
        const password = GithubAction.input('umami-password',
            {required: false}); // example : mY53[R3T
        const domain = GithubAction.input('umami-site-domain',
            {required: false}, "*first*");// ''
        const outputFile = GithubAction.input('umami-report-file',
            {required: false}, null);// ''
        const reportContent = GithubAction.input('umami-report-content',
            {required: false}, 'pageviews|events|sessions|urls');
        const period = GithubAction.input('umami-period',
            {required: false}, '24h');
        const unit = GithubAction.input('umami-unit',
            {required: false}, 'hour');// 'hour' // used by pageviews and events. need to be correlated to the period
        const timezone = GithubAction.input('umami-tz',
            {required: false}, 'Europe/Paris');// 'Europe/Paris'
        const prefetch = GithubAction.inputBoolean('umami-prefetch', false);
        const isCloudMode = isSet(cloudApiKey);
        if (!isCloudMode && (!isSet(server) || !isSet(username) || !isSet(password))) {
            throw new Error("Umami hosted mode requires umami-server, umami-user, umami-password")
        } else if (isCloudMode && (isSet(server) || isSet(username) || isSet(password))) {
            throw new Error("Umami cloud mode with api-key doesn't need umami-server, umami-user, umami-password")
        }
        //~ GitHub action inputs - end
        if (isCloudMode) {
            verbose && console.log("input (cloud mode) " + JSON.stringify({
                domain, outputFile, reportContent, period, unit, timezone, prefetch
                // cloudApiKey : dont log creds ^^ // Weakness - CWE-312 CWE-359 CWE-532
            }));
        } else {
            verbose && console.log("input : " + JSON.stringify({
                server,
                "username.length": username?.length,
                domain, outputFile, reportContent, period, unit, timezone, prefetch
                // password : dont log creds ^^ // Weakness - CWE-312 CWE-359 CWE-532
            }));
        }

        return {
            cloudApiKey, server, username, password, domain,
            outputFile, reportContent, period, unit, timezone, prefetch
        };
    }

    static async reportResults({
                                   pageViews, umamiOneLineReport, umamiReport, umamiReportFile
                               }) {
        let umamiReportLength = umamiReport?.length || 0;
        GithubAction.output("pageViews", pageViews);
        GithubAction.output("umamiOneLineReport", umamiOneLineReport);
        GithubAction.output("umamiReport", umamiReport);
        GithubAction.output("umamiReportLength", umamiReportLength);
        if (isSet(umamiReportFile)) {
            GithubAction.output("umamiReportFile", umamiReportFile);
        }
        return {pageViews, umamiOneLineReport, umamiReport, umamiReportLength, umamiReportFile};
    }

}
