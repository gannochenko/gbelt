import { BranchDescriptionType } from './type';
import { TextConverter } from './text-converter';

export const composeBranchName = (description: BranchDescriptionType) => `${description.type}/${TextConverter.toKebabSpecial(
    description.title,
)}-${TextConverter.toKebabSpecial(description.id)}`;
