import { Command as CommanderCommand } from 'commander';
import debug from 'debug';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { RC } from '../lib/rc';

const d = debug('release');

@Implements<CommandProcessor>()
export class CommandScaffold {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('scaffold')
            .alias('s')
            .description(
                `Scaffolds a .gbeltrc file in the current folder`,
            )
            .action((action: string) =>
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
        const config = await RC.getConfig();

        d('Config', config);

        console.log('!!!');
    }
}
