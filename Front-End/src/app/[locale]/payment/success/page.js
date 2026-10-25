
import { Suspense } from "react";
import PaymentSuccess from "@/components/payment/PaymentSuccess";

function PaymentSuccessFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#dcebe1] border-t-[#087a46]" />
        <p className="text-sm font-medium text-[#53645a]">
          Loading payment confirmation...
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccess />
    </Suspense>
  );
}


