import { Command as CommanderCommand } from 'commander';
import { ActionCallback, CommandActionArguments } from './type';
import { Application } from '../lib/application';
export declare class CommandFeature {
    static attach(program: CommanderCommand, actionCallback: ActionCallback): void;
    static process(application: Application, args: CommandActionArguments): Promise<void>;
    static processActionBranch(): Promise<void>;
    static processActionSubmit(): Promise<void>;
    static processActionAccept(): Promise<void>;
    static processActionInfo(): Promise<void>;
    static processActionSave(): Promise<void>;
    static processActionSavePush(): Promise<void>;
    static processActionList(): Promise<void>;
    private static getTemplate;
}
