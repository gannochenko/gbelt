import { Command as CommanderCommand } from 'commander';
import debug from 'debug';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import {
    ActionCallback,
    CommandActionArguments,
    CommandProcessor,
    Implements,
} from './type';
import { Application } from '../lib/application';
import { RC } from '../lib/rc';

const writeFile = promisify(fs.writeFile);
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

        try {
            await writeFile(path.join(process.cwd(), '.gbeltrc'), this.getDemoFileContent());

            console.log('Done.');
        } catch (error) {
            d(error);
            console.error('The file was not created.');
        }
    }

    private static getDemoFileContent() {
        return `module.exports = {
    developmentBranch: 'dev', // the main dev branch where all the features go
    releaseBranch: 'master', // the branch you run deployments from
    // ticketIdPrefix: 'GT-', // if you work somewhere like Jira and you need you tickets to be auto-prefixed
    // useDraftPR: true, // create a draft feature PR when possible
    releasePRName: 'New release', // the default name for the release PR
    branchAutoPush: false, // force yes or no answer for the "Would you like this branch to be pushed?" question
    // ticketViewURLTemplate: 'https://your-bugtracker.com/ticket/#TICKET_ID#/', // URL of your bugtracker
};
`;
    }
}
