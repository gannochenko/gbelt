import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import commander from 'commander';
import process from 'process';
import debug from 'debug';

import { VERSION } from './constants';
import { Commands } from '../commands/commands';
import { CommandAction, CommandProcessor } from '../commands/type';
import { Nullable, ObjectLiteral } from '../type';

const d = debug('app');

export class Application {
    private introShown = false;

    public async run() {
        await this.showIntro();
        const command = this.processCLI();
        if (!command) {
            // eslint-disable-next-line no-console
            console.log('No command specified. Try -h for available commands.');
        }

        await command!.command.process(this, command!.arguments);
    }

    public async showIntro() {
        if (this.introShown) {
            return;
        }

        clear();
        // eslint-disable-next-line no-console
        console.log(
            chalk.red(
                figlet.textSync("G' GitH ToolBelt", {
                    horizontalLayout: 'full',
                }),
            ),
        );

        this.introShown = true;
    }

    private processCLI(): CommandAction | null {
        const program = new commander.Command();

        let commandToRun: Nullable<CommandProcessor> = null;
        let commandArguments: ObjectLiteral = {};

        program
            .name('gbelt')
            .version(VERSION, '-v, --version', 'output the current version')
            .description('GitHub Toolbelt: helps to automate PR routine')
            .option('-d, --debug', 'output an additional debug info');

        // @ts-ignore
        Commands.attachCommands(program, (command) => {
            commandToRun = command.command;
            commandArguments = command.arguments || {};
        });

        program.parse(process.argv);

        if (!commandToRun) {
            commandToRun = Commands.getDefaultCommand();
        }

        if (!commandToRun) {
            return null;
        }

        return {
            command: commandToRun!,
            arguments: {
                ...commandArguments,
                debug: program.debug,
            },
        };
    }
}
