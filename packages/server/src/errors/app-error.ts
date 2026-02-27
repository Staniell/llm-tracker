export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class LlmError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 502, details);
  }
}
