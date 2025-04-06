import UmamiReport from "../lib/umamiReport.js";
import {verboseStringify} from "./testUtil.js";
import {describe, before, it} from "mocha";

let options;

describe("Env based tests", function () {
    before(function () {
            try {
                options = UmamiReport.getOptions();
            } catch (error) {
                console.error(error);
                this.skip(error);
            }
        }
    );

    it("should report using default options (1day)", async function () {
        await UmamiReport.manualReport(UmamiReport.getOptions())
            .then(verboseStringify).catch(console.error);
    });

    it("should report 1week (u:day)", async function () {
        await UmamiReport.manualReport(UmamiReport.getOptions({
            "period": "1week",
            "unit": "day"
        })).then(verboseStringify).catch(console.error);
    });

    it("should report 1week (u:hour)", async function () {
        await UmamiReport.manualReport(UmamiReport.getOptions({
            "period": "1week",
            "unit": "hour"
        })).then(verboseStringify).catch(console.error);
    });

    it("should report 1month (u:day)", async function () {
        await UmamiReport.manualReport(UmamiReport.getOptions({
            "period": "1month",
            "unit": "day"
        })).then(verboseStringify).catch(console.error);
    });

    it("should report 1month (u:hour)", async function () {
        await UmamiReport.manualReport(UmamiReport.getOptions({
            "period": "1month",
            "unit": "hour"
        })).then(verboseStringify).catch(console.error);
    });

});