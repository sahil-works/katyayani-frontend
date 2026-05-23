export type PrimitiveQueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<
  string,
  PrimitiveQueryValue | PrimitiveQueryValue[]
>;

export type PaginationMeta = {
  page: number;
  skip?: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiResult<T> = {
  data: T;
  pagination?: PaginationMeta;
  meta?: Record<string, unknown>;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: Partial<PaginationMeta>;
  meta?: Record<string, unknown> & {
    pagination?: Partial<PaginationMeta>;
  };
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  query?: QueryParams;
  body?: BodyInit | Record<string, unknown> | null;
  auth?: boolean;
};
