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

    
}
