import execa from 'execa';
import debug from 'debug';
import { BranchDescriptionType } from './type';

export const isAvailable = async (cmd: string) => {
    const cmdParts = cmd.trim().split(' ');
    if (!cmdParts.length) {
        return false;
    }

    const file = cmdParts.shift();
    return execa(file!, cmdParts, {
        stdio: 'ignore',
    })
        .then(() => true)
        .catch((e) => {
            // @ts-ignore
            return e.code !== 'ENOENT';
        });
};

const d = debug('git');

export class GIT {
    protected static isGitAvailable: boolean;

    public static async init(url: string, cwd: string, as: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        await execa('git', ['init'], {
            cwd,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async clone(url: string, cwd: string, as: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        await execa('git', ['clone', url, as], {
            cwd,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async fetch(branch: string, path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['fetch', 'origin', branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async checkout(branch: string, path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['checkout', branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async pull(branch: string, remote = 'origin', path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['pull', remote, branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async push(branch: string, remote = 'origin', path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['push', remote, branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async createBranch(
        branch: string,
        description?: string,
        path?: string,
    ) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['checkout', '-b', branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
        if (description) {
            await execa(
                'git',
                ['config', `branch.${branch}.description`, description],
                {
                    cwd: cmdPath,
                    stdio: ['inherit', 'inherit', 'inherit'],
                },
            );
        }
    }

    public static async getCurrentBranch(
        path?: string,
    ): Promise<{ name: string; description?: BranchDescriptionType } | null> {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        const result = await execa('git', ['branch'], {
            cwd: cmdPath,
        });

        if (result.exitCode) {
            d('Command failed to execute');
            d(result);
            return null;
        }

        const current = result.stdout.match(/\*\s+(.+)/m);
        if (!current || !current[1]) {
            d('No current branch detected');
            d(current);
            return null;
        }

        const name = current[1];

        return GIT.getBranchInfo(name, cmdPath);
    }

    public static async getRemoteInfo(which = 'origin', path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        const result = await execa('git', ['remote', `get-url`, which], {
            cwd: cmdPath,
        });

        if (result.exitCode) {
            d('Command failed to execute');
            d(result);
            return null;
        }

        const urlMatch = result.stdout
            .trim()
            .match(/git@github\.com:(.+)\/(.+)\.git/);
        if (!urlMatch) {
            d('No remote info available');
            return null;
        }

        const [, owner, repo] = urlMatch;

        return {
            owner,
            repo,
        };
    }

    public static async isAvailable() {
        if (this.isGitAvailable === undefined) {
            this.isGitAvailable = await isAvailable('git -h');
        }

        return this.isGitAvailable;
    }

    public static getInstallationInfo() {
        return `To install GIT, visit https://git-scm.com/book/en/v2/Getting-Started-Installing-Git`;
    }

    public static async pushSetUpstream(branch: string, path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['push', '--set-upstream', 'origin', branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async deleteBranch(branch: string, path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        await execa('git', ['branch', '-D', branch], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async hasStage(path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        const { stdout } = await execa('git', ['status'], {
            cwd: cmdPath,
            // stdio: ['inherit', 'inherit', 'inherit'],
        });

        return stdout.indexOf('nothing to commit, working tree clean') < 0;
    }

    public static async commit(message: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = process.cwd();

        await execa('git', ['commit', '-am', message], {
            cwd: cmdPath,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async getBranches() {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = process.cwd();

        const { stdout } = await execa(
            'git',
            ['show-branch', '--no-color', '--list'],
            {
                cwd: cmdPath,
                // stdio: ['inherit', 'inherit', 'inherit'],
            },
        );

        let matches = stdout.match(/\[([^\[\]]+)\]/gm);
        if (matches) {
            matches = matches.map((match) =>
                match.replace('[', '').replace(']', ''),
            );
        }

        return matches || [];
    }

    public static async getBranchInfo(branchName: string, path?: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        const result = await execa(
            'git',
            ['config', `branch.${branchName}.description`],
            {
                cwd: cmdPath,
            },
        );

        const info: { name: string; description?: BranchDescriptionType } = {
            name: branchName,
        };

        try {
            info.description = JSON.parse(
                result.stdout,
            ) as BranchDescriptionType;
        } catch (e) {
            d('Was not able to parse the JSON of branch data');
            return info;
        }

        return info;
    }
}
