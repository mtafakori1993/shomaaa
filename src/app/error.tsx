"use client";

import { useEffect } from "react";
import { ServiceUnavailable } from "@/components/shop/service-unavailable";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[storefront]", error.digest ?? error.message); }, [error]);
  return (
    <>
      <ServiceUnavailable title="مشکلی پیش آمد" />
      <div className="-mt-16 pb-16 text-center"><Button variant="quiet" onClick={reset}>تلاش دوباره</Button></div>
    </>
  );
}
