import { Command as CommanderCommand } from 'commander';
import { CommandRelease } from './CommandRelease';
import { ActionCallback } from './type';
export declare class Commands {
    protected static getCommands(): (typeof CommandRelease)[];
    static getDefaultCommand(): null;
    static processCLI(program: CommanderCommand): void;
    static attachCommands(program: CommanderCommand, actionCallback: ActionCallback): void;
}
