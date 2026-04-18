export type AppErrorMeta = Record<string, unknown>;
export class AppError extends Error {
  constructor(
    public code: string,
    public status: number = 500,
    public message: string,
    public readonly meta?: AppErrorMeta,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
