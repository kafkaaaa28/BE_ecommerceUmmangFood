export type AppErrorMeta = Record<string, unknown>;
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string,
    public readonly meta?: AppErrorMeta,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
