import VehicleStep from "./VehicleStep";
import LoanStep from "./LoanStep";
import PersonalInfoStep from "./PersonalInfoStep";
import EstimateStep from "./EstimateStep";

export default function LoanSteps({
  step,
  form,
  errors,
  updateForm,
  estimate,
  onEdit,
  onSubmit,
}) {
  if (step === 0) {
    return (
      <VehicleStep
        form={form}
        errors={errors}
        updateForm={updateForm}
      />
    );
  }

  if (step === 1) {
    return (
      <LoanStep
        form={form}
        errors={errors}
        updateForm={updateForm}
        estimate={estimate}
      />
    );
  }

  if (step === 2) {
    return (
      <PersonalInfoStep
        form={form}
        errors={errors}
        updateForm={updateForm}
      />
    );
  }

  return (
    <EstimateStep
      form={form}
      estimate={estimate}
      onEdit={onEdit}
      onSubmit={onSubmit}
    />
  );
}