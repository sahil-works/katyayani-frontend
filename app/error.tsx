'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          We apologize for the inconvenience. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-[#ea206d] px-6 py-3 text-white hover:bg-[#d01b60] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}