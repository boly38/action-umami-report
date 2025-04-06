import core from '@actions/core';
import GithubAction from '../lib/services/githubAction.js';
import {afterEach, beforeEach, describe, it} from "mocha";
import {expect} from 'chai';
import sinon from "sinon";


describe("GithubAction.getActionInputParameters", function () {
    let getInputStub;
    let getBooleanInputStub;

    beforeEach(() => {
        // Mock core.getInput core.getBooleanInput
        getInputStub = sinon.stub(core, 'getInput');
        getBooleanInputStub = sinon.stub(core, 'getBooleanInput');
    });

    afterEach(() => {
        getInputStub.restore();
        getBooleanInputStub.restore();
    });

    it("should return parameters for cloud mode", function () {
        getInputStub.withArgs('umami-cloud-api-key').returns('api_key');
        getInputStub.withArgs('umami-site-domain').returns('example.com');
        getBooleanInputStub.withArgs('umami-prefetch', false).returns(false);

        const params = GithubAction.getActionInputParameters();

        expect(params).to.have.property('cloudApiKey', 'api_key');
        expect(params).to.have.property('domain', 'example.com');
        expect(params).to.have.property('prefetch', false);
    });

    it("should throw an error if required parameters for hosted mode are missing", function () {
        getInputStub.withArgs('umami-cloud-api-key').returns('');
        getInputStub.withArgs('umami-server').returns('');
        getInputStub.withArgs('umami-user').returns('');
        getInputStub.withArgs('umami-password').returns('');

        expect(() => GithubAction.getActionInputParameters()).to.throw("Umami hosted mode requires umami-server, umami-user, umami-password");
    });

    it("should throw an error if cloud mode parameters are mixed with hosted mode", function () {
        getInputStub.withArgs('umami-cloud-api-key').returns('api_key');
        getInputStub.withArgs('umami-server').returns('http://localhost');
        getInputStub.withArgs('umami-user').returns('user');
        getInputStub.withArgs('umami-password').returns('pass');

        expect(() => GithubAction.getActionInputParameters()).to.throw("Umami cloud mode with api-key doesn't need umami-server, umami-user, umami-password");
    });
});
