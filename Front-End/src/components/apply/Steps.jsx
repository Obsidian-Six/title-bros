"use client";

import ProgressItem from "./ProgressItem";

export default function Steps({
  step,
  isSubmitted,
}) {
  const personalCompleted =
    step >= 6 || isSubmitted;

  return (
    <div className="mt-10 flex flex-col gap-4">
      {/* PERSONAL */}

      <div
        className={`flex items-start gap-4 ${
          step < 6 && !isSubmitted
            ? "text-[#087a45]"
            : "text-[#087a45]"
        }`}
      >
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-black ${
            personalCompleted
              ? "border-[#087a45] bg-[#087a45] text-white"
              : "border-[#087a45] bg-white text-[#087a45] ring-2 ring-[#087a45]/30"
          }`}
        >
          {personalCompleted ? (
            "✓"
          ) : (
            "1"
          )}
        </div>

        <div>
          <div className="text-sm font-black">
            Personal Information
          </div>

          <div className="text-xs">
            {step < 6
              ? `Step ${step + 1} of 6`
              : "Completed"}
          </div>
        </div>
      </div>

      <ProgressItem
        number="2"
        title="Vehicle Information"
        active={step === 6}
        completed={
          step > 6 || isSubmitted
        }
        description={
          step === 6
            ? "Current step"
            : step > 6 || isSubmitted
            ? "Completed"
            : "Vehicle details"
        }
      />

      <ProgressItem
        number="3"
        title="Loan Information"
        active={step === 7}
        completed={
          step > 7 || isSubmitted
        }
        description={
          step === 7
            ? "Current step"
            : step > 7 || isSubmitted
            ? "Completed"
            : "Loan details"
        }
      />

      <ProgressItem
        number="4"
        title="Review & Submit"
        active={
          step === 8 && !isSubmitted
        }
        completed={isSubmitted}
        description={
          isSubmitted
            ? "Application submitted"
            : step === 8
            ? "Ready to submit"
            : "Final review"
        }
      />
    </div>
  );
}