import { Octokit } from "@octokit/core";
// @ts-ignore
import findUpAll from 'find-up-all';
import { readFile as readFileCb } from 'fs';
import { promisify } from 'util';

const readFile = promisify(readFileCb);

type GitHubPRType = {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base?: string;
    draft?: boolean;
};

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
            return '';
        }

        return (await readFile(files[0]).catch(() => '')).toString('utf8');
    }
}
