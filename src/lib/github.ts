import { Octokit } from "@octokit/core";

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

    public async createPR() {
        return this.getOctokit().request('POST /repos/{owner}/{repo}/pulls', {
            owner: 'gannochenko',
            repo: 'ghtrick',
            title: 'feat: Integrate via Octokit [GANN-2]',
            body: `## Description
- tmp PR

## Dependencies
- do this before or along with merging

## Ticket 
https://your-bugtracker.com/ticket/GANN-2/
`,
            head: 'feat/integrate-via-octokit-gann-2',
            base: 'master',
            draft: false,
        });
    }
}
