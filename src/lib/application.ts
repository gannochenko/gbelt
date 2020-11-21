import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import commander from 'commander';
import process from 'process';
import debug from 'debug';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import { Commands } from '../commands/commands';
import { CommandAction, CommandProcessor } from '../commands/type';
import { Nullable, ObjectLiteral } from '../type';

const getFileAccessError = promisify(fs.access);
const readFile = promisify(fs.readFile);

const d = debug('app');

export class Application {
    private introShown = false;

    public async run() {
        await this.showIntro();
        const command = await this.processCLI();
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

    private async processCLI(): Promise<CommandAction | null> {
        const program = new commander.Command();

        let commandToRun: Nullable<CommandProcessor> = null;
        let commandArguments: ObjectLiteral = {};

        program
            .name('gbelt')
            .version(
                await this.getVersion(),
                '-v, --version',
                'output the current version',
            )
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

    private async getVersion(): Promise<string> {
        const UNKNOWN_VERSION = '0.0.0';

        const packagePath = path.normalize(
            path.join(__dirname, '../../package.json'),
        );
        const accessError = await getFileAccessError(packagePath);
        // @ts-ignore
        if (accessError) {
            return UNKNOWN_VERSION;
        }

        try {
            const packageData = JSON.parse(
                (await readFile(packagePath)).toString('utf8'),
            );
            return packageData.version || UNKNOWN_VERSION;
        } catch (error) {
            console.error('Was not able to read the package.json file');
        }

        return UNKNOWN_VERSION;
    }
}
