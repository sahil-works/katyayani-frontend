type ApiErrorInput = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  cause?: unknown;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor({ message, status, code, details, cause }: ApiErrorInput) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiConfigurationError extends ApiError {
  constructor(message: string) {
    super({ message, code: "API_CONFIGURATION_ERROR" });
    this.name = "ApiConfigurationError";
  }
}

function readErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const body = payload as Record<string, unknown>;
  const message = body.message ?? body.error;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const joined = message.filter((item) => typeof item === "string").join(", ");
    return joined || undefined;
  }

  return undefined;
}

function readErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const body = payload as Record<string, unknown>;
  const code = body.code ?? body.errorCode;

  return typeof code === "string" && code.trim() ? code : undefined;
}

export function createApiError({
  response,
  payload,
}: {
  response: Response;
  payload: unknown;
}) {
  return new ApiError({
    message:
      readErrorMessage(payload) ??
      `Request failed with status ${response.status}`,
    status: response.status,
    code: readErrorCode(payload),
    details: payload,
  });
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || "Unexpected API error",
      cause: error,
    });
  }

  return new ApiError({
    message: "Unexpected API error",
    details: error,
  });
}

export function getApiErrorMessage(error: unknown) {
  return normalizeApiError(error).message;
}
