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

const d = debug('submit');

@Implements<CommandProcessor>()
export class CommandSubmit {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('submit')
            .alias('s')
            .description('Create a PR and submit')
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
        const remoteInfo = await GIT.getRemoteInfo();

        if (!remoteInfo) {
            return;
        }

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
}
