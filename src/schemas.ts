import {z} from 'zod';
import {ReleaseChannel} from './constants';

export const handleLatestPathSchema = z.object({
  type: z.nativeEnum(ReleaseChannel),
});

export const handleSearchQuerySchema = z.object({
  type: z.nativeEnum(ReleaseChannel).optional(),
  before: z.preprocess(Number, z.number().positive().int()).optional(),
  after: z.preprocess(Number, z.number().positive().int()).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(1000)).default(100),
  rollback: z
    .enum(['true', 'false'])
    .transform((value) => (value === 'true' ? 1 : 0))
    .optional(),
});
