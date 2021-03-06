import { Command as CommanderCommand } from 'commander';

import { CommandFeature } from './CommandFeature';
import { CommandRelease } from './CommandRelease';
import { CommandScaffold } from './CommandScaffold';
import { ActionCallback } from './type';

export class Commands {
    protected static getCommands() {
        return [CommandFeature, CommandRelease, CommandScaffold];
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
