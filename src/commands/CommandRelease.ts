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
import { composeCommitMessage, getRemoteOrThrow } from '../lib/util';

const d = debug('release');

const ACTION_CREATE = 'create';
const ACTION_ACCEPT = 'accept';

@Implements<CommandProcessor>()
export class CommandRelease {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('release [action]')
            .alias('r')
            .description('Create and perform a accept')
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

        if (action !== ACTION_CREATE && action !== ACTION_ACCEPT) {
            throw new Error(`Unknown action: ${action}`);
        }

        const config = await RC.getConfig();
        const github = new GitHub();

        if (config.releaseBranch === config.developmentBranch) {
            console.log(
                'You have your release branch equal to the development branch. Not much I can do here.',
            );
            return;
        }

        const remoteInfo = await getRemoteOrThrow();

        const prList = (await github.getPRList({
            ...remoteInfo,
            base: config.releaseBranch,
            head: config.developmentBranch || 'dev',
        })).data;

        if (action === ACTION_CREATE) {
            if (prList.length) {
                console.log(`A release PR already exists: ${prList[0].html_url}`);
                return;
            }

            const result = await github.createPR({
                ...remoteInfo,
                title: 'Release!',
                base: config.releaseBranch,
                head: config.developmentBranch || 'dev',
            });
            if (result.data.id) {
                d('Result', result.data);
                // eslint-disable-next-line no-console
                console.log(`The release PR was created. Check out: ${result.data.html_url}`);
            }
        }

        if (action === ACTION_ACCEPT) {
            if (!prList.length) {
                console.log(`You don't have any release PR created. Create one with 'ghtrick release ${ACTION_CREATE}'.`);
                return;
            }

            const [ pr ] = prList;

            console.log('You are about to merge something to the release branch. If you have the Continuous Delivery set up, it will most likely trigger the production deployment.');
            console.log(`You might want to look at your PR again: ${pr.html_url}`);
            const answers = await inquirer.prompt([
                {
                    message: 'Proceed?',
                    name: 'proceed',
                    type: 'confirm',
                    default: false,
                },
            ]);

            if (answers.proceed) {
                console.log('Rock and roll!');
                const result = await github.mergePR({
                    ...remoteInfo,
                    pull_number: pr.number,
                    commit_title: `Release! (#${pr.number})`,
                    merge_method: 'merge',
                });

                if (result.status === 200) {
                    console.log(
                        `The release PR #${pr.number} was successfully merged.`,
                    );
                }
            } else {
                console.log('Wise.');
            }
        }
    }
}
