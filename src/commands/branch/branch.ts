import { Command as CommanderCommand } from 'commander';
import inquirer from 'inquirer';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from '../type';
import {Application} from '../../lib/application';
import { GIT } from '../../lib/git';
import { TextConverter } from '../../lib/text-converter';

@Implements<CommandProcessor>()
export class CommandBranch {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('branch')
            .alias('b')
            .description('Create a new conventional branch')
            .action(() =>
                actionCallback({
                    command: this,
                    arguments: {},
                }),
            );
    }

    public static async process(
        application: Application,
        args: CommandActionArguments,
    ) {
        const answers = await inquirer
            .prompt([
                {
                    message: 'What kind of ticket are you working on?',
                    name: 'ticket_type',
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
                            name: 'style (code formatting, no production code change)',
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
                    message: 'What does the ticket say?',
                    name: 'ticket_title',
                },
                {
                    message: 'What is the ticket number?',
                    name: 'ticket_number',
                },
            ]);

        console.log(`${answers.ticket_type}/${TextConverter.toKebab(answers.ticket_title)}-${TextConverter.toKebab(answers.ticket_number)}`);

        await GIT.newBranch(
            `${answers.ticket_type}/${TextConverter.toKebab(answers.ticket_title)}-${TextConverter.toKebab(answers.ticket_number)}`
        );
    }
}
