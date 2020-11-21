// @ts-ignore
import findUpAll from 'find-up-all';
import debug from 'debug';

type RCType = {
    developmentBranch: string;
    releaseBranch: string;
    ticketIdPrefix: string;
    useDraftPR: boolean;
    releasePRName: string;
    branchAutoPush?: boolean;
    ticketViewURLTemplate?: string;
};

const d = debug('app');

const defaultSettings = {
    developmentBranch: 'dev',
    releaseBranch: 'master',
    ticketIdPrefix: '',
    useDraftPR: false,
    releasePRName: 'Next release',
};

export class RC {
    private static config?: RCType;

    public static async getConfig(): Promise<RCType> {
        if (!this.config) {
            const files = await findUpAll('.gbeltrc', {
                cwd: process.cwd(),
            });

            d(files);

            if (!files || !files[0]) {
                d('No config file found, will use the default config');
                return defaultSettings;
            }

            const [rcFile] = files;

            d(`RC file found at: ${rcFile}`);

            try {
                this.config = { ...defaultSettings, ...(await import(rcFile)) };
            } catch (e) {
                console.error(
                    `Was not able to import the RC file located at: ${rcFile}: ${e.message}`,
                );
                d(e.stack);
                return defaultSettings;
            }
        }

        return { ...defaultSettings, ...this.config };
    }
}
