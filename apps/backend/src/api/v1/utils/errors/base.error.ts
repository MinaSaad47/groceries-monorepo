export abstract class BaseError extends Error {
  constructor(
    public code: number,
    message: string,
    public i18n: { key: string; args?: any },
    public details?: any
  ) {
    super(message);
  }
}
