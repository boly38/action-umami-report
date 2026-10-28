import {appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import process from 'node:process';

const testFiles = [
    'tests/3_githubAction_input_parameters.test.js',
    'tests/4_githubAction_output_results.test.js'
];
const skippedSuites = [];

function addSuiteIfConfigured(name, requiredVariables, testFile) {
    const missing = requiredVariables.filter(variable => !process.env[variable]);
    if (missing.length > 0) {
        const message = `${name} tests skipped; missing prerequisites: ${missing.join(', ')}`;
        console.log(`::warning title=Integration tests skipped::${message}`);
        if (process.env.GITHUB_STEP_SUMMARY) {
            appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- **Skipped:** ${message}\n`);
        }
        skippedSuites.push(name);
        return;
    }

    testFiles.push(testFile);
}

addSuiteIfConfigured(
    'Hosted Umami',
    ['UMAMI_TEST_SERVER', 'UMAMI_TEST_USER', 'UMAMI_TEST_PASSWORD', 'UMAMI_TEST_SITE_DOMAIN'],
    'tests/1_sinon_hosted_umami.test.js'
);
addSuiteIfConfigured(
    'Umami Cloud',
    ['UMAMI_TEST_CLOUD_API_KEY', 'UMAMI_TEST_CLOUD_SITE_DOMAIN'],
    'tests/2_sinon_cloud_umami.test.js'
);
addSuiteIfConfigured(
    'Manual hosted Umami',
    ['UMAMI_SERVER', 'UMAMI_PASSWORD', 'UMAMI_SITE_DOMAIN'],
    'tests/0_env_based.test.js'
);

const coverageArgs = [];
if (skippedSuites.length > 0) {
    // Coverage thresholds assume all integration suites ran. Continue reporting
    // coverage for this reduced run without failing on those thresholds alone.
    coverageArgs.push('--check-coverage=false');
    const message = 'Coverage thresholds were not enforced because one or more integration suites were skipped.';
    console.log(`::warning title=Coverage thresholds skipped::${message}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- **Coverage:** ${message}\n`);
    }
}

const result = spawnSync(
    'pnpm',
    ['exec', 'c8', ...coverageArgs, 'mocha', '--timeout', '10000', ...testFiles],
    {stdio: 'inherit'}
);

if (result.error) {
    console.error(result.error);
    process.exitCode = 1;
} else {
    process.exitCode = result.status ?? 1;
}
