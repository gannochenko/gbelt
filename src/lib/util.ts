import { BranchDescriptionType } from './type';
import { TextConverter } from './text-converter';
import { GIT } from './git';

const sanitizeString = (value: string) => TextConverter.toKebabSpecial(
    value,
).toLowerCase().replace(/[^a-z0-9-]/g, '');

export const composeBranchName = (description: BranchDescriptionType) => `${description.type}${description.scope ? `(${sanitizeString(description.scope)})` : ''}/${sanitizeString(
    description.title,
)}-${sanitizeString(description.id)}`;

export const composeCommitMessage = (description: BranchDescriptionType, prId?: number) => `${description.type}: ${description.title} [${description.id}]${prId ? ` (#${prId})` : ''}`;

export const getRemoteOrThrow = async () => {
    const remoteInfo = await GIT.getRemoteInfo();

    if (!remoteInfo) {
        throw new Error('Unable to read the remote endpoint info. Are you in the git repo folder? Does you repo have a remote?');
    }

    return remoteInfo;
};
