import { Command as CommanderCommand } from 'commander';
import debug from 'debug';
import inquirer from 'inquirer';
import ejs from 'ejs';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { GitHub } from '../lib/github';
import { RC } from '../lib/rc';
import {
    composeBranchName,
    composeCommitMessage,
    composePRName,
    getBranchOrThrow,
    getRemoteOrThrow,
} from '../lib/util';
import { GIT } from '../lib/git';
import { BranchDescriptionType } from '../lib/type';

const d = debug('feature');

const ACTION_BRANCH = 'branch';
const ACTION_CREATE = 'create';
const ACTION_SUBMIT = 'submit';
const ACTION_MERGE = 'merge';
const ACTION_INFO = 'info';
const ACTION_SAVE = 'save';
const ACTION_LIST = 'list';

@Implements<CommandProcessor>()
export class CommandFeature {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('feature [action]')
            .alias('f')
            .description(
                `Create, publish and accept a feature. [action] may be one of:

    * ${ACTION_CREATE} - create a local feature branch
    * ${ACTION_SUBMIT} - create a feature PR based on the current feature branch
    * ${ACTION_MERGE} - merge the feature PR that matches the current feature branch
    * ${ACTION_INFO} - get information about the current feature
    * ${ACTION_SAVE} - creates a local commit with a message "work in progress"
    * ${ACTION_LIST} - display feature list
`,
            )
            .action((action: string, command: CommanderCommand) =>
                actionCallback({
                    command: this,
                    arguments: {
                        action,
                    },
                }),
            );
    }

    public static async process(
        application: Application,
        args: CommandActionArguments,
    ) {
        const { action } = args;

        if (action === ACTION_BRANCH || action === ACTION_CREATE) {
            await this.processActionBranch();
        } else if (action === ACTION_SUBMIT) {
            await this.processActionSubmit();
        } else if (action === ACTION_MERGE) {
            await this.processActionAccept();
        } else if (action === ACTION_INFO) {
            await this.processActionInfo();
        } else if (action === ACTION_SAVE) {
            await this.processActionSave();
        } else if (action === ACTION_LIST) {
            await this.processActionList();
        } else {
            throw new Error(`Unknown action: ${action}`);
        }
    }

    static async processActionBranch() {
        const { ticketIdPrefix, branchAutoPush } = await RC.getConfig();

        const answers = await inquirer.prompt([
            {
                message: 'What kind of ticket are you working on?',
                name: 'type',
                type: 'list',
                choices: [
                    {
                        name: 'feature (new feature for the user)',
                        value: 'feat',
                    },
                    {
                        name: 'fix (bug fix for the user)',
                        value: 'fix',
                    },
                    {
                        name: 'docs (changes to the documentation)',
                        value: 'docs',
                    },
                    {
                        name:
                            'style (code formatting, no production code change)',
                        value: 'style',
                    },
                    {
                        name: 'refactor (refactoring production code)',
                        value: 'refactor',
                    },
                    {
                        name: 'test (adding missing tests)',
                        value: 'test',
                    },
                    {
                        name: 'chore (updating repo infrastructure)',
                        value: 'chore',
                    },
                ],
                default: 'feat',
            },
            {
                message: 'What is the scope of this ticket (optional)?',
                name: 'scope',
            },
            {
                message: 'What does the ticket say?',
                name: 'title',
                validate: (value: string) => {
                    if (!value) {
                        return 'Must not be empty';
                    }

                    return true;
                },
            },
            {
                message: 'What is the ticket ID?',
                name: 'id',
                default: '',
            },
            {
                message: 'Would you like this branch to be pushed?',
                name: 'branchAutoPush',
                type: 'confirm',
                default: true,
                when: () => branchAutoPush === undefined,
            },
        ]);

        if (
            ticketIdPrefix &&
            answers.id.length &&
            !answers.id.startsWith(ticketIdPrefix)
        ) {
            answers.id = `${ticketIdPrefix}${answers.id}`;
        }

        d(answers);

        const branchName = composeBranchName(answers);
        const branchDescription = JSON.stringify(answers);

        await GIT.createBranch(branchName, branchDescription);

        if (branchAutoPush === true || answers.branchAutoPush === true) {
            await GIT.pushSetUpstream(branchName);
        }
    }

    static async processActionSubmit() {
        const branch = await getBranchOrThrow();
        d('Branch info', branch);

        const remoteInfo = await getRemoteOrThrow();
        d('Remote info', remoteInfo);

        const { id } = branch.description!;

        const config = await RC.getConfig();
        d('Config', config);

        const github = new GitHub();
        const body = await this.getTemplate(github, branch.description!);
        const options = {
            head: branch.name,
            ...remoteInfo,
            title: composePRName(branch.description!),
            base: config.developmentBranch || undefined,
            draft: !!config.useDraftPR,
            body,
        };

        d('POST /repos/{owner}/{repo}/pulls', options);

        const result = await github.createPR(options);
        if (result.data.id) {
            d('Result', result.data);
            // eslint-disable-next-line no-console
            console.log(`PR was created. Check out: ${result.data.html_url}`);
        }
    }

    static async processActionAccept() {
        const branch = await getBranchOrThrow();
        d('Branch info', branch);

        const remoteInfo = await getRemoteOrThrow();
        d('Remote info', remoteInfo);

        const config = await RC.getConfig();
        d('Config', config);

        const github = new GitHub();

        const pr = await github.getPRByBranch(
            branch.name,
            config.developmentBranch,
            remoteInfo,
        );

        d('PR list', pr);

        if (!pr) {
            console.error(
                `No PR found for the current feature branch "${branch.name}"`,
            );
            console.error('Make one either on site or via "gbelt submit".');
            return;
        }

        const prURL = pr.html_url;

        // https://docs.github.com/en/free-pro-team@latest/graphql/reference/enums

        if (pr.draft) {
            console.error(
                `The pull request is in the draft state, can't merge. Un-draft it first: ${prURL}`,
            );
            return;
        }

        if (pr.state !== 'open') {
            console.error(`The pull request was closed, can't merge: ${prURL}`);
            return;
        }

        if (pr.locked) {
            console.error(`The pull request is locked, can't merge: ${prURL}`);
            return;
        }

        if (pr.merged) {
            console.error(`The pull request was already merged: ${prURL}`);
            return;
        }

        if (pr.mergeable_state !== 'clean') {
            if (pr.mergeable_state === 'unstable') {
                console.error(
                    `The pull request checks were not passed, can't merge: ${prURL}`,
                );
            } else {
                console.error(`The pull can't be merged: ${prURL}`);
            }
            return;
        }

        console.log(
            'Sometimes you wanna change the message of the PR, to make it prettier for the CHANGELOG.',
        );
        console.log(
            'Careful, this message could be seen by thousands of people!',
        );
        console.log(`Current message: ${branch.description!.title}`);
        const answers = await inquirer.prompt([
            {
                message: 'Alternative message would be:',
                name: 'title',
            },
        ]);

        const newDescription = {
            ...branch.description!,
            title: answers.title || branch.description!.title,
        };

        const result = await github.mergePR({
            ...remoteInfo,
            pull_number: pr.number,
            commit_title: composeCommitMessage(newDescription, pr.number),
        });

        if (result.status === 200) {
            // eslint-disable-next-line no-console
            console.log(
                `The feature PR #${pr.number} was successfully merged.`,
            );

            const devBranch = config.developmentBranch;

            await GIT.checkout(devBranch);

            const afterAnswers = await inquirer.prompt([
                {
                    message: 'Delete the feature branch locally?',
                    name: 'delete_branch',
                    type: 'confirm',
                    default: true,
                },
                {
                    message: `Pull the "${devBranch}" branch to get the latest changes?`,
                    name: 'pull_dev',
                    type: 'confirm',
                    default: true,
                },
            ]);
            if (afterAnswers.delete_branch) {
                await GIT.deleteBranch(branch.name);
            }
            if (afterAnswers.pull_dev) {
                await GIT.pull(devBranch);
            }
        }
    }

    static async processActionInfo() {
        const branch = await getBranchOrThrow();
        d('Branch info', branch);

        const config = await RC.getConfig();
        d('Config', config);

        const formatTicket = (ticketId: string) => {
            if (config.ticketViewURLTemplate) {
                return config.ticketViewURLTemplate.replace(
                    '#TICKET_ID#',
                    ticketId,
                );
            }

            return ticketId;
        };

        console.log(`Feature info:

    Branch: ${branch.name}
    Ticket: ${formatTicket(branch.description!.id)}`);

        const remoteInfo = await getRemoteOrThrow();
        d('Remote info', remoteInfo);

        if (!remoteInfo) {
            return;
        }

        const github = new GitHub();
        const pr = await github.getPRByBranch(
            branch.name,
            config.developmentBranch,
            remoteInfo,
        );

        const getPRStatus = () => {
            const result: string[] = [];

            if (pr.state === 'open') {
                result.push('open');
            }

            if (pr.draft) {
                result.push('draft');
            }

            if (pr.mergeable_state === 'unstable') {
                result.push('checking');
            }

            if (pr.mergeable_state === 'clean') {
                result.push('ready');
            }

            if (pr.mergeable_state === 'blocked') {
                result.push('blocked');
            }

            return result.join(', ');
        };

        if (!pr) {
            console.log(`
No Pull Request info available. The feature is not yet submitted or was already merged.`);
            return;
        }

        console.log(`    PR:     ${pr.html_url}
    Status: ${getPRStatus()}
`);
    }

    static async processActionSave() {
        const branch = await getBranchOrThrow();
        d('Branch info', branch);

        if (!(await GIT.hasStage())) {
            console.log('No changes to commit.');
            return;
        }

        await GIT.commit('Work in progress');
    }

    static async processActionList() {
        const config = await RC.getConfig();
        d('Config', config);

        const { developmentBranch, releaseBranch } = config;

        const list = await GIT.getBranches();
        const result = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const branch of list) {
            if (branch !== developmentBranch && branch !== releaseBranch) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const info = await GIT.getBranchInfo(branch);
                    if (info && info.description) {
                        result.push(info);
                    }
                } catch (e) {}
            }
        }

        console.log('Current features under development:\n');
        result.forEach((info) => {
            console.log(
                `   * ${composeCommitMessage(
                    info.description!,
                    undefined,
                    config,
                )} (${info.name})`,
            );
        });
        console.log('');

        // console.log(list);
        // const branch = await getBranchOrThrow();
        // d('Branch info', branch);
        //
        // if (!(await GIT.hasStage())) {
        //     console.log('No changes to commit.');
        //     return;
        // }
        //
        // await GIT.commit('Work in progress');
    }

    private static async getTemplate(
        github: GitHub,
        description: BranchDescriptionType,
    ) {
        let template = await github.getDynamicTemplate();
        if (template) {
            template = ejs.render(template, {
                ...description,
                ticketId: description.id,
            });
        } else {
            template = await github.getTemplate();
        }

        const { id } = description;
        return template.replace(/#TICKET_ID#/g, id.length ? id : '000');
    }
}
