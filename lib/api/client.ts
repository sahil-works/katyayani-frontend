import { getApiBaseUrl } from "./env";
import { createApiError, normalizeApiError } from "./errors";
import { getAccessToken } from "../auth/tokenStore";
import type {
  ApiEnvelope,
  ApiRequestOptions,
  ApiResult,
  PaginationMeta,
  QueryParams,
} from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function appendQueryParams(url: Pick<URL, "searchParams">, query?: QueryParams) {
  if (!query) return;

  Object.entries(query).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];

    values.forEach((item) => {
      if (item === null || item === undefined || item === "") return;
      url.searchParams.append(key, String(item));
    });
  });
}

function buildApiUrl(path: string, query?: QueryParams) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.startsWith("/")) {
    const searchParams = new URLSearchParams();

    appendQueryParams({ searchParams }, query);

    const search = searchParams.toString();
    return `${baseUrl}${normalizedPath}${search ? `?${search}` : ""}`;
  }

  const url = new URL(`${baseUrl}${normalizedPath}`);

  appendQueryParams(url, query);

  return url.toString();
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function normalizePagination(
  pagination: Partial<PaginationMeta> | undefined,
): PaginationMeta | undefined {
  if (!pagination) return undefined;

  const page = Number(pagination.page ?? 1);
  const limit = Number(pagination.limit ?? 0);
  const total = Number(pagination.total ?? 0);
  const totalPages = Number(
    pagination.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0),
  );

  return {
    page,
    skip:
      typeof pagination.skip === "number" && Number.isFinite(pagination.skip)
        ? pagination.skip
        : undefined,
    limit,
    total,
    totalPages,
    hasMore:
      typeof pagination.hasMore === "boolean" ? pagination.hasMore : undefined,
    hasNextPage:
      Boolean(pagination.hasNextPage) ||
      Boolean(pagination.hasMore) ||
      (totalPages > 0 && page < totalPages),
    hasPreviousPage:
      Boolean(pagination.hasPreviousPage) || page > 1,
  };
}

export function unwrapApiResponse<T>(payload: unknown): ApiResult<T> {
  if (isPlainObject(payload) && "data" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    return {
      data: envelope.data as T,
      pagination: normalizePagination(
        envelope.pagination ?? envelope.meta?.pagination,
      ),
      meta: envelope.meta,
    };
  }

  return {
    data: payload as T,
  };
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const { query, body, headers, auth, ...init } = options;
  const requestHeaders = new Headers(headers);
  let requestBody: BodyInit | null | undefined = body as BodyInit | null;

  if (isPlainObject(body)) {
    requestBody = JSON.stringify(body);
    if (!requestHeaders.has("content-type")) {
      requestHeaders.set("content-type", "application/json");
    }
  }

  if (!requestHeaders.has("accept")) {
    requestHeaders.set("accept", "application/json");
  }

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set("authorization", `Bearer ${accessToken}`);
    }
  }

  try {
    const response = await fetch(buildApiUrl(path, query), {
      ...init,
      body: requestBody,
      credentials: init.credentials ?? "include",
      headers: requestHeaders,
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw createApiError({ response, payload });
    }

    return unwrapApiResponse<T>(payload);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function apiGet<T>(
  path: string,
  query?: QueryParams,
  options?: Omit<ApiRequestOptions, "query" | "method" | "body">,
) {
  return apiFetch<T>(path, {
    ...options,
    method: "GET",
    query,
  });
}

export async function apiPost<T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "query" | "method" | "body">,
) {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    body,
  });
}

export async function apiPatch<T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "query" | "method" | "body">,
) {
  return apiFetch<T>(path, {
    ...options,
    method: "PATCH",
    body,
  });
}

export async function apiDelete<T>(
  path: string,
  options?: Omit<ApiRequestOptions, "query" | "method" | "body">,
) {
  return apiFetch<T>(path, {
    ...options,
    method: "DELETE",
  });
}
