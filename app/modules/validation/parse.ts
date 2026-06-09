import { z } from 'zod';
import { AppError } from '../error/AppError.js';

export function zodToFieldErrors(err: z.ZodError) {
  return err.issues.map((i) => ({
    field: i.path.join('.') || 'root',
    code: typeof i.message === 'string' && i.message.length > 0 ? i.message : 'INVALID',
    message: typeof i.message === 'string' && i.message.length > 0 ? i.message : 'Input tidak valid',
  }));
}

export function parseOrThrow<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.output<S> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields = zodToFieldErrors(parsed.error);
    throw new AppError('INVALID_INPUT', 400, fields[0]?.message ?? 'INVALID_INPUT', {
      fields,
    });
  }
  return parsed.data;
}
