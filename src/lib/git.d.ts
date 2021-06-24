import { BranchDescriptionType } from './type';
export declare const isAvailable: (cmd: string) => Promise<boolean>;
export declare class GIT {
    protected static isGitAvailable: boolean;
    static init(url: string, cwd: string, as: string): Promise<void>;
    static clone(url: string, cwd: string, as: string): Promise<void>;
    static fetch(branch: string, path?: string): Promise<void>;
    static checkout(branch: string, path?: string): Promise<void>;
    static pull(branch: string, remote?: string, path?: string): Promise<void>;
    static push(branch: string, remote?: string, path?: string): Promise<void>;
    static createBranch(branch: string, description?: string, path?: string): Promise<void>;
    static getCurrentBranch(path?: string): Promise<{
        name: string;
        description?: BranchDescriptionType;
    } | null>;
    static getRemoteInfo(which?: string, path?: string): Promise<{
        owner: string;
        repo: string;
    } | null>;
    static isAvailable(): Promise<boolean>;
    static getInstallationInfo(): string;
    static pushSetUpstream(branch: string, path?: string): Promise<void>;
    static deleteBranch(branch: string, path?: string): Promise<void>;
    static hasStage(path?: string): Promise<boolean>;
    static commit(message: string): Promise<void>;
    static getBranches(): Promise<RegExpMatchArray>;
    static getBranchInfo(branchName: string, path?: string): Promise<{
        name: string;
        description?: BranchDescriptionType | undefined;
    }>;
}
