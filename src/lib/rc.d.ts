export declare type RCType = {
    developmentBranch: string;
    releaseBranch: string;
    ticketIdPrefix: string;
    useDraftPR: boolean;
    releasePRName: string;
    branchAutoPush?: boolean;
    ticketViewURLTemplate?: string;
};
export declare class RC {
    private static config?;
    static getConfig(): Promise<RCType>;
}
