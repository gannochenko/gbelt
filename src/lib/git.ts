import execa from 'execa';
import { BranchDescriptionType } from './type';
import debug from 'debug';

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

    public static async checkout(path: string, branch: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        await execa('git', ['fetch', 'origin', branch], {
            cwd: path,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
        await execa('git', ['checkout', branch], {
            cwd: path,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }

    public static async pull(path: string, branch: string) {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        await execa('git', ['pull', 'origin', branch], {
            cwd: path,
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

    public static async getCurrentBranch(path?: string): Promise<{name: string; description?: BranchDescriptionType} | null> {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }

        const cmdPath = path || process.cwd();

        let result = await execa('git', ['branch'], {
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

        result = await execa('git', ['config', `branch.${name}.description`], {
            cwd: cmdPath,
        });

        const info: {name: string; description?: BranchDescriptionType} = {
            name,
        };

        try {
            info.description = JSON.parse(result.stdout) as BranchDescriptionType;
        } catch(e) {
            d('Was not able to parse the JSON of branch data');
            return info;
        }

        return info;
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

        const urlMatch = result.stdout.trim().match(/git@github\.com:(.+)\/(.+)\.git/);
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
}
