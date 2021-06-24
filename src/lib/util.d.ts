import { BranchDescriptionType } from './type';
import { RCType } from './rc';
export declare const composeBranchName: (description: BranchDescriptionType) => string;
export declare const composePRName: (description: BranchDescriptionType, config?: RCType | undefined) => string;
export declare const composeCommitMessage: (description: BranchDescriptionType, prId?: number | undefined, config?: RCType | undefined) => string;
export declare const getRemoteOrThrow: () => Promise<{
    owner: string;
    repo: string;
}>;
export declare const getBranchOrThrow: () => Promise<{
    name: string;
    description?: BranchDescriptionType | undefined;
}>;
