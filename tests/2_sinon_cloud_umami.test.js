import {env} from 'node:process';
import {afterEach, beforeEach, describe, it} from "mocha";
import core from '@actions/core';
import sinon from 'sinon';

import UmamiReport from "../lib/umamiReport.js";
import {verboseStringify} from "./testUtil.js";

describe("Sinon based cloud tests", function () {
    let getInputStub;
    let getBooleanInputStub;

    beforeEach(() => {
        // Mock de `core.getInput`
        getInputStub = sinon.stub(core, 'getInput');
        getBooleanInputStub = sinon.stub(core, 'getBooleanInput');
    });

    afterEach(() => {
        getInputStub.restore();
        getBooleanInputStub.restore();
    });

    it("should report from umami cloud with default options (1day)", async function () {
        getInputStub.withArgs('umami-cloud-api-key').returns(env["UMAMI_TEST_CLOUD_API_KEY"]);
        getInputStub.withArgs('umami-site-domain').returns(env["UMAMI_TEST_CLOUD_SITE_DOMAIN"]);
        getBooleanInputStub.withArgs('umami-prefetch', false).returns(false);

        await UmamiReport.githubActionReport()
            .then(verboseStringify).catch(console.error);
    });


});