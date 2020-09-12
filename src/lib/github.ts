import { Octokit } from '@octokit/core';
// @ts-ignore
import findUpAll from 'find-up-all';
import { readFile as readFileCb } from 'fs';
import { promisify } from 'util';
import debug from 'debug';

const readFile = promisify(readFileCb);

type GitHubPRType = {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    head: string;
    base?: string;
    draft?: boolean;
};

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
                auth: process.env.GHTRICK_TOKEN,
            });
        }

        return this.octokit;
    }

    public async createPR(options: GitHubPRType) {
        return this.getOctokit().request('POST /repos/{owner}/{repo}/pulls', {
            base: 'master',
            draft: false,
            ...options,
        });
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

    public async getPRList(options: GitHubPRListType) {
        const requestOptions = {
            base: 'master',
            ...options,
            state: 'open',
            draft: false,
            accept: 'Setting to application/vnd.github.v3+json',
        };

        d('Get pull requests', requestOptions);

        return this.getOctokit().request(
            'GET /repos/{owner}/{repo}/pulls',
            requestOptions,
        );
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
