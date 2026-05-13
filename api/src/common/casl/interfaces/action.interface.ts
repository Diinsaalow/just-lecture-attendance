import { Action } from '../constants/action.enum';
import { Subject } from '../constants/subjects';

export { Action };

/** 
 * Resource is an alias for Subject, used for cleaner permission decorators.
 * Maps to Subject keys (e.g., Resource.DEVICE -> 'BoundDevice').
 */
export const Resource = Subject;
export type Resource = (typeof Subject)[keyof typeof Subject];
