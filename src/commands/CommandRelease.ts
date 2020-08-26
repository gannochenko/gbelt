import { Command as CommanderCommand } from 'commander';
import debug from 'debug';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { GitHub } from '../lib/github';
import { GIT } from '../lib/git';
import { RC } from '../lib/rc';
import { composeCommitMessage, getRemoteOrThrow } from '../lib/util';

const d = debug('submit');

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

        console.log(action);
        console.log(prList);

        // const branch = await GIT.getCurrentBranch();
        //
        // if (!branch || !branch.description) {
        //     return;
        // }
        // const remoteInfo = await GIT.getRemoteInfo();
        //
        // if (!remoteInfo) {
        //     return;
        // }
        //
        // const config = await RC.getConfig();
        //
        // d('Config', config);
        //
        // const github = new GitHub();
        //
        // const prList = await github.getPRList({
        //     ...remoteInfo,
        //     base: config.developmentBranch || undefined,
        //     head: branch.name,
        // });
        //
        // if (!prList.data.length) {
        //     console.error(`No PR found for the current feature branch "${branch.name}"`);
        //     console.error('Make one either on site or via "ghtrick submit".');
        //     return;
        // }
        //
        // if (prList.data.length > 1) {
        //     console.error(`There is more than one PR matching the current feature branch "${branch.name}"`);
        //     console.error('Only one PR is allowed to have.');
        //     return;
        // }
        //
        // const pr = prList.data[0];
        //
        // const result = await github.mergePR({
        //     ...remoteInfo,
        //     pull_number: pr.number,
        //     commit_title: composeCommitMessage(branch.description, pr.number),
        // });
        //
        // if (result.status === 200) {
        //     // eslint-disable-next-line no-console
        //     console.log(
        //         `The feature PR #${pr.number} was successfully merged.`,
        //     );
        // }
    }
}
