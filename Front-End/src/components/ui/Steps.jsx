"use client";

import { Check } from "lucide-react";

function StepDot({
  completed,
  active,
  number,
  small = false,
}) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full border font-black ${
        small
          ? "h-7 w-7 -translate-x-[34px] text-[10px]"
          : "h-10 w-10 text-xs"
      } ${
        completed
          ? "border-[#087a45] bg-[#087a45] text-white"
          : active
          ? "border-[#087a45] bg-white text-[#087a45] ring-2 ring-[#087a45]/20"
          : "border-black/10 bg-white text-black/30"
      }`}
    >
      {completed ? (
        <Check
          size={small ? 12 : 16}
        />
      ) : (
        number
      )}
    </div>
  );
}

export default function Steps({
  mainSteps,
  personalSteps,
  mainStep,
  personalStep,
}) {
  return (
    <div className="mt-10 space-y-5">
      {mainSteps.map(
        (item, index) => {
          const completed =
            index < mainStep;

          const active =
            index === mainStep;

          return (
            <div key={item.key}>
              <div className="flex items-center gap-4">
                <StepDot
                  completed={completed}
                  active={active}
                  number={index + 1}
                />

                <div>
                  <div
                    className={`text-sm font-black ${
                      active || completed
                        ? "text-[#087a45]"
                        : "text-black/35"
                    }`}
                  >
                    {item.title}
                  </div>

                  {index === 0 &&
                    mainStep === 0 && (
                      <div className="mt-1 text-xs text-black/40">
                        {personalStep + 1} /{" "}
                        {
                          personalSteps.length
                        }{" "}
                        —{" "}
                        {
                          personalSteps[
                            personalStep
                          ].label
                        }
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        }
      )}

      {mainStep === 0 && (
        <div className="mt-7 ml-5 border-l border-black/10 pl-5">
          {personalSteps.map(
            (item, index) => {
              const completed =
                index < personalStep;

              const active =
                index === personalStep;

              return (
                <div
                  key={item.key}
                  className="relative flex items-center gap-3 py-2.5"
                >
                  <StepDot
                    completed={completed}
                    active={active}
                    number={index + 1}
                    small
                  />

                  <span
                    className={`-ml-5 text-xs ${
                      active
                        ? "font-black text-[#087a45]"
                        : completed
                        ? "text-black/50"
                        : "text-black/25"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}