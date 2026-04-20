export interface ApiResponseType<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse<T> implements ApiResponseType<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;

  constructor(
    statusCode: number,
    data: T,
    message = "Success",
    meta?: Record<string, unknown>,
  ) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }
}
