import { Suspense } from "react";

import ReviewClient from "./review-client";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
          <main className="mx-auto w-full max-w-5xl rounded-3xl border border-line bg-panel p-6 shadow-lg sm:p-10">
            <p className="rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-ink-soft">
              正在加载评审结果...
            </p>
          </main>
        </div>
      }
    >
      <ReviewClient />
    </Suspense>
  );
}

