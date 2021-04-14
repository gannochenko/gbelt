import { Octokit } from '@octokit/core';
// @ts-ignore
import findUpAll from 'find-up-all';
import { readFile as readFileCb } from 'fs';
import { promisify } from 'util';
import debug from 'debug';

const readFile = promisify(readFileCb);

type GitHubRemoteInfoType = {
    owner: string;
    repo: string;
};

type GitHubPRType = GitHubRemoteInfoType & {
    title: string;
    body?: string;
    head: string;
    base?: string;
    draft?: boolean;
    id?: string;
};

type GitHubUpdatePRType = Omit<Partial<GitHubPRType>, 'id' | 'base' | 'head'>;

type GitHubPRListType = {
    owner: string;
    repo: string;
    head: string;
    base?: string;
};

type GitHubPRMergeType = {
    owner: string;
    repo: string;
    // eslint-disable-next-line camelcase
    merge_method?: string;
    // eslint-disable-next-line camelcase
    commit_title?: string;
    // eslint-disable-next-line camelcase
    pull_number?: number;
};

const d = debug('github');

export class GitHub {
    private octokit?: Octokit;

    private getOctokit() {
        if (!this.octokit) {
            this.octokit = new Octokit({
                auth: process.env.GBELT_GITHUB_TOKEN,
            });
        }

        return this.octokit;
    }

    // https://docs.github.com/en/rest/reference/pulls
    public async createPR(options: GitHubPRType) {
        return this.getOctokit().request('POST /repos/{owner}/{repo}/pulls', {
            base: 'master',
            draft: false,
            ...options,
        });
    }

    // https://docs.github.com/en/rest/reference/pulls#update-a-pull-request
    public async updatePR(number: string, options: GitHubUpdatePRType) {
        return this.getOctokit().request(
            'POST /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                pull_number: number,
                ...options,
            },
        );
    }

    public async getPR(number: number, options: GitHubRemoteInfoType) {
        const { owner, repo } = options;
        return this.getOctokit().request(
            'GET /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                owner,
                repo,
                pull_number: number,
            },
        );
    }

    /**
     * Does not work
     * @param number
     * @param options
     */
    public async unDraftPR(number: number, options: GitHubRemoteInfoType) {
        const { owner, repo } = options;
        return this.getOctokit().request(
            'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                draft: false,
                owner,
                repo,
                pull_number: number,
            },
        );
    }

    public async getTemplate(path?: string) {
        const files = await findUpAll('.github/PULL_REQUEST_TEMPLATE.md', {
            cwd: path || process.cwd(),
        });

        if (!files || !files[0]) {
            d('Template file not found');
            return '';
        }

        d(`Template file found: ${files[0]}`);
        return (await readFile(files[0]).catch(() => '')).toString('utf8');
    }

    public async getDynamicTemplate(path?: string) {
        const files = await findUpAll('.github/PULL_REQUEST_TEMPLATE.ejs', {
            cwd: path || process.cwd(),
        });

        if (!files || !files[0]) {
            d('Dynamic template file not found');
            return '';
        }

        d(`Dynamic template file found: ${files[0]}`);
        return (await readFile(files[0]).catch(() => '')).toString('utf8');
    }

    public async getPRList(options: GitHubPRListType) {
        const requestOptions = {
            // base: 'master',
            ...options,
            // state: 'open',
            // draft: false,
            accept: 'Setting to application/vnd.github.v3+json',
        };

        d('Get pull requests', requestOptions);

        return this.getOctokit().request(
            'GET /repos/{owner}/{repo}/pulls',
            requestOptions,
        );
    }

    public async getPRByBranch(
        headBranch: string,
        baseBranch: string,
        remoteInfo: GitHubRemoteInfoType,
    ) {
        const list = await this.getPRList({
            ...remoteInfo,
            base: baseBranch,
            head: headBranch,
        });

        if (!(list && list.data && list.data.length)) {
            return null;
        }

        const pr = list.data.find(
            (request: any) => request.head.ref === headBranch,
        );

        if (!pr) {
            return null;
        }

        const detailedPR = await this.getPR(pr.number, remoteInfo);

        if (!(detailedPR && detailedPR.data)) {
            return null;
        }

        return detailedPR.data;
    }

    public async mergePR(options: GitHubPRMergeType) {
        return this.getOctokit().request(
            'PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge',
            {
                merge_method: 'squash',
                ...options,
            },
        );
    }
}
