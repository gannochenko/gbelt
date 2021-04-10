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
import {
    composeBranchName,
    composeCommitMessage,
    composePRName,
    getBranchOrThrow,
    getRemoteOrThrow,
} from '../lib/util';
import { GIT } from '../lib/git';

const d = debug('feature');

const ACTION_BRANCH = 'branch';
const ACTION_CREATE = 'create';
const ACTION_SUBMIT = 'submit';
const ACTION_MERGE = 'merge';
const ACTION_INFO = 'info';

@Implements<CommandProcessor>()
export class CommandFeatures {
    public static attach(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        program
            .command('features')
            .alias('f')
            .description('Manage existing features interactively')
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
    ) {}
}
