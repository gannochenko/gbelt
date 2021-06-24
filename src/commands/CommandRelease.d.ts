import { Command as CommanderCommand } from 'commander';
import { ActionCallback, CommandActionArguments } from './type';
import { Application } from '../lib/application';
export declare class CommandRelease {
    static attach(program: CommanderCommand, actionCallback: ActionCallback): void;
    static process(application: Application, args: CommandActionArguments): Promise<void>;
}
