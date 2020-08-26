import { Command as CommanderCommand } from 'commander';

import { CommandSubmit } from './CommandSubmit';
import { CommandBranch } from './CommandBranch';
import { CommandAccept } from './CommandAccept';
import { CommandRelease } from './CommandRelease';
import { ActionCallback } from './type';

export class Commands {
    protected static getCommands() {
        return [CommandSubmit, CommandBranch, CommandAccept, CommandRelease];
    }

    public static getDefaultCommand() {
        return null;
    }

    public static processCLI(program: CommanderCommand) {}

    public static attachCommands(
        program: CommanderCommand,
        actionCallback: ActionCallback,
    ) {
        this.getCommands().forEach((command) =>
            command.attach(program, actionCallback),
        );
    }
}
