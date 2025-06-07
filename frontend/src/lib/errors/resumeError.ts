export class ResumeError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = "ResumeError"
  }
}
