import { Command as CommanderCommand } from 'commander';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { GitHub } from '../lib/github';

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

        await github.createPR();
    }
}
