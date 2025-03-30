import GithubAction from './lib/githubAction.js'

const action = new GithubAction();
action.doAction()
    .then(r => {});
