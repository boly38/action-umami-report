import {env} from 'node:process';
import {afterEach, beforeEach, describe, it} from "mocha";
import core from '@actions/core';
import sinon from 'sinon';

import UmamiReport from "../lib/umamiReport.js";
import {verboseStringify} from "./testUtil.js";

describe("Test action-umami-report sinon based githubActionReport", function () {
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

    it("should report using default options (1day)", async function () {
        getInputStub.withArgs('umami-server').returns(env["UMAMI_SERVER"]);
        getInputStub.withArgs('umami-user').returns(env["UMAMI_USER"]);
        getInputStub.withArgs('umami-password').returns(env["UMAMI_PASSWORD"]);
        getInputStub.withArgs('umami-site-domain').returns(env["UMAMI_SITE_DOMAIN"]);
        getBooleanInputStub.withArgs('umami-prefetch', false).returns(false);

        await UmamiReport.githubActionReport()
            .then(verboseStringify).catch(console.error);
    });


});