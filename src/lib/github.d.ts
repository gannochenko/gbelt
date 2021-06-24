declare type GitHubRemoteInfoType = {
    owner: string;
    repo: string;
};
declare type GitHubPRType = GitHubRemoteInfoType & {
    title: string;
    body?: string;
    head: string;
    base?: string;
    draft?: boolean;
    id?: string;
};
declare type GitHubUpdatePRType = Omit<Partial<GitHubPRType>, 'id' | 'base' | 'head'>;
declare type GitHubPRListType = {
    owner: string;
    repo: string;
    head: string;
    base?: string;
};
declare type GitHubPRMergeType = {
    owner: string;
    repo: string;
    merge_method?: string;
    commit_title?: string;
    pull_number?: number;
};
export declare class GitHub {
    private octokit?;
    private getOctokit;
    createPR(options: GitHubPRType): Promise<import("@octokit/types").OctokitResponse<any>>;
    updatePR(number: string, options: GitHubUpdatePRType): Promise<import("@octokit/types").OctokitResponse<any>>;
    getPR(number: number, options: GitHubRemoteInfoType): Promise<import("@octokit/types").OctokitResponse<any>>;
    unDraftPR(number: number, options: GitHubRemoteInfoType): Promise<import("@octokit/types").OctokitResponse<any>>;
    getTemplate(path?: string): Promise<string>;
    getDynamicTemplate(path?: string): Promise<string>;
    getPRList(options: GitHubPRListType): Promise<import("@octokit/types").OctokitResponse<any>>;
    getPRByBranch(headBranch: string, baseBranch: string, remoteInfo: GitHubRemoteInfoType): Promise<any>;
    mergePR(options: GitHubPRMergeType): Promise<import("@octokit/types").OctokitResponse<any>>;
}
export {};
