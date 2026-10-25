// "use client";

// import ProgressItem from "./ProgressItem";

// export default function Steps({
//   step,
//   isSubmitted,
// }) {
//   const personalCompleted =
//     step >= 6 || isSubmitted;

//   return (
//     <div className="mt-10 flex flex-col gap-4">
//       {/* PERSONAL */}

//       <div
//         className={`flex items-start gap-4 ${
//           step < 6 && !isSubmitted
//             ? "text-[#087a45]"
//             : "text-[#087a45]"
//         }`}
//       >
//         <div
//           className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-black ${
//             personalCompleted
//               ? "border-[#087a45] bg-[#087a45] text-white"
//               : "border-[#087a45] bg-white text-[#087a45] ring-2 ring-[#087a45]/30"
//           }`}
//         >
//           {personalCompleted ? (
//             "✓"
//           ) : (
//             "1"
//           )}
//         </div>

//         <div>
//           <div className="text-sm font-black">
//             Personal Information
//           </div>

//           <div className="text-xs">
//             {step < 6
//               ? `Step ${step + 1} of 6`
//               : "Completed"}
//           </div>
//         </div>
//       </div>

//       <ProgressItem
//         number="2"
//         title="Vehicle Information"
//         active={step === 6}
//         completed={
//           step > 6 || isSubmitted
//         }
//         description={
//           step === 6
//             ? "Current step"
//             : step > 6 || isSubmitted
//             ? "Completed"
//             : "Vehicle details"
//         }
//       />

//       <ProgressItem
//         number="3"
//         title="Loan Information"
//         active={step === 7}
//         completed={
//           step > 7 || isSubmitted
//         }
//         description={
//           step === 7
//             ? "Current step"
//             : step > 7 || isSubmitted
//             ? "Completed"
//             : "Loan details"
//         }
//       />

//       <ProgressItem
//         number="4"
//         title="Review & Submit"
//         active={
//           step === 8 && !isSubmitted
//         }
//         completed={isSubmitted}
//         description={
//           isSubmitted
//             ? "Application submitted"
//             : step === 8
//             ? "Ready to submit"
//             : "Final review"
//         }
//       />
//     </div>
//   );
// }

"use client";

import ProgressItem from "./ProgressItem";

export default function Steps({
  step,
  currentStepKey,
  steps = [],
  isSubmitted = false,
}) {
  /*
   * ==============================================================
   * PERSONAL STEPS
   * ==============================================================
   */

  const personalSteps = steps.filter(
    (item) => item.parent === "personal",
  );

  const personalCurrentIndex = personalSteps.findIndex(
    (item) => item.key === currentStepKey,
  );

  const isPersonalActive = currentStepKey?.startsWith("personal-");

  const personalCompleted =
    isSubmitted ||
    (!isPersonalActive &&
      personalCurrentIndex === -1 &&
      step >= personalSteps.length);

  /*
   * ==============================================================
   * VEHICLE INFORMATION
   * ==============================================================
   */

  const vehicleStep = steps.find(
    (item) => item.key === "vehicle",
  );

  const vehiclePhotosStep = steps.find(
    (item) => item.key === "vehicle-photos",
  );

  const isVehicleActive =
    currentStepKey === "vehicle";

  const isVehiclePhotosActive =
    currentStepKey === "vehicle-photos";

  const vehicleIndex = steps.findIndex(
    (item) => item.key === "vehicle",
  );

  const vehiclePhotosIndex = steps.findIndex(
    (item) => item.key === "vehicle-photos",
  );

  const vehicleCompleted =
    isSubmitted ||
    (!isVehicleActive &&
      vehicleIndex !== -1 &&
      step > vehicleIndex);

  const vehiclePhotosCompleted =
    isSubmitted ||
    (!isVehiclePhotosActive &&
      vehiclePhotosIndex !== -1 &&
      step > vehiclePhotosIndex);

  /*
   * ==============================================================
   * EMPLOYMENT & INCOME
   * ==============================================================
   */

  const employmentStep = steps.find(
    (item) => item.key === "employment",
  );

  const employmentIndex = steps.findIndex(
    (item) => item.key === "employment",
  );

  const isEmploymentActive =
    currentStepKey === "employment";

  const employmentCompleted =
    isSubmitted ||
    (!isEmploymentActive &&
      employmentIndex !== -1 &&
      step > employmentIndex);

  /*
   * ==============================================================
   * FINANCIAL INFORMATION
   * PERSONAL LOAN ONLY
   * ==============================================================
   */

  const financialStep = steps.find(
    (item) => item.key === "financial",
  );

  const financialIndex = steps.findIndex(
    (item) => item.key === "financial",
  );

  const isFinancialActive =
    currentStepKey === "financial";

  const financialCompleted =
    isSubmitted ||
    (!isFinancialActive &&
      financialIndex !== -1 &&
      step > financialIndex);

  /*
   * ==============================================================
   * LOAN INFORMATION
   * ==============================================================
   */

  const loanStep = steps.find(
    (item) => item.key === "loan",
  );

  const loanIndex = steps.findIndex(
    (item) => item.key === "loan",
  );

  const isLoanActive =
    currentStepKey === "loan";

  const loanCompleted =
    isSubmitted ||
    (!isLoanActive &&
      loanIndex !== -1 &&
      step > loanIndex);

  /*
   * ==============================================================
   * REVIEW
   * ==============================================================
   */

  const isReviewActive =
    !isSubmitted && step >= steps.length;

  const isReviewCompleted =
    isSubmitted;

  /*
   * ==============================================================
   * RENDER
   * ==============================================================
   */

  return (
    <div className="mt-10 space-y-6">

      {/* ==========================================================
          PERSONAL INFORMATION
      ========================================================== */}

      <div>
        <ProgressItem
          number="1"
          title="Personal Information"
          description={
            isPersonalActive
              ? `Step ${personalCurrentIndex + 1} of ${personalSteps.length}`
              : personalCompleted
                ? "Completed"
                : "Personal details"
          }
          active={isPersonalActive}
          completed={personalCompleted}
        />
      </div>

      {/* ==========================================================
          VEHICLE INFORMATION
          TITLE LOAN ONLY
      ========================================================== */}

      {vehicleStep && (
        <div>
          <ProgressItem
            number="2"
            title="Vehicle Information"
            description={
              isVehicleActive
                ? "Current step"
                : vehicleCompleted
                  ? "Completed"
                  : vehicleStep.description
            }
            active={isVehicleActive}
            completed={vehicleCompleted}
          />
        </div>
      )}

      {/* ==========================================================
          VEHICLE PHOTOS
          TITLE LOAN ONLY
      ========================================================== */}

      {vehiclePhotosStep && (
        <div>
          <ProgressItem
            number="3"
            title="Vehicle Photos"
            description={
              isVehiclePhotosActive
                ? "Current step"
                : vehiclePhotosCompleted
                  ? "Completed"
                  : vehiclePhotosStep.description
            }
            active={isVehiclePhotosActive}
            completed={vehiclePhotosCompleted}
          />
        </div>
      )}

      {/* ==========================================================
          EMPLOYMENT & INCOME
      ========================================================== */}

      {employmentStep && (
        <div>
          <ProgressItem
            number={
              vehicleStep
                ? "4"
                : "2"
            }
            title="Employment & Income"
            description={
              isEmploymentActive
                ? "Current step"
                : employmentCompleted
                  ? "Completed"
                  : employmentStep.description
            }
            active={isEmploymentActive}
            completed={employmentCompleted}
          />
        </div>
      )}

      {/* ==========================================================
          FINANCIAL INFORMATION
          PERSONAL LOAN ONLY
      ========================================================== */}

      {financialStep && (
        <div>
          <ProgressItem
            number={
              vehicleStep
                ? "5"
                : "3"
            }
            title="Financial Information"
            description={
              isFinancialActive
                ? "Current step"
                : financialCompleted
                  ? "Completed"
                  : financialStep.description
            }
            active={isFinancialActive}
            completed={financialCompleted}
          />
        </div>
      )}

      {/* ==========================================================
          LOAN INFORMATION
      ========================================================== */}

      {loanStep && (
        <div>
          <ProgressItem
            number={
              vehicleStep
                ? "5"
                : financialStep
                  ? "4"
                  : "3"
            }
            title="Loan Information"
            description={
              isLoanActive
                ? "Current step"
                : loanCompleted
                  ? "Completed"
                  : loanStep.description
            }
            active={isLoanActive}
            completed={loanCompleted}
          />
        </div>
      )}

      {/* ==========================================================
          REVIEW & SUBMIT
      ========================================================== */}

      <div>
        <ProgressItem
          number={
            vehicleStep
              ? "6"
              : financialStep
                ? "5"
                : "4"
          }
          title="Review & Submit"
          description={
            isSubmitted
              ? "Submitted"
              : isReviewActive
                ? "Current step"
                : "Final review"
          }
          active={isReviewActive}
          completed={isReviewCompleted}
        />
      </div>
    </div>
  );
}