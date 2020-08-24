import { BranchDescriptionType } from './type';
import { TextConverter } from './text-converter';

const sanitizeString = (value: string) => TextConverter.toKebabSpecial(
    value,
).toLowerCase().replace(/[^a-z0-9-]/g, '');

export const composeBranchName = (description: BranchDescriptionType) => `${description.type}/${sanitizeString(
    description.title,
)}-${sanitizeString(description.id)}`;
