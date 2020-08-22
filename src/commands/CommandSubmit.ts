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

        await github.createPR({
            head: branch.name,
            owner: 'gannochenko',
            repo: 'ghtrick',
            title: `${branch.description.type}: ${branch.description.title} [${branch.description.id}]`,
            body: `## Description
- tmp PR

## Dependencies
- do this before or along with merging

## Ticket
https://your-bugtracker.com/ticket/GANN-2/
`,
        });
    }
}
