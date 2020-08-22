// @ts-ignore
import findUpAll from 'find-up-all';
import debug from 'debug';

type RCType = {
    developmentBranch?: string;
    deploymentBranch?: string;
    ticketIdPrefix?: string;
};

const d = debug('app');

export class RC {
    private static config: RCType = {};

    public static async getConfig() {
        if (!this.config) {
            const files = await findUpAll('.ghtrickrc', {
                cwd: process.cwd(),
            });
            if (!files || !files[0]) {
                return {};
            }

            const [ rcFile ] = files;

            d(`RC file found at: ${rcFile}`);

            try {
                this.config = await import(rcFile);
            } catch(e) {
                console.error(
                    `Was not able to import the RC file located at: ${rcFile}: ${e.message}`,
                );
                d(e.stack);
                return {};
            }
        }

        return this.config;
    }
}
