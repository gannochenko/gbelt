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

@Implements<CommandProcessor>()
export class CommandAccept {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('accept')
            .alias('a')
            .description('Merge a feature PR into the dev branch')
            .action((command: CommanderCommand) =>
                actionCallback({
                    command: this,
                    arguments: {
                    },
                }),
            );
    }

    public static async process(
        application: Application,
        args: CommandActionArguments,
    ) {
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
