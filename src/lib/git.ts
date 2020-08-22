import execa from 'execa';

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

    public static async newBranch(
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
