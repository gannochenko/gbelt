import { Command as CommanderCommand } from 'commander';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { GitHub } from '../lib/github';
import { GIT } from '../lib/git';

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
        // eslint-disable-next-line no-console
        const github = new GitHub();

        const branch = await GIT.getCurrentBranch();
        if (!branch || !branch.description) {
            return;
        }

        const remoteInfo = await GIT.getRemoteInfo();
        if (!remoteInfo) {
            return;
        }

        const body = (await github.getTemplate()).replace(/#TICKET_ID#/g, branch.description.id);

        await github.createPR({
            head: branch.name,
            ...remoteInfo,
            title: `${branch.description.type}: ${branch.description.title} [${branch.description.id}]`,
            body,
        });
    }
}
