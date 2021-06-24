import { Command as CommanderCommand } from 'commander';
import { ObjectLiteral } from '../type';
import { Application } from '../lib/application';
export declare type CommandActionArguments = ObjectLiteral;
export interface CommandAction {
    command: CommandProcessor;
    arguments: CommandActionArguments;
}
export declare type ActionCallback = (action: CommandAction) => void;
interface CommandProcessorInstance {
}
export interface CommandProcessor {
    new (): CommandProcessorInstance;
    attach(program: CommanderCommand, actionCallback: ActionCallback): void;
    process(application: Application, args?: CommandActionArguments): Promise<void>;
}
export declare function Implements<T>(): <U extends T>(constructor: U) => void;
export {};
