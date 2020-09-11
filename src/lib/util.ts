import { BranchDescriptionType } from './type';
import { TextConverter } from './text-converter';
import { GIT } from './git';

const sanitizeString = (value: string) => TextConverter.toKebabSpecial(
    value,
).toLowerCase().replace(/[^a-z0-9-]/g, '');

export const composeBranchName = (description: BranchDescriptionType) => `${description.type}/${sanitizeString(
    description.title,
)}-${sanitizeString(description.id)}`;

export const composePRName = (description: BranchDescriptionType) => `${description.type}${description.scope ? `(${description.scope})` : ''}: ${description.title} [${description.id}]`;

export const composeCommitMessage = (description: BranchDescriptionType, prId?: number) => `${composePRName(description)}${prId ? ` (#${prId})` : ''}`;

export const getRemoteOrThrow = async () => {
    const remoteInfo = await GIT.getRemoteInfo();

    if (!remoteInfo) {
        throw new Error('Unable to read the remote endpoint info. Are you in the git repo folder? Does you repo have a remote?');
    }

    return remoteInfo;
};

export const getBranchOrThrow = async () => {
    const branch = await GIT.getCurrentBranch();

    if (!branch || !branch.description) {
        throw new Error('Unable to obtain current branch description. Are you in the git repo folder? Was your branch created by gbelt?');
    }

    return branch;
};
