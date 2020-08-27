import { Command as CommanderCommand } from 'commander';
import debug from 'debug';
import inquirer from 'inquirer';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { GitHub } from '../lib/github';
import { RC } from '../lib/rc';
import { composeBranchName, composeCommitMessage, getRemoteOrThrow } from '../lib/util';
import { GIT } from '../lib/git';

const d = debug('feature');

const ACTION_BRANCH = 'branch';
const ACTION_SUBMIT = 'submit';
const ACTION_ACCEPT = 'accept';

@Implements<CommandProcessor>()
export class CommandFeature {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('feature [action]')
            .alias('f')
            .description(`Create, publish and accept a feature. [action] may be one of:

    * ${ACTION_BRANCH} - will create a local feature branch
    * ${ACTION_SUBMIT} - will submit a feature PR
    * ${ACTION_ACCEPT} - will merge the current feature PR
`)
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

        if (action === ACTION_BRANCH) {
            await this.processActionBranch();
        } else if (action === ACTION_SUBMIT) {
            await this.processActionSubmit();
        } else if (action === ACTION_ACCEPT) {
            await this.processActionAccept();
        } else {
            throw new Error(`Unknown action: ${action}`);
        }
    }

    static async processActionBranch() {
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

                    return null;
                },
            },
            {
                message: 'What is the ticket ID?',
                name: 'id',
                default: '000',
            },
        ]);

        const { ticketIdPrefix } = await RC.getConfig();
        if (ticketIdPrefix && !answers.id.startsWith(ticketIdPrefix)) {
            answers.id = `${ticketIdPrefix}${answers.id}`;
        }

        d(answers);

        const branchName = composeBranchName(answers);
        const branchDescription = JSON.stringify(answers);

        await GIT.createBranch(branchName, branchDescription);
    }

    static async processActionSubmit() {
        const branch = await GIT.getCurrentBranch();

        if (!branch || !branch.description) {
            return;
        }
        const remoteInfo = await getRemoteOrThrow();

        const config = await RC.getConfig();

        d('Config', config);

        const github = new GitHub();
        const body = (await github.getTemplate()).replace(/#TICKET_ID#/g, branch.description.id);
        const options = {
            head: branch.name,
            ...remoteInfo,
            title: `${branch.description.type}: ${branch.description.title} [${branch.description.id}]`,
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
        const branch = await GIT.getCurrentBranch();

        if (!branch || !branch.description) {
            return;
        }
        const remoteInfo = await getRemoteOrThrow();

        const config = await RC.getConfig();

        d('Config', config);

        const github = new GitHub();

        const prList = await github.getPRList({
            ...remoteInfo,
            base: config.developmentBranch || undefined,
            head: branch.name,
        });

        if (!prList.data.length) {
            console.error(`No PR found for the current feature branch "${branch.name}"`);
            console.error('Make one either on site or via "gbelt submit".');
            return;
        }

        if (prList.data.length > 1) {
            console.error(`There is more than one PR matching the current feature branch "${branch.name}"`);
            console.error('Only one PR is allowed to have.');
            return;
        }

        const pr = prList.data[0];

        const result = await github.mergePR({
            ...remoteInfo,
            pull_number: pr.number,
            commit_title: composeCommitMessage(branch.description, pr.number),
        });

        if (result.status === 200) {
            // eslint-disable-next-line no-console
            console.log(
                `The feature PR #${pr.number} was successfully merged.`,
            );
        }
    }
}