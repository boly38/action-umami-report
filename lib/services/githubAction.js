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
        let val = core.getBooleanInput(variableName);
        return val !== undefined ? val : defaultValue;
    }

    static output(resultName, resultValue) {
        verbose && console.info(`produce action result (output): ${resultName}`);
        core.setOutput(resultName, resultValue);// core action output: to be declared as outputs by current job and used by another job
        // disabled by #12 // core.exportVariable(resultName, resultValue);// core action env: to be used by current job by another step
    }

    static getActionInputParameters() {
        //~ GitHub action inputs
        const server = GithubAction.input('umami-server',
            {required: true, trimWhitespace: true}, null);// example : https://umami.myinstance.com
        const username = GithubAction.input('umami-user',
            {required: true}); // example : admin
        const password = GithubAction.input('umami-password',
            {required: true}); // example : mY53[R3T
        const domain = GithubAction.input('umami-site-domain',
            {required: false}, null);// ''
        const outputFile = GithubAction.input('umami-report-file',
            {required: false}, null);// ''
        const reportContent = GithubAction.input('umami-report-content',
            {required: false}, 'pageviews|events|urls');
        const period = GithubAction.input('umami-period',
            {required: false}, '24h');
        const unit = GithubAction.input('umami-unit',
            {required: false}, 'hour');// 'hour' // used by pageviews and events. need to be correlated to the period
        const timezone = GithubAction.input('umami-tz',
            {required: false}, 'Europe/Paris');// 'Europe/Paris'
        const prefetch = GithubAction.inputBoolean('umami-prefetch', false);
        //~ Github action inputs - end
        verbose && console.log("input : " + JSON.stringify({
            server,
            "username.length": username?.length,
            // password : dont log creds ^^ // Weakness - CWE-312 CWE-359 CWE-532
            domain, outputFile, reportContent, period, unit, timezone, prefetch
        }));
        return {server, username, password, domain, outputFile, reportContent, period, unit, timezone, prefetch};
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
