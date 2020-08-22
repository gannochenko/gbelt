import { Octokit } from "@octokit/core";

type GitHubPRType = {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base?: string;
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
            ...options,
            draft: false,
        });
    }
}
