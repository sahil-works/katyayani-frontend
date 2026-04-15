"use client";

import { Suspense } from "react";
import NewArrivalsContent from "../../components/NewArrivalsContent";

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewArrivalsContent />
    </Suspense>
  );
}
