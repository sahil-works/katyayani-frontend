import type { ReactNode } from "react";
import { getApiErrorMessage } from "../../lib/api/errors";

export function StorefrontSkeleton({
  label = "Loading",
  rows = 4,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-5 animate-pulse rounded bg-[#eceee0]"
          style={{ width: `${100 - index * 10}%` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function StorefrontEmptyState({
  title = "Nothing found",
  description = "Try adjusting your filters or check back soon.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e6e8d9] bg-[#fbfcf8] px-6 py-10 text-center">
      <h2 className="text-[22px] font-semibold text-[#1f1f1f]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[#666]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StorefrontErrorState({
  error,
  title = "We couldn't load this section",
  action,
}: {
  error: unknown;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#f0d4d4] bg-[#fff7f7] px-6 py-6"
    >
      <h2 className="text-[18px] font-semibold text-[#8a2f2f]">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#704040]">
        {getApiErrorMessage(error)}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
