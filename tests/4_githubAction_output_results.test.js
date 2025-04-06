import core from '@actions/core';
import GithubAction from '../lib/services/githubAction.js';
import {expect} from 'chai';
import sinon from 'sinon';
import {afterEach, beforeEach, describe, it} from "mocha";

describe("GithubAction Output and ReportResults Tests", function () {
    let setOutputStub;

    beforeEach(() => {
        // Mock `core.setOutput`
        setOutputStub = sinon.stub(core, 'setOutput');
    });

    afterEach(() => {
        setOutputStub.restore();
    });

    describe("output method", function () {
        it("should set output correctly", function () {
            const resultName = "testOutput";
            const resultValue = "testValue";

            GithubAction.output(resultName, resultValue);

            expect(setOutputStub.calledOnce).to.be.true;
            expect(setOutputStub.calledWith(resultName, resultValue)).to.be.true;
        });
    });

    describe("reportResults method", function () {
        it("should output results correctly", async function () {
            const mockResults = {
                pageViews: 100,
                umamiOneLineReport: "Test report",
                umamiReport: "Detailed report",
                umamiReportFile: "report.txt"
            };

            const result = await GithubAction.reportResults(mockResults);

            expect(setOutputStub.callCount).to.equal(5); // 5 outputs should be set
            expect(setOutputStub.calledWith("pageViews", mockResults.pageViews)).to.be.true;
            expect(setOutputStub.calledWith("umamiOneLineReport", mockResults.umamiOneLineReport)).to.be.true;
            expect(setOutputStub.calledWith("umamiReport", mockResults.umamiReport)).to.be.true;
            expect(setOutputStub.calledWith("umamiReportLength", mockResults.umamiReport.length)).to.be.true;
            expect(setOutputStub.calledWith("umamiReportFile", mockResults.umamiReportFile)).to.be.true;

            expect(result).to.deep.equal({ ...mockResults, "umamiReportLength": mockResults.umamiReport.length});
        });

        it("should not output umamiReportFile if not set", async function () {
            const mockResults = {
                pageViews: 100,
                umamiOneLineReport: "Test report",
                umamiReport: "Detailed report",
                umamiReportFile: null
            };

            const result = await GithubAction.reportResults(mockResults);

            expect(setOutputStub.callCount).to.equal(4); // 4 outputs should be set
            expect(setOutputStub.calledWith("pageViews", mockResults.pageViews)).to.be.true;
            expect(setOutputStub.calledWith("umamiOneLineReport", mockResults.umamiOneLineReport)).to.be.true;
            expect(setOutputStub.calledWith("umamiReport", mockResults.umamiReport)).to.be.true;
            expect(setOutputStub.calledWith("umamiReportLength", mockResults.umamiReport.length)).to.be.true;

            expect(result).to.deep.equal({ ...mockResults, "umamiReportLength": mockResults.umamiReport.length});
        });
    });
});