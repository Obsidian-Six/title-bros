// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";

// import {
//   ArrowLeft,
//   ArrowRight,
//   Car,
//   CheckCircle2,
//   DollarSign,
//   Loader2,
//   Lock,
//   LogIn,
//   Mail,
//   MapPin,
//   ShieldCheck,
//   Smartphone,
//   User,
//   UserPlus,
// } from "lucide-react";

// import Reveal from "@/components/Reveal";

// import Field from "@/components/apply/Field";
// import AddressAutocomplete from "@/components/apply/AddressAutocomplete";
// import Steps from "@/components/apply/Steps";
// import { ReviewCard, ReviewItem } from "@/components/apply/ReviewCard";

// import Select from "@/components/ui/Select";
// import CustomSelect from "@/components/ui/CustomSelect";
// import VehicleSelect from "@/components/ui/VehicleSelect";

// import { getVehicleMakes, getVehicleModels } from "@/services/vehicleService";

// import { submitLoanApplication } from "@/services/loanService";

// import { useTranslations } from "next-intl";
// import { useAuth } from "@/context/AuthContext";

// /* ================================================================
//    CONSTANTS
// ================================================================ */

// const CURRENT_YEAR = new Date().getFullYear();

// const MINIMUM_AGE = 18;

// /*
//  * US states + DC.
//  *
//  * The user can enter the two-letter abbreviation.
//  */
// const US_STATE_CODES = [
//   "AL",
//   "AK",
//   "AZ",
//   "AR",
//   "CA",
//   "CO",
//   "CT",
//   "DE",
//   "FL",
//   "GA",
//   "HI",
//   "ID",
//   "IL",
//   "IN",
//   "IA",
//   "KS",
//   "KY",
//   "LA",
//   "ME",
//   "MD",
//   "MA",
//   "MI",
//   "MN",
//   "MS",
//   "MO",
//   "MT",
//   "NE",
//   "NV",
//   "NH",
//   "NJ",
//   "NM",
//   "NY",
//   "NC",
//   "ND",
//   "OH",
//   "OK",
//   "OR",
//   "PA",
//   "RI",
//   "SC",
//   "SD",
//   "TN",
//   "TX",
//   "UT",
//   "VT",
//   "VA",
//   "WA",
//   "WV",
//   "WI",
//   "WY",
//   "DC",
// ];

// /*
//  * VIN:
//  *
//  * US-standard VIN is 17 characters.
//  *
//  * I, O and Q are not used in VINs because
//  * they can be confused with 1 and 0.
//  */
// const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

// /*
//  * US ZIP:
//  *
//  * 12345
//  * 12345-6789
//  */
// const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;

// /*
//  * US phone:
//  *
//  * Accepted internally as:
//  *
//  * 1234567890
//  * +11234567890
//  * 123-456-7890
//  * (123) 456-7890
//  *
//  * We normalize it to digits before validation.
//  */
// const US_PHONE_REGEX = /^(?:1)?[2-9]\d{2}[2-9]\d{6}$/;

// /*
//  * Standard email validation.
//  *
//  * This accepts Gmail, Outlook, Yahoo, business
//  * email addresses, etc.
//  */
// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// /*
//  * Name:
//  *
//  * Allows:
//  * John
//  * O'Connor
//  * Mary-Jane
//  * John Smith
//  */
// const NAME_REGEX = /^[A-Za-zÀ-ÿ' -]+$/;

// /*
//  * SSN:
//  *
//  * 9 digits.
//  *
//  * We accept:
//  *
//  * 123456789
//  * 123-45-6789
//  */
// const SSN_REGEX =
//   /^(?!000|666|9\d\d)\d{3}(?:-)?(?!00)\d{2}(?:-)?(?!0000)\d{4}$/;

// /*
//  * Verification codes.
//  */
// const VERIFICATION_CODE_REGEX = /^\d{4,8}$/;

// /* ================================================================
//    INITIAL FORM
// ================================================================ */

// const INITIAL_FORM = {
//   /* Vehicle */
//   year: "",
//   make: "",
//   model: "",
//   vin: "",

//   /* Personal */
//   firstName: "",
//   middleName: "",
//   lastName: "",
//   phone: "",
//   email: "",

//   /* DOB */
//   dateOfBirthDay: "",
//   dateOfBirthMonth: "",
//   dateOfBirthYear: "",

//   /* Verification */
//   gmailVerificationCode: "",
//   mobileVerificationCode: "",

//   /* SSN */
//   ssnItin: "",

//   /* Address */
//   address: "",
//   street: "",
//   city: "",
//   state: "",
//   zipCode: "",

//   /* Loan */
//   amountRequested: "",
//   reasonForFunds: "",
//   employmentStatus: "",
// };

// /* ================================================================
//    VEHICLE YEARS
// ================================================================ */

// const VEHICLE_YEARS = Array.from(
//   {
//     length: CURRENT_YEAR - 1980 + 1,
//   },
//   (_, index) => String(CURRENT_YEAR - index),
// );

// /* ================================================================
//    HELPERS
// ================================================================ */

// /**
//  * Keep only digits.
//  */
// const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

// /**
//  * Normalize US phone.
//  */
// const normalizePhone = (value) =>
//   onlyDigits(value).replace(/^1(?=\d{10}$)/, "");

// /**
//  * Format SSN.
//  *
//  * 123456789
//  * ->
//  * 123-45-6789
//  */
// const formatSSN = (value) => {
//   const digits = onlyDigits(value).slice(0, 9);

//   if (digits.length <= 3) {
//     return digits;
//   }

//   if (digits.length <= 5) {
//     return `${digits.slice(0, 3)}-${digits.slice(3)}`;
//   }

//   return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
// };

// /**
//  * Format US phone.
//  */
// const formatUSPhone = (value) => {
//   const digits = normalizePhone(value).slice(0, 10);

//   if (digits.length <= 3) {
//     return digits;
//   }

//   if (digits.length <= 6) {
//     return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
//   }

//   return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
// };

// /**
//  * Normalize VIN.
//  */
// const normalizeVIN = (value) =>
//   String(value || "")
//     .toUpperCase()
//     .replace(/[^A-HJ-NPR-Z0-9]/g, "")
//     .slice(0, 17);

// /**
//  * Validate date and age.
//  */
// const validateDOB = (day, month, year) => {
//   const d = Number(day);
//   const m = Number(month);
//   const y = Number(year);

//   if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
//     return "Enter a valid date of birth.";
//   }

//   if (y < 1900 || y > CURRENT_YEAR) {
//     return "Enter a valid birth year.";
//   }

//   if (m < 1 || m > 12) {
//     return "Enter a valid birth month.";
//   }

//   if (d < 1 || d > 31) {
//     return "Enter a valid birth day.";
//   }

//   const date = new Date(y, m - 1, d);

//   if (
//     date.getFullYear() !== y ||
//     date.getMonth() !== m - 1 ||
//     date.getDate() !== d
//   ) {
//     return "Enter a valid date of birth.";
//   }

//   const today = new Date();

//   let age = today.getFullYear() - y;

//   const birthdayThisYear = new Date(today.getFullYear(), m - 1, d);

//   if (today < birthdayThisYear) {
//     age--;
//   }

//   if (age < MINIMUM_AGE) {
//     return `You must be at least ${MINIMUM_AGE} years old.`;
//   }

//   return "";
// };

// /* ================================================================
//    APPLY CONTENT
// ================================================================ */

// function ApplyContent() {
//   const t = useTranslations("apply");

//   const { locale } = useParams();

//   const { user, isAuthenticated, openAuthModal } = useAuth();

//   /* ==============================================================
//      STATE
//   ============================================================== */

//   const [step, setStep] = useState(0);

//   const [form, setForm] = useState(INITIAL_FORM);

//   const [errors, setErrors] = useState({});

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const [submittedLoan, setSubmittedLoan] = useState(null);

//   const [submitError, setSubmitError] = useState("");

//   /* ==============================================================
//      VEHICLE STATE
//   ============================================================== */

//   const [vehicleMakes, setVehicleMakes] = useState([]);

//   const [vehicleModels, setVehicleModels] = useState([]);

//   const [vehicleLoading, setVehicleLoading] = useState({
//     makes: false,
//     models: false,
//   });

//   const [vehicleError, setVehicleError] = useState("");

//   /* ==============================================================
//      AUTH PREFILL
//   ============================================================== */

//   useEffect(() => {
//     if (!user) return;

//     const nameParts = (user.name || "").trim().split(" ");

//     const firstName = nameParts[0] || "";

//     const lastName = nameParts.slice(1).join(" ") || "";

//     setForm((previous) => ({
//       ...previous,

//       firstName: previous.firstName || firstName,

//       lastName: previous.lastName || lastName,

//       email: previous.email || user.email || "",

//       phone: previous.phone || user.phone || "",
//     }));
//   }, [user]);

//   /* ==============================================================
//      STEPS
//   ============================================================== */

//   const STEPS = useMemo(
//     () => [
//       {
//         key: "personal-basic",
//         parent: "personal",

//         title: "Personal Information",

//         description: "Tell us about yourself.",

//         fields: [
//           {
//             key: "firstName",
//             label: "First Name",
//           },

//           {
//             key: "middleName",
//             label: "Middle Name",
//             optional: true,
//           },

//           {
//             key: "lastName",
//             label: "Last Name",
//           },

//           {
//             key: "phone",
//             label: "Mobile Number",
//             type: "tel",
//           },

//           {
//             key: "email",
//             label: "Gmail / Email Address",
//             type: "email",
//           },
//         ],
//       },

//       {
//         key: "personal-dob",
//         parent: "personal",

//         title: "Date of Birth",

//         description: "Enter your date of birth.",

//         fields: [
//           {
//             key: "dateOfBirthDay",
//             label: "Day",
//           },

//           {
//             key: "dateOfBirthMonth",
//             label: "Month",
//           },

//           {
//             key: "dateOfBirthYear",
//             label: "Year",
//           },
//         ],
//       },

//       {
//         key: "personal-email-verification",
//         parent: "personal",

//         title: "Gmail Verification",

//         description: "Enter the verification code sent to your email address.",

//         fields: [
//           {
//             key: "gmailVerificationCode",
//             label: "Email Verification Code",
//           },
//         ],
//       },

//       {
//         key: "personal-ssn",
//         parent: "personal",

//         title: "Social Security Number",

//         description: "Enter your Social Security Number or ITIN securely.",

//         fields: [
//           {
//             key: "ssnItin",
//             label: "SSN / ITIN",
//           },
//         ],
//       },

//       {
//         key: "personal-address",
//         parent: "personal",

//         title: "Location & Address",

//         description: "Enter your current residential address.",

//         fields: [
//           {
//             key: "address",
//             label: "Address",
//           },

//           {
//             key: "street",
//             label: "Street",
//             optional: true,
//           },

//           {
//             key: "city",
//             label: "City",
//           },

//           {
//             key: "state",
//             label: "State",
//           },

//           {
//             key: "zipCode",
//             label: "ZIP Code",
//           },
//         ],
//       },

//       {
//         key: "personal-mobile-verification",
//         parent: "personal",

//         title: "Mobile Verification",

//         description: "Enter the verification code sent to your mobile number.",

//         fields: [
//           {
//             key: "mobileVerificationCode",
//             label: "Mobile Verification Code",
//           },
//         ],
//       },

//       {
//         key: "vehicle",
//         parent: "vehicle",

//         title: t("steps.vehicle.title"),

//         description:
//           "Tell us about the vehicle you want to use for your application.",

//         fields: [
//           {
//             key: "year",
//             label: t("steps.vehicle.fields.year"),
//           },

//           {
//             key: "make",
//             label: t("steps.vehicle.fields.make"),
//           },

//           {
//             key: "model",
//             label: t("steps.vehicle.fields.model"),
//           },

//           {
//             key: "vin",
//             label: "VIN",
//           },
//         ],
//       },

//       {
//         key: "loan",
//         parent: "loan",

//         title: t("steps.loan.title"),

//         description: t("steps.loan.description"),

//         fields: [
//           {
//             key: "amountRequested",
//             label: t("steps.loan.fields.amountRequested"),
//           },

//           {
//             key: "reasonForFunds",
//             label: t("steps.loan.fields.reasonForFunds"),
//           },

//           {
//             key: "employmentStatus",
//             label: t("steps.loan.fields.employmentStatus"),
//           },
//         ],
//       },
//     ],
//     [t],
//   );

//   const reviewStep = useMemo(
//     () => ({
//       title: t("steps.submit.title"),

//       description: t("steps.submit.description"),
//     }),
//     [t],
//   );

//   const currentStep = STEPS[step];

//   /* ==============================================================
//      UPDATE FORM
//   ============================================================== */

//   const update = (key, value) => {
//     let nextValue = value;

//     /*
//      * Phone
//      */
//     if (key === "phone") {
//       nextValue = formatUSPhone(value);
//     }

//     /*
//      * SSN
//      */
//     if (key === "ssnItin") {
//       nextValue = formatSSN(value);
//     }

//     /*
//      * VIN
//      */
//     if (key === "vin") {
//       nextValue = normalizeVIN(value);
//     }

//     /*
//      * State / County (supports 2-letter codes or full region/county names e.g. CA, Greater London)
//      */
//     if (key === "state") {
//       nextValue = String(value || "")
//         .replace(/[^A-Za-zÀ-ÿ0-9' ._-]/g, "")
//         .slice(0, 50);
//     }

//     /*
//      * ZIP / Postal Code (supports UK postcodes like SW1A 1AA, US ZIPs 90210, and international codes)
//      */
//     if (key === "zipCode") {
//       nextValue = String(value || "")
//         .toUpperCase()
//         .replace(/[^A-Z0-9\s-]/g, "")
//         .slice(0, 12);
//     }

//     /*
//      * DOB fields
//      */
//     if (key === "dateOfBirthDay") {
//       nextValue = onlyDigits(value).slice(0, 2);
//     }

//     if (key === "dateOfBirthMonth") {
//       nextValue = onlyDigits(value).slice(0, 2);
//     }

//     if (key === "dateOfBirthYear") {
//       nextValue = onlyDigits(value).slice(0, 4);
//     }

//     /*
//      * Verification codes
//      */
//     if (key === "gmailVerificationCode" || key === "mobileVerificationCode") {
//       nextValue = onlyDigits(value).slice(0, 8);
//     }

//     setForm((previous) => ({
//       ...previous,
//       [key]: nextValue,
//     }));

//     setErrors((previous) => ({
//       ...previous,
//       [key]: "",
//     }));

//     if (key === "make" || key === "year") {
//       setVehicleError("");
//     }
//   };

//   /* ==============================================================
//      LOAD MAKES
//   ============================================================== */

//   useEffect(() => {
//     let cancelled = false;

//     const loadMakes = async () => {
//       setVehicleLoading((previous) => ({
//         ...previous,
//         makes: true,
//       }));

//       setVehicleError("");

//       try {
//         const makes = await getVehicleMakes();

//         if (cancelled) return;

//         setVehicleMakes(makes);
//       } catch (error) {
//         if (cancelled) return;

//         console.error("Vehicle makes loading error:", error);

//         setVehicleError(error?.message || "Unable to load vehicle makes.");
//       } finally {
//         if (!cancelled) {
//           setVehicleLoading((previous) => ({
//             ...previous,
//             makes: false,
//           }));
//         }
//       }
//     };

//     loadMakes();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   /* ==============================================================
//      LOAD MODELS
//   ============================================================== */

//   useEffect(() => {
//     if (step !== 6 || !form.year || !form.make) {
//       setVehicleModels([]);
//       return;
//     }

//     let cancelled = false;

//     const loadModels = async () => {
//       setVehicleLoading((previous) => ({
//         ...previous,
//         models: true,
//       }));

//       setVehicleError("");

//       try {
//         const models = await getVehicleModels({
//           year: form.year,
//           make: form.make,
//         });

//         if (cancelled) return;

//         setVehicleModels(models);
//       } catch (error) {
//         if (cancelled) return;

//         console.error("Vehicle models loading error:", error);

//         setVehicleModels([]);

//         setVehicleError(error?.message || "Unable to load vehicle models.");
//       } finally {
//         if (!cancelled) {
//           setVehicleLoading((previous) => ({
//             ...previous,
//             models: false,
//           }));
//         }
//       }
//     };

//     loadModels();

//     return () => {
//       cancelled = true;
//     };
//   }, [step, form.year, form.make]);

//   /* ==============================================================
//      VALIDATION
//   ============================================================== */

//   const validateStep = () => {
//     const newErrors = {};

//     if (!currentStep) {
//       return true;
//     }

//     /* ============================================================
//        REQUIRED FIELDS
//     ============================================================ */

//     currentStep.fields.forEach(({ key, optional }) => {
//       if (optional) return;

//       const value = String(form[key] || "").trim();

//       if (!value) {
//         newErrors[key] = "This field is required.";
//       }
//     });

//     /* ============================================================
//        PERSONAL BASIC
//     ============================================================ */

//     if (currentStep.key === "personal-basic") {
//       const firstName = form.firstName.trim();

//       const middleName = form.middleName.trim();

//       const lastName = form.lastName.trim();

//       /*
//        * First name
//        */
//       if (firstName && !NAME_REGEX.test(firstName)) {
//         newErrors.firstName = "Enter a valid first name.";
//       }

//       /*
//        * Middle name
//        */
//       if (middleName && !NAME_REGEX.test(middleName)) {
//         newErrors.middleName = "Enter a valid middle name.";
//       }

//       /*
//        * Last name
//        */
//       if (lastName && !NAME_REGEX.test(lastName)) {
//         newErrors.lastName = "Enter a valid last name.";
//       }

//       /*
//        * Email
//        */
//       if (form.email && !EMAIL_REGEX.test(form.email.trim())) {
//         newErrors.email = "Enter a valid email address.";
//       }

//       /*
//        * Phone
//        */
//       const phone = normalizePhone(form.phone);

//       if (form.phone && !US_PHONE_REGEX.test(phone)) {
//         newErrors.phone = "Enter a valid US phone number.";
//       }
//     }

//     /* ============================================================
//        DOB
//     ============================================================ */

//     if (currentStep.key === "personal-dob") {
//       const dobError = validateDOB(
//         form.dateOfBirthDay,
//         form.dateOfBirthMonth,
//         form.dateOfBirthYear,
//       );

//       if (dobError) {
//         newErrors.dateOfBirthDay = dobError;
//       }
//     }

//     /* ============================================================
//        EMAIL VERIFICATION
//     ============================================================ */

//     if (currentStep.key === "personal-email-verification") {
//       if (!VERIFICATION_CODE_REGEX.test(form.gmailVerificationCode)) {
//         newErrors.gmailVerificationCode = "Enter the valid verification code.";
//       }
//     }

//     /* ============================================================
//        SSN / ITIN
//     ============================================================ */

//     if (currentStep.key === "personal-ssn") {
//       const ssn = form.ssnItin.replace(/\D/g, "");

//       if (!/^\d{9}$/.test(ssn)) {
//         newErrors.ssnItin = "SSN / ITIN must contain exactly 9 digits.";
//       } else if (!SSN_REGEX.test(form.ssnItin)) {
//         newErrors.ssnItin = "Enter a valid SSN / ITIN.";
//       }
//     }

//     /* ============================================================
//        ADDRESS
//     ============================================================ */

//     if (currentStep.key === "personal-address") {
//       /*
//        * City
//        */
//       if (form.city && !/^[A-Za-zÀ-ÿ0-9' .-]+$/.test(form.city.trim())) {
//         newErrors.city = "Enter a valid city or town name.";
//       }

//       /*
//        * State - enforce US 2-letter codes only
//        */
//       if (
//         form.state &&
//         !US_STATE_CODES.includes(form.state.toUpperCase())
//       ) {
//         newErrors.state = "Enter a valid 2-letter US state code.";
//       }

//       /*
//        * ZIP Code - supports only US ZIPs (12345 or 12345-6789)
//        */
//       const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;
//       if (form.zipCode && !ZIP_REGEX.test(form.zipCode.trim())) {
//         newErrors.zipCode = "Enter a valid US ZIP code.";
//       }
//     }

//     /* ============================================================
//        MOBILE VERIFICATION
//     ============================================================ */

//     if (currentStep.key === "personal-mobile-verification") {
//       if (!VERIFICATION_CODE_REGEX.test(form.mobileVerificationCode)) {
//         newErrors.mobileVerificationCode = "Enter the valid verification code.";
//       }
//     }

//     /* ============================================================
//        VEHICLE
//     ============================================================ */

//     if (currentStep.key === "vehicle") {
//       if (!form.year) {
//         newErrors.year = "Please select a vehicle year.";
//       }

//       if (!form.make) {
//         newErrors.make = "Please select a vehicle make.";
//       }

//       if (!form.model) {
//         newErrors.model = "Please select a vehicle model.";
//       }

//       /*
//        * VIN
//        */
//       const vin = normalizeVIN(form.vin);

//       if (!VIN_REGEX.test(vin)) {
//         newErrors.vin = "VIN must contain exactly 17 valid characters.";
//       }

//       /*
//        * Explicitly reject I/O/Q.
//        */
//       if (/[IOQ]/i.test(form.vin)) {
//         newErrors.vin = "VIN cannot contain I, O, or Q.";
//       }
//     }

//     /* ============================================================
//        LOAN
//     ============================================================ */

//     if (currentStep.key === "loan") {
//       const amount = Number(
//         String(form.amountRequested).replace(/[$,\s]/g, ""),
//       );

//       if (!Number.isFinite(amount) || amount <= 0) {
//         newErrors.amountRequested = "Enter a valid loan amount.";
//       }

//       if (amount > 10000000) {
//         newErrors.amountRequested = "Enter a valid loan amount.";
//       }
//     }

//     setErrors(newErrors);

//     return Object.keys(newErrors).length === 0;
//   };

//   /* ==============================================================
//      NEXT
//   ============================================================== */

//   const handleNext = () => {
//     if (!validateStep()) {
//       return;
//     }

//     setStep((previous) => Math.min(previous + 1, STEPS.length));
//   };

//   /* ==============================================================
//      BACK
//   ============================================================== */

//   const handleBack = () => {
//     setErrors({});
//     setVehicleError("");

//     setStep((previous) => Math.max(previous - 1, 0));
//   };

//   /* ==============================================================
//      SUBMIT
//   ============================================================== */

//   const handleSubmit = async () => {
//     /*
//      * Validate every step before submitting.
//      *
//      * This prevents someone from jumping to
//      * the review screen and submitting
//      * incomplete/invalid information.
//      */

//     const originalStep = step;

//     let allValid = true;

//     for (let index = 0; index < STEPS.length; index++) {
//       setStep(index);

//       const stepData = STEPS[index];

//       const previousCurrentStep = currentStep;

//       /*
//        * Validate directly against the
//        * step's fields.
//        */
//       const tempErrors = {};

//       stepData.fields.forEach(({ key, optional }) => {
//         if (optional) return;

//         if (!String(form[key] || "").trim()) {
//           tempErrors[key] = "This field is required.";
//         }
//       });

//       if (Object.keys(tempErrors).length) {
//         allValid = false;

//         setErrors(tempErrors);

//         break;
//       }
//     }

//     setStep(originalStep);

//     if (!allValid) {
//       return;
//     }

//     setSubmitError("");
//     setIsSubmitting(true);

//     try {
//       /*
//        * IMPORTANT:
//        *
//        * Do NOT console.log(form).
//        *
//        * The object contains SSN / ITIN.
//        */

//       const payload = {
//         ...form,

//         /*
//          * Send normalized values to backend.
//          */
//         phone: normalizePhone(form.phone),

//         ssnItin: form.ssnItin.replace(/\D/g, ""),

//         vin: normalizeVIN(form.vin),

//         state: form.state.toUpperCase(),

//         zipCode: form.zipCode.trim(),

//         amountRequested: Number(
//           String(form.amountRequested).replace(/[$,\s]/g, ""),
//         ),
//       };

//       const response = await submitLoanApplication(payload);

//       if (response?.data?.loan) {
//         setSubmittedLoan(response.data.loan);
//       }

//       setIsSubmitted(true);
//     } catch (error) {
//       console.error("Application submission error:", error);

//       setSubmitError(error?.message || t("error.somethingWentWrong"));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ==============================================================
//      RESET
//   ============================================================== */

//   const resetApplication = () => {
//     setForm(INITIAL_FORM);

//     setStep(0);

//     setErrors({});

//     setSubmitError("");

//     setIsSubmitted(false);

//     setSubmittedLoan(null);

//     setVehicleModels([]);

//     setVehicleError("");
//   };

//   /* ==============================================================
//      AUTH GATE
//   ============================================================== */

//   if (!isAuthenticated) {
//     return (
//       <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
//         <div className="container-x mx-auto max-w-xl">
//           <div className="glass rounded-[34px] p-8 text-center shadow-xl md:p-12">
//             <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)]">
//               <Lock size={32} />
//             </div>

//             <h1 className="h3 text-[var(--ink)]">Sign In Required to Apply</h1>

//             <p className="mt-3 text-sm leading-6 text-black/60">
//               To apply for an auto title loan, please sign in to your Title Bros
//               account or create a new one.
//             </p>

//             <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//               <button
//                 type="button"
//                 onClick={() => openAuthModal("login")}
//                 className="btn-primary flex flex-1 items-center justify-center gap-2"
//               >
//                 <LogIn size={16} />
//                 Sign In to Account
//               </button>

//               <button
//                 type="button"
//                 onClick={() => openAuthModal("register")}
//                 className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--white)] py-3.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--paper)]"
//               >
//                 <UserPlus size={16} className="text-[var(--green)]" />
//                 Create New Account
//               </button>
//             </div>

//             <div className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
//               Title Bros Staff?{" "}
//               <Link
//                 href={`/${locale}/admin/login`}
//                 className="font-bold text-[var(--green)] hover:underline"
//               >
//                 Staff Operations Login
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   /* ==============================================================
//      MAIN
//   ============================================================== */

//   return (
//     <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
//       <div className="container-x">
//         <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
//           {/* ======================================================
//               LEFT
//           ====================================================== */}

//           <Reveal>
//             <div className="eyebrow text-[#101512]">{t("eyebrow")}</div>

//             <h1 className="h2 mt-6 text-[#101512]">{t("title")}</h1>

//             <p className="mt-7 max-w-md leading-7 text-black/50">
//               {t("description")}
//             </p>

//             <Steps step={step} isSubmitted={isSubmitted} />
//           </Reveal>

//           {/* ======================================================
//               RIGHT
//           ====================================================== */}

//           <Reveal delay={0.08}>
//             <div className="glass rounded-[34px] p-6 md:p-10">
//               {/* ==================================================
//                   STEP COUNTER
//               ================================================== */}

//               {!isSubmitted && (
//                 <div className="text-xs font-black uppercase tracking-[.16em] text-[var(--ink)]/35">
//                   {step < 6
//                     ? `Personal Information — Step ${step + 1} of 6`
//                     : `Application Step ${step - 4} of 4`}
//                 </div>
//               )}

//               {/* ==================================================
//                   TITLE
//               ================================================== */}

//               <h2 className="mt-3 text-3xl font-black tracking-tight">
//                 {!isSubmitted
//                   ? step < 8
//                     ? currentStep?.title
//                     : reviewStep.title
//                   : "Application Submitted"}
//               </h2>

//               {/* ==================================================
//                   NORMAL STEPS
//               ================================================== */}

//               {!isSubmitted && step < 8 && (
//                 <div className="mt-8">
//                   {/* =================================================
//                         DOB
//                     ================================================= */}

//                   {currentStep?.key === "personal-dob" ? (
//                     <div>
//                       {/* <p className="mb-6 text-sm leading-6 text-black/50"> */}
//                       <p className="mb-6 text-sm font-black leading-6 text-[var(--ink)]/45">
//                         {currentStep.description}
//                       </p>

//                       <div className="grid grid-cols-3 gap-3">
//                         <Field
//                           label="Day"
//                           value={form.dateOfBirthDay}
//                           onChange={(event) =>
//                             update("dateOfBirthDay", event.target.value)
//                           }
//                           type="number"
//                           placeholder="DD"
//                           error={errors.dateOfBirthDay}
//                           inputClassName="text-center"
//                         />

//                         <Field
//                           label="Month"
//                           value={form.dateOfBirthMonth}
//                           onChange={(event) =>
//                             update("dateOfBirthMonth", event.target.value)
//                           }
//                           type="number"
//                           placeholder="MM"
//                           error={errors.dateOfBirthMonth}
//                           inputClassName="text-center"
//                         />

//                         <Field
//                           label="Year"
//                           value={form.dateOfBirthYear}
//                           onChange={(event) =>
//                             update("dateOfBirthYear", event.target.value)
//                           }
//                           type="number"
//                           placeholder="YYYY"
//                           error={errors.dateOfBirthYear}
//                           inputClassName="text-center"
//                         />
//                       </div>
//                     </div>
//                   ) : currentStep?.key === "vehicle" ? (
//                     /* =================================================
//                           VEHICLE
//                       ================================================= */

//                     <div>
//                       <p className="mb-6 text-sm leading-6">
//                         {currentStep.description}
//                       </p>

//                       <div className="grid gap-4 sm:grid-cols-2">
//                         {/* YEAR */}

//                         <CustomSelect
//                           label="Year"
//                           value={form.year}
//                           options={VEHICLE_YEARS}
//                           placeholder="Select year"
//                           error={errors.year}
//                           onChange={(value) => {
//                             update("year", value);

//                             update("make", "");

//                             update("model", "");

//                             setVehicleModels([]);
//                           }}
//                         />

//                         {/* MAKE */}

//                         <VehicleSelect
//                           label="Make"
//                           value={form.make}
//                           options={vehicleMakes}
//                           loading={vehicleLoading.makes}
//                           disabled={!form.year}
//                           placeholder={
//                             form.year ? "Select make" : "Select year first"
//                           }
//                           error={errors.make}
//                           onChange={(value) => {
//                             update("make", value);

//                             update("model", "");

//                             setVehicleModels([]);
//                           }}
//                         />

//                         {/* MODEL */}

//                         <VehicleSelect
//                           label="Model"
//                           value={form.model}
//                           options={vehicleModels}
//                           loading={vehicleLoading.models}
//                           disabled={!form.year || !form.make}
//                           placeholder={
//                             !form.year
//                               ? "Select year first"
//                               : !form.make
//                                 ? "Select make first"
//                                 : "Select model"
//                           }
//                           error={errors.model}
//                           onChange={(value) => update("model", value)}
//                         />

//                         {/* VIN */}

//                         <div className="sm:col-span-2 space-y-2">
//                           <label className="text-[13px] font-bold text-[#101512]">
//                             VIN
//                           </label>
//                           <div className="flex gap-2">
//                             <input
//                               type="text"
//                               value={form.vin}
//                               onChange={async (event) => {
//                                 const val = event.target.value.toUpperCase().replace(/[IOQ\s]/g, "").slice(0, 17);
//                                 update("vin", val);
//                                 if (val.length === 17 && !vehicleLoading.decoding) {
//                                   setVehicleLoading(p => ({ ...p, decoding: true }));
//                                   setVehicleError("");
//                                   try {
//                                     const { decodeVin } = await import("@/services/vehicleService");
//                                     const data = await decodeVin(val);
//                                     if (data && data.Results) {
//                                       const year = data.Results.find(r => r.Variable === "Model Year")?.Value;
//                                       const make = data.Results.find(r => r.Variable === "Make")?.Value;
//                                       const model = data.Results.find(r => r.Variable === "Model")?.Value;
//                                       const errorCode = data.Results.find(r => r.Variable === "Error Code")?.Value;

//                                       if (!make || !model) {
//                                         setVehicleError(`Invalid VIN: ${errorCode || 'Vehicle details not found.'}`);
//                                       } else {
//                                         if (year) update("year", year);
//                                         if (make) update("make", make);
//                                         if (model) update("model", model);
//                                       }
//                                     }
//                                   } catch (err) {
//                                     setVehicleError("Failed to decode VIN. Please enter details manually.");
//                                   } finally {
//                                     setVehicleLoading(p => ({ ...p, decoding: false }));
//                                   }
//                                 }
//                               }}
//                               placeholder="Enter 17-character VIN"
//                               className={`h-14 w-full rounded-2xl border px-5 text-sm transition-all focus:outline-none ${
//                                 errors.vin
//                                   ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
//                                   : "border-black/[0.08] bg-[#f9faf8] hover:border-black/20 focus:border-[#087a45] focus:bg-white focus:ring-4 focus:ring-[#087a45]/10"
//                               }`}
//                             />
//                             <button
//                               type="button"
//                               disabled={form.vin.length !== 17 || vehicleLoading.decoding}
//                               onClick={async () => {
//                                 setVehicleLoading(p => ({ ...p, decoding: true }));
//                                 setVehicleError("");
//                                 try {
//                                   // Import decodeVin dynamically or assume it's imported at top
//                                   const { decodeVin } = await import("@/services/vehicleService");
//                                   const data = await decodeVin(form.vin);
//                                   if (data && data.Results) {
//                                     const year = data.Results.find(r => r.Variable === "Model Year")?.Value;
//                                     const make = data.Results.find(r => r.Variable === "Make")?.Value;
//                                     const model = data.Results.find(r => r.Variable === "Model")?.Value;
//                                     const errorCode = data.Results.find(r => r.Variable === "Error Code")?.Value;

//                                     if (!make || !model) {
//                                       setVehicleError(`Invalid VIN: ${errorCode || 'Vehicle details not found.'}`);
//                                     } else {
//                                       if (year) update("year", year);
//                                       if (make) update("make", make);
//                                       if (model) update("model", model);
//                                     }
//                                   }
//                                 } catch (err) {
//                                   setVehicleError("Failed to decode VIN. Please enter details manually.");
//                                 } finally {
//                                   setVehicleLoading(p => ({ ...p, decoding: false }));
//                                 }
//                               }}
//                               className="h-14 shrink-0 rounded-2xl bg-[#087a45] px-6 text-sm font-bold text-white transition hover:bg-[#066b3c] disabled:opacity-50"
//                             >
//                               {vehicleLoading.decoding ? "Decoding..." : "Decode"}
//                             </button>
//                           </div>
//                           {errors.vin && (
//                             <p className="mt-1.5 text-xs font-medium text-red-500">
//                               {errors.vin}
//                             </p>
//                           )}
//                         </div>
//                       </div>

//                       <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.04em]">
//                         VIN must contain 17 characters and cannot contain I, O
//                         or Q.
//                       </div>

//                       {vehicleError && (
//                         <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs leading-5 text-red-600">
//                           {vehicleError}
//                         </div>
//                       )}
//                     </div>
//                   ) : currentStep?.key === "loan" ? (
//                     /* =================================================
//                           LOAN
//                       ================================================= */

//                     <div>
//                       <p className="mb-6 text-sm leading-6">
//                         {currentStep.description}
//                       </p>

//                       <div className="grid gap-4 sm:grid-cols-2">
//                         <Field
//                           label={t("steps.loan.fields.amountRequested")}
//                           value={form.amountRequested}
//                           onChange={(event) =>
//                             update("amountRequested", event.target.value)
//                           }
//                           type="number"
//                           placeholder="Enter amount requested"
//                           error={errors.amountRequested}
//                           prefix="$"
//                         />

//                         <Select
//                           label={t("steps.loan.fields.reasonForFunds")}
//                           value={form.reasonForFunds}
//                           onChange={(event) =>
//                             update("reasonForFunds", event.target.value)
//                           }
//                           error={errors.reasonForFunds}
//                         >
//                           <option value="">Select reason</option>

//                           <option value="Personal">Personal</option>

//                           <option value="Debt Consolidation">
//                             Debt Consolidation
//                           </option>

//                           <option value="Business">Business</option>

//                           <option value="Emergency">Emergency</option>

//                           <option value="Other">Other</option>
//                         </Select>

//                         <Select
//                           label={t("steps.loan.fields.employmentStatus")}
//                           value={form.employmentStatus}
//                           onChange={(event) =>
//                             update("employmentStatus", event.target.value)
//                           }
//                           error={errors.employmentStatus}
//                         >
//                           <option value="">Select employment status</option>

//                           <option value="Employed">Employed</option>

//                           <option value="Self Employed">Self Employed</option>

//                           <option value="Unemployed">Unemployed</option>

//                           <option value="Retired">Retired</option>

//                           <option value="Student">Student</option>
//                         </Select>
//                       </div>
//                     </div>
//                   ) : (
//                     /* =================================================
//                           PERSONAL FIELDS
//                       ================================================= */

//                     <div className="grid gap-4 sm:grid-cols-2">
//                       {currentStep?.fields.map(
//                         ({ key, label, type = "text", optional }) => {
//                           const isVerification =
//                             key === "gmailVerificationCode" ||
//                             key === "mobileVerificationCode";

//                           const isSSN = key === "ssnItin";

//                           const isPhone = key === "phone";

//                           const isAddress = key === "address";

//                           const fullWidth =
//                             isVerification || isSSN || isAddress;

//                           let icon = null;

//                           if (isVerification) {
//                             icon = <Mail size={17} />;
//                           }

//                           if (isSSN) {
//                             icon = <ShieldCheck size={17} />;
//                           }

//                           if (isAddress) {
//                             icon = <MapPin size={17} />;
//                           }

//                           if (isAddress) {
//                             return (
//                               <AddressAutocomplete
//                                 key={key}
//                                 label={label}
//                                 value={form.address}
//                                 onChange={(val) => update("address", val)}
//                                 onSelectAddress={({
//                                   address,
//                                   street,
//                                   city,
//                                   state,
//                                   zipCode,
//                                 }) => {
//                                   setForm((prev) => ({
//                                     ...prev,
//                                     address: address || prev.address,
//                                     street: street || prev.street,
//                                     city: city || prev.city,
//                                     state: state || prev.state,
//                                     zipCode: zipCode || prev.zipCode,
//                                   }));
//                                   setErrors((prev) => {
//                                     const clean = { ...prev };
//                                     delete clean.address;
//                                     delete clean.street;
//                                     delete clean.city;
//                                     delete clean.state;
//                                     delete clean.zipCode;
//                                     return clean;
//                                   });
//                                 }}
//                                 error={errors.address}
//                                 className="sm:col-span-2"
//                               />
//                             );
//                           }

//                           return (
//                             <Field
//                               key={key}
//                               label={label}
//                               value={form[key]}
//                               onChange={(event) =>
//                                 update(key, event.target.value)
//                               }
//                               type={isSSN ? "text" : type}
//                               optional={optional}
//                               icon={icon}
//                               error={errors[key]}
//                               className={
//                                 fullWidth ? "sm:col-span-2" : "sm:col-span-1"
//                               }
//                               placeholder={
//                                 isVerification
//                                   ? "Enter verification code"
//                                   : isSSN
//                                     ? "Enter SSN / ITIN"
//                                     : isPhone
//                                       ? "(555) 555-5555"
//                                       : `Enter ${label.toLowerCase()}`
//                               }
//                             />
//                           );
//                         },
//                       )}
//                     </div>
//                   )}

//                   {/* =================================================
//                         EMAIL MESSAGE
//                     ================================================= */}

//                   {currentStep?.key === "personal-email-verification" && (
//                     <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef7df] p-4 text-xs text-[#087a45]">
//                       <Mail size={18} className="mt-0.5 shrink-0" />

//                       <p>
//                         We sent a verification code to{" "}
//                         <strong>{form.email || "your email address"}</strong>.
//                       </p>
//                     </div>
//                   )}

//                   {/* =================================================
//                         MOBILE MESSAGE
//                     ================================================= */}

//                   {currentStep?.key === "personal-mobile-verification" && (
//                     <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef7df] p-4 text-xs text-[#087a45]">
//                       <Smartphone size={18} className="mt-0.5 shrink-0" />

//                       <p>
//                         We sent a verification code to{" "}
//                         <strong>{form.phone || "your mobile number"}</strong>.
//                       </p>
//                     </div>
//                   )}

//                   {/* =================================================
//                         SSN MESSAGE
//                     ================================================= */}

//                   {currentStep?.key === "personal-ssn" && (
//                     <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f5f7f3] p-4 text-xs leading-5 text-black/50">
//                       <ShieldCheck
//                         size={18}
//                         className="mt-0.5 shrink-0 text-[#087a45]"
//                       />

//                       <p>
//                         Your SSN / ITIN is sensitive information. Keep it secure
//                         and only send it through your encrypted application
//                         flow.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ======================================================
//                   REVIEW
//               ====================================================== */}

//               {!isSubmitted && step === 8 && (
//                 <div className="mt-8">
//                   <div className="rounded-[26px] bg-[#eef7df] p-7">
//                     <div className="flex">
//                       <CheckCircle2 className="text-[#087a45]" size={34} />

//                       <h3 className="ml-2 text-2xl font-black text-[#101512]">
//                         {t("ready.title")}
//                       </h3>
//                     </div>

//                     <p className="mt-3 text-sm leading-6 text-black/55">
//                       {t("ready.description")}
//                     </p>
//                   </div>

//                   {/* PERSONAL */}

//                   <ReviewCard
//                     icon={<User size={17} />}
//                     title="Personal Information"
//                     onEdit={() => setStep(0)}
//                   >
//                     <ReviewItem
//                       label="Full Name"
//                       value={`${form.firstName} ${
//                         form.middleName ? `${form.middleName} ` : ""
//                       }${form.lastName}`}
//                     />

//                     <ReviewItem
//                       label="Date of Birth"
//                       value={
//                         form.dateOfBirthDay &&
//                         form.dateOfBirthMonth &&
//                         form.dateOfBirthYear
//                           ? `${form.dateOfBirthMonth}/${form.dateOfBirthDay}/${form.dateOfBirthYear}`
//                           : "—"
//                       }
//                     />

//                     <ReviewItem label="Phone" value={form.phone} />

//                     <ReviewItem label="Email" value={form.email} />

//                     <ReviewItem label="Address" value={form.address} />

//                     <ReviewItem
//                       label="City / State"
//                       value={`${form.city || "—"}, ${form.state || "—"}`}
//                     />

//                     <ReviewItem label="ZIP" value={form.zipCode} />

//                     <ReviewItem label="SSN / ITIN" value="•••••••••" />
//                   </ReviewCard>

//                   {/* VEHICLE */}

//                   <ReviewCard
//                     icon={<Car size={17} />}
//                     title="Vehicle Information"
//                     onEdit={() => setStep(6)}
//                   >
//                     <ReviewItem label="Year" value={form.year} />

//                     <ReviewItem label="Make" value={form.make} />

//                     <ReviewItem label="Model" value={form.model} />

//                     <ReviewItem label="VIN" value={form.vin} />
//                   </ReviewCard>

//                   {/* LOAN */}

//                   <ReviewCard
//                     icon={<DollarSign size={17} />}
//                     title="Loan Information"
//                     onEdit={() => setStep(7)}
//                   >
//                     <ReviewItem
//                       label="Amount Requested"
//                       value={
//                         form.amountRequested
//                           ? `$${Number(
//                               String(form.amountRequested).replace(
//                                 /[$,\s]/g,
//                                 "",
//                               ),
//                             ).toLocaleString()}`
//                           : "—"
//                       }
//                     />

//                     <ReviewItem
//                       label="Reason"
//                       value={form.reasonForFunds || "—"}
//                     />

//                     <ReviewItem
//                       label="Employment"
//                       value={form.employmentStatus || "—"}
//                     />
//                   </ReviewCard>
//                 </div>
//               )}

//               {/* ======================================================
//                   SUCCESS
//               ====================================================== */}

//               {isSubmitted && (
//                 <div className="mt-8 space-y-5">
//                   <div className="rounded-[26px] border border-emerald-500/20 bg-[#eef7df] p-6">
//                     <div className="flex items-start gap-4">
//                       <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#087a45] text-white">
//                         <CheckCircle2 size={26} />
//                       </div>

//                       <div>
//                         <span className="text-[10px] font-black uppercase tracking-widest text-[#087a45]">
//                           Application Submitted
//                         </span>

//                         <h3 className="mt-1 text-xl font-black text-[#101512]">
//                           {form.firstName}
//                           &apos;s Auto Title Loan Application
//                         </h3>

//                         <p className="mt-2 text-xs leading-5 text-black/60">
//                           Your application has been successfully received and is
//                           now under review.
//                         </p>
//                       </div>
//                     </div>

//                     <div className="mt-5 flex flex-wrap gap-2">
//                       <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
//                         ● Under Review
//                       </span>

//                       <span className="rounded-xl border border-emerald-200 bg-white px-3 py-1 font-mono text-xs font-bold text-[#087a45]">
//                         #
//                         {submittedLoan?._id
//                           ? submittedLoan._id.slice(-6).toUpperCase()
//                           : "SUBMITTED"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* PERSONAL SUMMARY */}

//                   <ReviewCard
//                     icon={<User size={17} />}
//                     title="Personal Information"
//                   >
//                     <ReviewItem
//                       label="Name"
//                       value={`${form.firstName} ${form.lastName}`}
//                     />

//                     <ReviewItem label="Email" value={form.email} />

//                     <ReviewItem label="Phone" value={form.phone} />

//                     <ReviewItem label="ZIP" value={form.zipCode} />
//                   </ReviewCard>

//                   {/* VEHICLE SUMMARY */}

//                   <ReviewCard
//                     icon={<Car size={17} />}
//                     title="Vehicle Information"
//                   >
//                     <ReviewItem
//                       label="Vehicle"
//                       value={`${form.year} ${form.make} ${form.model}`}
//                     />

//                     <ReviewItem label="VIN" value={form.vin} />
//                   </ReviewCard>

//                   {/* LOAN SUMMARY */}

//                   <ReviewCard
//                     icon={<DollarSign size={17} />}
//                     title="Loan Information"
//                   >
//                     <ReviewItem
//                       label="Amount Requested"
//                       value={
//                         form.amountRequested
//                           ? `$${Number(
//                               String(form.amountRequested).replace(
//                                 /[$,\s]/g,
//                                 "",
//                               ),
//                             ).toLocaleString()}`
//                           : "—"
//                       }
//                     />

//                     <ReviewItem
//                       label="Employment"
//                       value={form.employmentStatus || "—"}
//                     />
//                   </ReviewCard>

//                   <div className="flex flex-col gap-3 pt-2 sm:flex-row">
//                     <Link
//                       href={`/${locale}/portal`}
//                       className="btn-primary flex flex-1 items-center justify-center gap-2 text-center"
//                     >
//                       View My Application
//                       <ArrowRight size={16} />
//                     </Link>

//                     <button
//                       type="button"
//                       onClick={resetApplication}
//                       className="rounded-2xl border border-[var(--line)] bg-white px-5 py-3.5 text-xs font-bold text-[#000] transition-all hover:text-white hover:bg-[var(--ink)]"
//                     >
//                       Submit Another Vehicle
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ======================================================
//                   SUBMIT ERROR
//               ====================================================== */}

//               {submitError && (
//                 <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
//                   {submitError}
//                 </div>
//               )}

//               {/* ======================================================
//                   NAVIGATION
//               ====================================================== */}

//               {!isSubmitted && (
//                 <div className="mt-9 flex justify-between gap-3">
//                   <button
//                     type="button"
//                     onClick={handleBack}
//                     disabled={step === 0 || isSubmitting}
//                     className="btn-ghost flex items-center gap-2 disabled:opacity-30"
//                   >
//                     <ArrowLeft size={16} />
//                     Back
//                   </button>

//                   {step < 8 ? (
//                     <button
//                       type="button"
//                       onClick={handleNext}
//                       disabled={isSubmitting}
//                       className="btn-primary flex items-center gap-2"
//                     >
//                       {step < 6 ? "Next" : "Continue"}

//                       <ArrowRight size={16} />
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={handleSubmit}
//                       disabled={isSubmitting}
//                       className="btn-primary flex items-center gap-2 disabled:opacity-60"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <Loader2 size={16} className="animate-spin" />
//                           Submitting...
//                         </>
//                       ) : (
//                         <>
//                           Continue & Submit
//                           <ArrowRight size={16} />
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </Reveal>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ApplyContent;

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useParams, useSearchParams } from "next/navigation";

// import {
//   ArrowLeft,
//   ArrowRight,
//   Car,
//   CheckCircle2,
//   DollarSign,
//   Loader2,
//   Lock,
//   LogIn,
//   Mail,
//   MapPin,
//   ShieldCheck,
//   Smartphone,
//   User,
//   UserPlus,
// } from "lucide-react";

// import Reveal from "@/components/Reveal";

// import Field from "@/components/apply/Field";
// import AddressAutocomplete from "@/components/apply/AddressAutocomplete";
// import Steps from "@/components/apply/Steps";
// import { ReviewCard, ReviewItem } from "@/components/apply/ReviewCard";

// import Select from "@/components/ui/Select";
// import CustomSelect from "@/components/ui/CustomSelect";
// import VehicleSelect from "@/components/ui/VehicleSelect";

// import { getVehicleMakes, getVehicleModels } from "@/services/vehicleService";

// import { submitLoanApplication } from "@/services/loanService";

// import { useTranslations } from "next-intl";
// import { useAuth } from "@/context/AuthContext";

// /* ================================================================
//    CONSTANTS
// ================================================================ */

// const CURRENT_YEAR = new Date().getFullYear();

// const MINIMUM_AGE = 18;

// /*
//  * US states + DC.
//  *
//  * The user can enter the two-letter abbreviation.
//  */
// const US_STATE_CODES = [
//   "AL",
//   "AK",
//   "AZ",
//   "AR",
//   "CA",
//   "CO",
//   "CT",
//   "DE",
//   "FL",
//   "GA",
//   "HI",
//   "ID",
//   "IL",
//   "IN",
//   "IA",
//   "KS",
//   "KY",
//   "LA",
//   "ME",
//   "MD",
//   "MA",
//   "MI",
//   "MN",
//   "MS",
//   "MO",
//   "MT",
//   "NE",
//   "NV",
//   "NH",
//   "NJ",
//   "NM",
//   "NY",
//   "NC",
//   "ND",
//   "OH",
//   "OK",
//   "OR",
//   "PA",
//   "RI",
//   "SC",
//   "SD",
//   "TN",
//   "TX",
//   "UT",
//   "VT",
//   "VA",
//   "WA",
//   "WV",
//   "WI",
//   "WY",
//   "DC",
// ];

// /*
//  * VIN:
//  *
//  * US-standard VIN is 17 characters.
//  *
//  * I, O and Q are not used in VINs because
//  * they can be confused with 1 and 0.
//  */
// const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

// /*
//  * US ZIP:
//  *
//  * 12345
//  * 12345-6789
//  */
// const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;

// /*
//  * US phone:
//  *
//  * Accepted internally as:
//  *
//  * 1234567890
//  * +11234567890
//  * 123-456-7890
//  * (123) 456-7890
//  *
//  * We normalize it to digits before validation.
//  */
// const US_PHONE_REGEX = /^(?:1)?[2-9]\d{2}[2-9]\d{6}$/;

// /*
//  * Standard email validation.
//  *
//  * This accepts Gmail, Outlook, Yahoo, business
//  * email addresses, etc.
//  */
// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// /*
//  * Name:
//  *
//  * Allows:
//  * John
//  * O'Connor
//  * Mary-Jane
//  * John Smith
//  */
// const NAME_REGEX = /^[A-Za-zÀ-ÿ' -]+$/;

// /*
//  * SSN:
//  *
//  * 9 digits.
//  *
//  * We accept:
//  *
//  * 123456789
//  * 123-45-6789
//  */
// const SSN_REGEX =
//   /^(?!000|666|9\d\d)\d{3}(?:-)?(?!00)\d{2}(?:-)?(?!0000)\d{4}$/;

// /*
//  * Verification codes.
//  */
// const VERIFICATION_CODE_REGEX = /^\d{4,8}$/;

// /* ================================================================
//    INITIAL FORM
// ================================================================ */

// const INITIAL_FORM = {
//   /* ============================================================
//      LOAN TYPE
//   ============================================================ */
//   loanType: "title-loan",

//   /* ============================================================
//      PERSONAL
//   ============================================================ */
//   firstName: "",
//   middleName: "",
//   lastName: "",

//   /* DOB */
//   dateOfBirthDay: "",
//   dateOfBirthMonth: "",
//   dateOfBirthYear: "",

//   /* SSN / ITIN */
//   ssnItin: "",

//   /* Military */
//   militaryStatus: "",

//   /* ============================================================
//      CONTACT
//   ============================================================ */
//   phone: "",
//   email: "",

//   /* Verification */
//   gmailVerificationCode: "",
//   mobileVerificationCode: "",

//   /* SMS Preferences */
//   promotionalSmsConsent: false,
//   accountAlertsSmsConsent: false,

//   /* ============================================================
//      ADDRESS
//   ============================================================ */
//   address: "",
//   street: "",
//   city: "",
//   state: "",
//   zipCode: "",

//   /* ============================================================
//      EMPLOYMENT & INCOME
//   ============================================================ */
//   employmentStatus: "",
//   employerName: "",
//   incomeAmount: "",
//   incomeFrequency: "",

//   /* ============================================================
//      HOUSING / PERSONAL LOAN FINANCIAL INFO
//   ============================================================ */
//   housingStatus: "",
//   monthlyHousingPayment: "",

//   /* ============================================================
//      VEHICLE - TITLE LOAN ONLY
//   ============================================================ */
//   vehicleType: "",
//   year: "",
//   make: "",
//   model: "",
//   trim: "",
//   vin: "",
//   mileage: "",
//   condition: "",
//   color: "",
//   titleStatus: "",
//   existingLien: "",
//   lienAmount: "",

//   /* Vehicle Photos */
//   vehiclePhotos: [],

//   /* ============================================================
//      LOAN
//   ============================================================ */
//   amountRequested: "",
//   reasonForFunds: "",
// };
// /* ================================================================
//    VEHICLE YEARS
// ================================================================ */

// const VEHICLE_YEARS = Array.from(
//   {
//     length: CURRENT_YEAR - 1980 + 1,
//   },
//   (_, index) => String(CURRENT_YEAR - index),
// );

// /* ================================================================
//    HELPERS
// ================================================================ */

// /**
//  * Keep only digits.
//  */
// const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

// /**
//  * Normalize US phone.
//  */
// const normalizePhone = (value) =>
//   onlyDigits(value).replace(/^1(?=\d{10}$)/, "");

// /**
//  * Format SSN.
//  *
//  * 123456789
//  * ->
//  * 123-45-6789
//  */
// const formatSSN = (value) => {
//   const digits = onlyDigits(value).slice(0, 9);

//   if (digits.length <= 3) {
//     return digits;
//   }

//   if (digits.length <= 5) {
//     return `${digits.slice(0, 3)}-${digits.slice(3)}`;
//   }

//   return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
// };

// /**
//  * Format US phone.
//  */
// const formatUSPhone = (value) => {
//   const digits = normalizePhone(value).slice(0, 10);

//   if (digits.length <= 3) {
//     return digits;
//   }

//   if (digits.length <= 6) {
//     return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
//   }

//   return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
// };

// /**
//  * Normalize VIN.
//  */
// const normalizeVIN = (value) =>
//   String(value || "")
//     .toUpperCase()
//     .replace(/[^A-HJ-NPR-Z0-9]/g, "")
//     .slice(0, 17);

// /**
//  * Validate date and age.
//  */
// const validateDOB = (day, month, year) => {
//   const d = Number(day);
//   const m = Number(month);
//   const y = Number(year);

//   if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
//     return "Enter a valid date of birth.";
//   }

//   if (y < 1900 || y > CURRENT_YEAR) {
//     return "Enter a valid birth year.";
//   }

//   if (m < 1 || m > 12) {
//     return "Enter a valid birth month.";
//   }

//   if (d < 1 || d > 31) {
//     return "Enter a valid birth day.";
//   }

//   const date = new Date(y, m - 1, d);

//   if (
//     date.getFullYear() !== y ||
//     date.getMonth() !== m - 1 ||
//     date.getDate() !== d
//   ) {
//     return "Enter a valid date of birth.";
//   }

//   const today = new Date();

//   let age = today.getFullYear() - y;

//   const birthdayThisYear = new Date(today.getFullYear(), m - 1, d);

//   if (today < birthdayThisYear) {
//     age--;
//   }

//   if (age < MINIMUM_AGE) {
//     return `You must be at least ${MINIMUM_AGE} years old.`;
//   }

//   return "";
// };

// /* ================================================================
//    APPLY CONTENT
// ================================================================ */

// function ApplyContent() {
//   const t = useTranslations("apply");

//   const { locale } = useParams();
//   const searchParams = useSearchParams();

//   const loanType =
//     searchParams.get("loanType") === "personal-loan"
//       ? "personal-loan"
//       : "title-loan";

//   const { user, isAuthenticated, openAuthModal } = useAuth();

//   /* ==============================================================
//      STATE
//   ============================================================== */

//   const [step, setStep] = useState(0);

//   const [form, setForm] = useState(INITIAL_FORM);

//   const [errors, setErrors] = useState({});

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const [submittedLoan, setSubmittedLoan] = useState(null);

//   const [submitError, setSubmitError] = useState("");

//   /* ==============================================================
//      VEHICLE STATE
//   ============================================================== */

//   const [vehicleMakes, setVehicleMakes] = useState([]);

//   const [vehicleModels, setVehicleModels] = useState([]);

//   const [vehicleLoading, setVehicleLoading] = useState({
//     makes: false,
//     models: false,
//   });

//   const [vehicleError, setVehicleError] = useState("");

//   /* ==============================================================
//      AUTH PREFILL
//   ============================================================== */

//   useEffect(() => {
//     if (!user) return;

//     const nameParts = (user.name || "").trim().split(" ");

//     const firstName = nameParts[0] || "";

//     const lastName = nameParts.slice(1).join(" ") || "";

//     setForm((previous) => ({
//       ...previous,

//       firstName: previous.firstName || firstName,

//       lastName: previous.lastName || lastName,

//       email: previous.email || user.email || "",

//       phone: previous.phone || user.phone || "",
//     }));
//   }, [user]);

//   /* ==============================================================
//      STEPS
//   ============================================================== */

//   const STEPS = useMemo(() => {
//     const commonSteps = [
//       {
//         key: "personal-basic",
//         parent: "personal",
//         title: "Personal Information",
//         description: "Tell us about yourself.",
//         fields: [
//           {
//             key: "firstName",
//             label: "First Name",
//           },
//           {
//             key: "middleName",
//             label: "M.I.",
//             optional: true,
//           },
//           {
//             key: "lastName",
//             label: "Last Name",
//           },
//           {
//             key: "phone",
//             label: "Mobile / Home Phone",
//             type: "tel",
//           },
//           {
//             key: "email",
//             label: "Email Address",
//             type: "email",
//           },
//         ],
//       },

//       {
//         key: "personal-dob",
//         parent: "personal",
//         title: "Date of Birth",
//         description: "Enter your date of birth.",
//         fields: [
//           {
//             key: "dateOfBirthDay",
//             label: "Day",
//           },
//           {
//             key: "dateOfBirthMonth",
//             label: "Month",
//           },
//           {
//             key: "dateOfBirthYear",
//             label: "Year",
//           },
//         ],
//       },

//       {
//         key: "personal-email-verification",
//         parent: "personal",
//         title: "Email Verification",
//         description: "Enter the verification code sent to your email address.",
//         fields: [
//           {
//             key: "gmailVerificationCode",
//             label: "Email Verification Code",
//           },
//         ],
//       },

//       {
//         key: "personal-ssn",
//         parent: "personal",
//         title: "Social Security Number",
//         description: "Enter your Social Security Number or ITIN securely.",
//         fields: [
//           {
//             key: "ssnItin",
//             label: "SSN / ITIN",
//           },
//         ],
//       },

//       {
//         key: "personal-military",
//         parent: "personal",
//         title: "Military Service",
//         description:
//           "Please tell us whether you are currently serving on active military duty or are a spouse, child, or dependent of someone who is.",
//         fields: [
//           {
//             key: "militaryStatus",
//             label: "Military Status",
//           },
//         ],
//       },

//       {
//         key: "personal-address",
//         parent: "personal",
//         title: "Location & Address",
//         description: "Enter your current residential address.",
//         fields: [
//           {
//             key: "address",
//             label: "Address",
//           },
//           {
//             key: "street",
//             label: "Street",
//             optional: true,
//           },
//           {
//             key: "city",
//             label: "City",
//           },
//           {
//             key: "state",
//             label: "State",
//           },
//           {
//             key: "zipCode",
//             label: "ZIP Code",
//           },
//         ],
//       },

//       {
//         key: "personal-mobile-verification",
//         parent: "personal",
//         title: "Mobile Verification",
//         description: "Enter the verification code sent to your mobile number.",
//         fields: [
//           {
//             key: "mobileVerificationCode",
//             label: "Mobile Verification Code",
//           },
//         ],
//       },
//     ];

//  const titleLoanSteps = [
//   {
//     key: "vehicle",
//     parent: "vehicle",
//     applicationStep: 1,
//     title: "Vehicle Information",
//     description:
//       "Tell us about the vehicle you want to use for your Title Loan.",
//     fields: [
//       {
//         key: "vehicleType",
//         label: "Vehicle Type",
//       },
//       {
//         key: "year",
//         label: "Year",
//       },
//       {
//         key: "make",
//         label: "Make",
//       },
//       {
//         key: "model",
//         label: "Model",
//       },
//       {
//         key: "trim",
//         label: "Trim Level",
//         optional: true,
//       },
//       {
//         key: "vin",
//         label: "VIN",
//       },
//       {
//         key: "mileage",
//         label: "Mileage",
//       },
//       {
//         key: "condition",
//         label: "Vehicle Condition",
//       },
//       {
//         key: "color",
//         label: "Vehicle Color",
//         optional: true,
//       },
//       {
//         key: "titleStatus",
//         label: "Title Status",
//       },
//       {
//         key: "existingLien",
//         label: "Existing Lien",
//       },
//       {
//         key: "lienAmount",
//         label: "Lien Amount",
//         optional: true,
//       },
//     ],
//   },

//   {
//     key: "vehicle-photos",
//     parent: "vehicle-photos",
//     applicationStep: 2,
//     title: "Vehicle Photos",
//     description: "Upload the required photos of your vehicle.",
//     fields: [
//       {
//         key: "vehiclePhotos",
//         label: "Vehicle Photos",
//       },
//     ],
//   },
// ];

//  const personalLoanSteps = [
//   {
//     key: "financial",
//     parent: "financial",
//     title: "Financial Information",
//     description:
//       "Tell us about your current housing and monthly expenses.",
//     fields: [
//       {
//         key: "housingStatus",
//         label: "Housing Status",
//       },
//       {
//         key: "monthlyHousingPayment",
//         label: "Monthly Housing Payment",
//         optional: true,
//       },
//     ],
//   },
// ];

// const employmentStep = {
//   key: "employment",
//   parent: "financial",
//   applicationStep: 3,
//   title: "Employment & Income",
//   description: "Tell us about your employment and income.",
//   fields: [
//     {
//       key: "employmentStatus",
//       label: "Employment Status",
//     },
//     {
//       key: "employerName",
//       label: "Employer Name",
//     },
//     {
//       key: "incomeAmount",
//       label: "Income Amount",
//     },
//     {
//       key: "incomeFrequency",
//       label: "Income Frequency",
//     },
//   ],
// };

// const loanStep = {
//   key: "loan",
//   parent: "loan",
//   title: "Loan Information",
//   description:
//     "Tell us how much you need and what you plan to use the funds for.",
//   fields: [
//     {
//       key: "amountRequested",
//       label: "Amount Requested",
//     },
//     {
//       key: "reasonForFunds",
//       label: "Reason for Funds",
//     },
//   ],
// };

// /* ==============================================================
//    TITLE LOAN
//    Application:
//    1. Vehicle Information
//    2. Vehicle Photos
//    3. Employment & Income
//    4. Loan Information
// ============================================================== */

// if (loanType === "title-loan") {
//   return [
//     ...commonSteps,
//     ...titleLoanSteps,

//     {
//       ...employmentStep,
//       applicationStep: 3,
//     },

//     {
//       ...loanStep,
//       applicationStep: 4,
//     },
//   ];
// }
// /* ==============================================================
//    PERSONAL LOAN
//    Application:
//    1. Employment & Income
//    2. Financial Information
//    3. Loan Information
// ============================================================== */

// return [
//   ...commonSteps,

//   {
//     ...employmentStep,
//     applicationStep: 1,
//   },

//   {
//     ...personalLoanSteps[0],
//     applicationStep: 2,
//   },

//   {
//     ...loanStep,
//     applicationStep: 3,
//   },
// ];
//   }, [loanType]);

//   const reviewStep = useMemo(
//     () => ({
//       title: t("steps.submit.title"),

//       description: t("steps.submit.description"),
//     }),
//     [t],
//   );

//   const currentStep = STEPS[step];

//   /* ==============================================================
//      UPDATE FORM
//   ============================================================== */

//   const update = (key, value) => {
//     let nextValue = value;

//     /*
//      * Phone
//      */
//     if (key === "phone") {
//       nextValue = formatUSPhone(value);
//     }

//     /*
//      * SSN
//      */
//     if (key === "ssnItin") {
//       nextValue = formatSSN(value);
//     }

//     /*
//      * VIN
//      */
//     if (key === "vin") {
//       nextValue = normalizeVIN(value);
//     }

//     /*
//      * State / County (supports 2-letter codes or full region/county names e.g. CA, Greater London)
//      */
//     if (key === "state") {
//       nextValue = String(value || "")
//         .replace(/[^A-Za-zÀ-ÿ0-9' ._-]/g, "")
//         .slice(0, 50);
//     }

//     /*
//      * ZIP / Postal Code (supports UK postcodes like SW1A 1AA, US ZIPs 90210, and international codes)
//      */
//     if (key === "zipCode") {
//       nextValue = String(value || "")
//         .toUpperCase()
//         .replace(/[^A-Z0-9\s-]/g, "")
//         .slice(0, 12);
//     }

//     /*
//      * DOB fields
//      */
//     if (key === "dateOfBirthDay") {
//       nextValue = onlyDigits(value).slice(0, 2);
//     }

//     if (key === "dateOfBirthMonth") {
//       nextValue = onlyDigits(value).slice(0, 2);
//     }

//     if (key === "dateOfBirthYear") {
//       nextValue = onlyDigits(value).slice(0, 4);
//     }

//     /*
//      * Verification codes
//      */
//     if (key === "gmailVerificationCode" || key === "mobileVerificationCode") {
//       nextValue = onlyDigits(value).slice(0, 8);
//     }

//     setForm((previous) => ({
//       ...previous,
//       [key]: nextValue,
//     }));

//     setErrors((previous) => ({
//       ...previous,
//       [key]: "",
//     }));

//     if (key === "make" || key === "year") {
//       setVehicleError("");
//     }
//   };

//   /* ==============================================================
//      LOAD MAKES
//   ============================================================== */

//   useEffect(() => {
//     let cancelled = false;

//     const loadMakes = async () => {
//       setVehicleLoading((previous) => ({
//         ...previous,
//         makes: true,
//       }));

//       setVehicleError("");

//       try {
//         const makes = await getVehicleMakes();

//         if (cancelled) return;

//         setVehicleMakes(makes);
//       } catch (error) {
//         if (cancelled) return;

//         console.error("Vehicle makes loading error:", error);

//         setVehicleError(error?.message || "Unable to load vehicle makes.");
//       } finally {
//         if (!cancelled) {
//           setVehicleLoading((previous) => ({
//             ...previous,
//             makes: false,
//           }));
//         }
//       }
//     };

//     loadMakes();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   /* ==============================================================
//      LOAD MODELS
//   ============================================================== */

//   useEffect(() => {
//     if (currentStep?.key !== "vehicle" || !form.year || !form.make) {
//       setVehicleModels([]);
//       return;
//     }

//     let cancelled = false;

//     const loadModels = async () => {
//       setVehicleLoading((previous) => ({
//         ...previous,
//         models: true,
//       }));

//       setVehicleError("");

//       try {
//         const models = await getVehicleModels({
//           year: form.year,
//           make: form.make,
//         });

//         if (cancelled) return;

//         setVehicleModels(models);
//       } catch (error) {
//         if (cancelled) return;

//         console.error("Vehicle models loading error:", error);

//         setVehicleModels([]);

//         setVehicleError(error?.message || "Unable to load vehicle models.");
//       } finally {
//         if (!cancelled) {
//           setVehicleLoading((previous) => ({
//             ...previous,
//             models: false,
//           }));
//         }
//       }
//     };

//     loadModels();

//     return () => {
//       cancelled = true;
//     };
//   }, [currentStep?.key, step, form.year, form.make]);

//   /* ==============================================================
//      VALIDATION
//   ============================================================== */

//   const validateStep = () => {
//     const newErrors = {};

//     if (!currentStep) {
//       return true;
//     }

//     /* ============================================================
//        REQUIRED FIELDS
//     ============================================================ */

//     currentStep.fields.forEach(({ key, optional }) => {
//       if (optional) return;

//       const value = String(form[key] || "").trim();

//       if (!value) {
//         newErrors[key] = "This field is required.";
//       }
//     });

//     /* ============================================================
//        PERSONAL BASIC
//     ============================================================ */

//     if (currentStep.key === "personal-basic") {
//       const firstName = form.firstName.trim();

//       const middleName = form.middleName.trim();

//       const lastName = form.lastName.trim();

//       /*
//        * First name
//        */
//       if (firstName && !NAME_REGEX.test(firstName)) {
//         newErrors.firstName = "Enter a valid first name.";
//       }

//       /*
//        * Middle name
//        */
//       if (middleName && !NAME_REGEX.test(middleName)) {
//         newErrors.middleName = "Enter a valid middle name.";
//       }

//       /*
//        * Last name
//        */
//       if (lastName && !NAME_REGEX.test(lastName)) {
//         newErrors.lastName = "Enter a valid last name.";
//       }

//       /*
//        * Email
//        */
//       if (form.email && !EMAIL_REGEX.test(form.email.trim())) {
//         newErrors.email = "Enter a valid email address.";
//       }

//       /*
//        * Phone
//        */
//       const phone = normalizePhone(form.phone);

//       if (form.phone && !US_PHONE_REGEX.test(phone)) {
//         newErrors.phone = "Enter a valid US phone number.";
//       }
//     }

//     /* ============================================================
//        DOB
//     ============================================================ */

//     if (currentStep.key === "personal-dob") {
//       const dobError = validateDOB(
//         form.dateOfBirthDay,
//         form.dateOfBirthMonth,
//         form.dateOfBirthYear,
//       );

//       if (dobError) {
//         newErrors.dateOfBirthDay = dobError;
//       }
//     }

//     /* ============================================================
//        EMAIL VERIFICATION
//     ============================================================ */

//     if (currentStep.key === "personal-email-verification") {
//       if (!VERIFICATION_CODE_REGEX.test(form.gmailVerificationCode)) {
//         newErrors.gmailVerificationCode = "Enter the valid verification code.";
//       }
//     }

//     /* ============================================================
//        SSN / ITIN
//     ============================================================ */

//     if (currentStep.key === "personal-ssn") {
//       const ssn = form.ssnItin.replace(/\D/g, "");

//       if (!/^\d{9}$/.test(ssn)) {
//         newErrors.ssnItin = "SSN / ITIN must contain exactly 9 digits.";
//       } else if (!SSN_REGEX.test(form.ssnItin)) {
//         newErrors.ssnItin = "Enter a valid SSN / ITIN.";
//       }
//     }

//     /* ============================================================
//        ADDRESS
//     ============================================================ */

//     if (currentStep.key === "personal-address") {
//       /*
//        * City
//        */
//       if (form.city && !/^[A-Za-zÀ-ÿ0-9' .-]+$/.test(form.city.trim())) {
//         newErrors.city = "Enter a valid city or town name.";
//       }

//       /*
//        * State - enforce US 2-letter codes only
//        */
//       if (form.state && !US_STATE_CODES.includes(form.state.toUpperCase())) {
//         newErrors.state = "Enter a valid 2-letter US state code.";
//       }

//       /*
//        * ZIP Code - supports only US ZIPs (12345 or 12345-6789)
//        */
//       const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;
//       if (form.zipCode && !ZIP_REGEX.test(form.zipCode.trim())) {
//         newErrors.zipCode = "Enter a valid US ZIP code.";
//       }
//     }

//     /* ============================================================
//        MOBILE VERIFICATION
//     ============================================================ */

//     if (currentStep.key === "personal-mobile-verification") {
//       if (!VERIFICATION_CODE_REGEX.test(form.mobileVerificationCode)) {
//         newErrors.mobileVerificationCode = "Enter the valid verification code.";
//       }
//     }

//     /* ============================================================
//        VEHICLE
//     ============================================================ */

//     if (currentStep.key === "vehicle") {
//       if (!form.vehicleType) {
//         newErrors.vehicleType = "Select the vehicle type.";
//       }

//       if (!form.year) {
//         newErrors.year = "Please select a vehicle year.";
//       }

//       if (!form.make) {
//         newErrors.make = "Please select a vehicle make.";
//       }

//       if (!form.model) {
//         newErrors.model = "Please select a vehicle model.";
//       }

//       if (form.mileage === "") {
//         newErrors.mileage = "Enter the vehicle mileage.";
//       } else {
//         const mileage = Number(form.mileage);

//         if (!Number.isInteger(mileage) || mileage < 0) {
//           newErrors.mileage = "Enter a valid non-negative mileage.";
//         }
//       }

//       if (!form.condition) {
//         newErrors.condition = "Select the vehicle condition.";
//       }

//       if (!form.titleStatus) {
//         newErrors.titleStatus = "Select the vehicle title status.";
//       }

//       if (!form.existingLien) {
//         newErrors.existingLien =
//           "Select whether the vehicle has an existing lien.";
//       }

//       if (form.existingLien === "Yes" && form.lienAmount !== "") {
//         const lienAmount = Number(form.lienAmount);

//         if (!Number.isFinite(lienAmount) || lienAmount < 0) {
//           newErrors.lienAmount = "Enter a valid lien amount.";
//         }
//       }

//       const vin = normalizeVIN(form.vin);

//       if (!VIN_REGEX.test(vin)) {
//         newErrors.vin = "VIN must contain exactly 17 valid characters.";
//       }

//       if (/[IOQ]/i.test(form.vin)) {
//         newErrors.vin = "VIN cannot contain I, O, or Q.";
//       }
//     }

//     if (currentStep.key === "vehicle-photos") {
//       if (!Array.isArray(form.vehiclePhotos) || form.vehiclePhotos.length < 4) {
//         newErrors.vehiclePhotos = "Please upload at least 4 vehicle photos.";
//       }

//       const invalidFile = (form.vehiclePhotos || []).find(
//         (file) =>
//           !["image/jpeg", "image/png", "image/webp"].includes(file.type),
//       );

//       if (invalidFile) {
//         newErrors.vehiclePhotos = "Only JPG, PNG, and WebP images are allowed.";
//       }

//       const tooLarge = (form.vehiclePhotos || []).find(
//         (file) => file.size > 5 * 1024 * 1024,
//       );

//       if (tooLarge) {
//         newErrors.vehiclePhotos = "Each vehicle photo must be 5MB or smaller.";
//       }
//     }
//     /* ============================================================
//        LOAN
//     ============================================================ */

//     if (currentStep.key === "loan") {
//       const amount = Number(
//         String(form.amountRequested).replace(/[$,\s]/g, ""),
//       );

//       if (!Number.isFinite(amount) || amount <= 0) {
//         newErrors.amountRequested = "Enter a valid loan amount.";
//       }

//       if (amount > 10000000) {
//         newErrors.amountRequested = "Enter a valid loan amount.";
//       }
//     }

//     setErrors(newErrors);

//     return Object.keys(newErrors).length === 0;
//   };

//   /* ==============================================================
//      NEXT
//   ============================================================== */

//   const handleNext = () => {
//     if (!validateStep()) {
//       return;
//     }

//     setStep((previous) => Math.min(previous + 1, STEPS.length));
//   };

//   /* ==============================================================
//      BACK
//   ============================================================== */

//   const handleBack = () => {
//     setErrors({});
//     setVehicleError("");

//     setStep((previous) => Math.max(previous - 1, 0));
//   };

//   /* ==============================================================
//      SUBMIT
//   ============================================================== */

//   const handleSubmit = async () => {
//     /*
//      * Validate every step before submitting.
//      *
//      * This prevents someone from jumping to
//      * the review screen and submitting
//      * incomplete/invalid information.
//      */

//     const originalStep = step;

//     let allValid = true;

//     for (let index = 0; index < STEPS.length; index++) {
//       setStep(index);

//       const stepData = STEPS[index];

//       const previousCurrentStep = currentStep;

//       /*
//        * Validate directly against the
//        * step's fields.
//        */
//       const tempErrors = {};

//       stepData.fields.forEach(({ key, optional }) => {
//         if (optional) return;

//         if (!String(form[key] || "").trim()) {
//           tempErrors[key] = "This field is required.";
//         }
//       });

//       if (Object.keys(tempErrors).length) {
//         allValid = false;

//         setErrors(tempErrors);

//         break;
//       }
//     }

//     setStep(originalStep);

//     if (!allValid) {
//       return;
//     }

//     setSubmitError("");
//     setIsSubmitting(true);

//     try {
//       /*
//        * IMPORTANT:
//        *
//        * Do NOT console.log(form).
//        *
//        * The object contains SSN / ITIN.
//        */

//      const payload = {
//   ...form,

//   // IMPORTANT:
//   // Always send the loan type selected from the URL.
//   loanType,

//   phone: normalizePhone(form.phone),

//   ssnItin: form.ssnItin.replace(/\D/g, ""),

//   vin: normalizeVIN(form.vin),

//   state: form.state.toUpperCase(),

//   zipCode: form.zipCode.trim(),

//   amountRequested: Number(
//     String(form.amountRequested).replace(/[$,\s]/g, ""),
//   ),
// };

//       const response = await submitLoanApplication(payload);

//       if (response?.data?.loan) {
//         setSubmittedLoan(response.data.loan);
//       }

//       setIsSubmitted(true);
//     } catch (error) {
//       console.error("Application submission error:", error);

//       setSubmitError(error?.message || t("error.somethingWentWrong"));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ==============================================================
//      RESET
//   ============================================================== */

//   const resetApplication = () => {
//     setForm(INITIAL_FORM);

//     setStep(0);

//     setErrors({});

//     setSubmitError("");

//     setIsSubmitted(false);

//     setSubmittedLoan(null);

//     setVehicleModels([]);

//     setVehicleError("");
//   };

//   /* ==============================================================
//      AUTH GATE
//   ============================================================== */

//   if (!isAuthenticated) {
//     return (
//       <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
//         <div className="container-x mx-auto max-w-xl">
//           <div className="glass rounded-[34px] p-8 text-center shadow-xl md:p-12">
//             <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)]">
//               <Lock size={32} />
//             </div>

//             <h1 className="h3 text-[var(--ink)]">Sign In Required to Apply</h1>

//             <p className="mt-3 text-sm leading-6 text-black/60">
//               To apply for an auto title loan, please sign in to your Title Bros
//               account or create a new one.
//             </p>

//             <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//               <button
//                 type="button"
//                 onClick={() => openAuthModal("login")}
//                 className="btn-primary flex flex-1 items-center justify-center gap-2"
//               >
//                 <LogIn size={16} />
//                 Sign In to Account
//               </button>

//               <button
//                 type="button"
//                 onClick={() => openAuthModal("register")}
//                 className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--white)] py-3.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--paper)]"
//               >
//                 <UserPlus size={16} className="text-[var(--green)]" />
//                 Create New Account
//               </button>
//             </div>

//             <div className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
//               Title Bros Staff?{" "}
//               <Link
//                 href={`/${locale}/admin/login`}
//                 className="font-bold text-[var(--green)] hover:underline"
//               >
//                 Staff Operations Login
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   /* ==============================================================
//      MAIN
//   ============================================================== */

//   return (
//     <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
//       <div className="container-x">
//         <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
//           {/* ======================================================
//               LEFT
//           ====================================================== */}

//           <Reveal>
//             <div className="eyebrow text-[#101512]">{t("eyebrow")}</div>

//             <h1 className="h2 mt-6 text-[#101512]">{t("title")}</h1>

//             <p className="mt-7 max-w-md leading-7 text-black/50">
//               {t("description")}
//             </p>

//             <Steps
//   step={step}
//   currentStepKey={currentStep?.key}
//   steps={STEPS}
//   isSubmitted={isSubmitted}
// />
//           </Reveal>

//           {/* ======================================================
//               RIGHT
//           ====================================================== */}

//           <Reveal delay={0.08}>
//             <div className="glass rounded-[34px] p-6 md:p-10">
//               {/* ==================================================
//                   STEP COUNTER
//               ================================================== */}

//               {!isSubmitted && (
//   <div className="text-xs font-black uppercase tracking-[.16em] text-[var(--ink)]/35">
//     {(() => {
//       const personalSteps = STEPS.filter(
//         (item) => item.parent === "personal",
//       );

//       const applicationSteps = STEPS.filter(
//         (item) => item.parent !== "personal",
//       );

//       const personalIndex = personalSteps.findIndex(
//         (item) => item.key === currentStep?.key,
//       );

//       const applicationIndex = applicationSteps.findIndex(
//         (item) => item.key === currentStep?.key,
//       );

//       if (personalIndex >= 0) {
//         return `Personal Information — Step ${
//           personalIndex + 1
//         } of ${personalSteps.length}`;
//       }

//       if (applicationIndex >= 0) {
//         return `Application Step ${
//           applicationIndex + 1
//         } of ${applicationSteps.length}`;
//       }

//       return "";
//     })()}
//   </div>
// )}

//               {/* ==================================================
//                   TITLE
//               ================================================== */}

//               <h2 className="mt-3 text-3xl font-black tracking-tight">
//                {!isSubmitted
//     ? step < STEPS.length
//       ? currentStep?.title
//       : reviewStep.title
//     : "Application Submitted"}
//               </h2>

//               {/* ==================================================
//                   NORMAL STEPS
//               ================================================== */}

//               {!isSubmitted && step < STEPS.length && (
//                 <div className="mt-8">
//                   {/* =================================================
//                         DOB
//                     ================================================= */}

//                   {currentStep?.key === "personal-dob" ? (
//                     <div>
//                       {/* <p className="mb-6 text-sm leading-6 text-black/50"> */}
//                       <p className="mb-6 text-sm font-black leading-6 text-[var(--ink)]/45">
//                         {currentStep.description}
//                       </p>

//                       <div className="grid grid-cols-3 gap-3">
//                         <Field
//                           label="Day"
//                           value={form.dateOfBirthDay}
//                           onChange={(event) =>
//                             update("dateOfBirthDay", event.target.value)
//                           }
//                           type="number"
//                           placeholder="DD"
//                           error={errors.dateOfBirthDay}
//                           inputClassName="text-center"
//                         />

//                         <Field
//                           label="Month"
//                           value={form.dateOfBirthMonth}
//                           onChange={(event) =>
//                             update("dateOfBirthMonth", event.target.value)
//                           }
//                           type="number"
//                           placeholder="MM"
//                           error={errors.dateOfBirthMonth}
//                           inputClassName="text-center"
//                         />

//                         <Field
//                           label="Year"
//                           value={form.dateOfBirthYear}
//                           onChange={(event) =>
//                             update("dateOfBirthYear", event.target.value)
//                           }
//                           type="number"
//                           placeholder="YYYY"
//                           error={errors.dateOfBirthYear}
//                           inputClassName="text-center"
//                         />
//                       </div>
//                     </div>
//                   ) : currentStep?.key === "vehicle" ? (
//                     /* =================================================
//         VEHICLE
//      ================================================= */

//                     <div>
//                       <p className="mb-6 text-sm leading-6">
//                         {currentStep.description}
//                       </p>

//                       <div className="grid gap-4 sm:grid-cols-2">
//                         {/* VEHICLE TYPE */}
//                         <Select
//                           label="Vehicle Type"
//                           value={form.vehicleType}
//                           onChange={(event) =>
//                             update("vehicleType", event.target.value)
//                           }
//                           error={errors.vehicleType}
//                         >
//                           <option value="">Select vehicle type</option>
//                           <option value="Car">Car</option>
//                           <option value="Truck">Truck</option>
//                           <option value="SUV">SUV</option>
//                           <option value="Van">Van</option>
//                           <option value="Motorcycle">Motorcycle</option>
//                           <option value="Other">Other</option>
//                         </Select>

//                         {/* YEAR */}
//                         <CustomSelect
//                           label="Year"
//                           value={form.year}
//                           options={VEHICLE_YEARS}
//                           placeholder="Select year"
//                           error={errors.year}
//                           onChange={(value) => {
//                             update("year", value);
//                             update("make", "");
//                             update("model", "");
//                             setVehicleModels([]);
//                           }}
//                         />

//                         {/* MAKE */}
//                         <VehicleSelect
//                           label="Make"
//                           value={form.make}
//                           options={vehicleMakes}
//                           loading={vehicleLoading.makes}
//                           disabled={!form.year}
//                           placeholder={
//                             form.year ? "Select make" : "Select year first"
//                           }
//                           error={errors.make}
//                           onChange={(value) => {
//                             update("make", value);
//                             update("model", "");
//                             setVehicleModels([]);
//                           }}
//                         />

//                         {/* MODEL */}
//                         <VehicleSelect
//                           label="Model"
//                           value={form.model}
//                           options={vehicleModels}
//                           loading={vehicleLoading.models}
//                           disabled={!form.year || !form.make}
//                           placeholder={
//                             !form.year
//                               ? "Select year first"
//                               : !form.make
//                                 ? "Select make first"
//                                 : "Select model"
//                           }
//                           error={errors.model}
//                           onChange={(value) => update("model", value)}
//                         />

//                         {/* TRIM */}
//                         <Field
//                           label="Trim Level"
//                           value={form.trim}
//                           onChange={(event) =>
//                             update("trim", event.target.value)
//                           }
//                           placeholder="Enter trim level"
//                           error={errors.trim}
//                         />

//                         {/* MILEAGE */}
//                         <Field
//                           label="Mileage"
//                           value={form.mileage}
//                           onChange={(event) =>
//                             update("mileage", event.target.value)
//                           }
//                           type="number"
//                           placeholder="Enter mileage"
//                           error={errors.mileage}
//                         />

//                         {/* CONDITION */}
//                         <Select
//                           label="Vehicle Condition"
//                           value={form.condition}
//                           onChange={(event) =>
//                             update("condition", event.target.value)
//                           }
//                           error={errors.condition}
//                         >
//                           <option value="">Select condition</option>
//                           <option value="Excellent">Excellent</option>
//                           <option value="Good">Good</option>
//                           <option value="Fair">Fair</option>
//                           <option value="Poor">Poor</option>
//                         </Select>

//                         {/* COLOR */}
//                         <Field
//                           label="Vehicle Color"
//                           value={form.color}
//                           onChange={(event) =>
//                             update("color", event.target.value)
//                           }
//                           placeholder="Enter vehicle color"
//                           error={errors.color}
//                         />

//                         {/* TITLE STATUS */}
//                         <Select
//                           label="Title Status"
//                           value={form.titleStatus}
//                           onChange={(event) =>
//                             update("titleStatus", event.target.value)
//                           }
//                           error={errors.titleStatus}
//                         >
//                           <option value="">Select title status</option>
//                           <option value="Clean">Clean</option>
//                           <option value="Salvage">Salvage</option>
//                           <option value="Rebuilt">Rebuilt</option>
//                         </Select>

//                         {/* EXISTING LIEN */}
//                         <Select
//                           label="Existing Lien"
//                           value={form.existingLien}
//                           onChange={(event) =>
//                             update("existingLien", event.target.value)
//                           }
//                           error={errors.existingLien}
//                         >
//                           <option value="">Select option</option>
//                           <option value="Yes">Yes</option>
//                           <option value="No">No</option>
//                         </Select>

//                         {/* LIEN AMOUNT */}
//                         {form.existingLien === "Yes" && (
//                           <Field
//                             label="Lien Amount"
//                             value={form.lienAmount}
//                             onChange={(event) =>
//                               update("lienAmount", event.target.value)
//                             }
//                             type="number"
//                             placeholder="Enter lien amount"
//                             error={errors.lienAmount}
//                             prefix="$"
//                           />
//                         )}

//                         {/* VIN */}
//                         <div className="sm:col-span-2 space-y-2">
//                           <label className="text-[13px] font-bold text-[#101512]">
//                             VIN
//                           </label>

//                           <div className="flex gap-2">
//                             <input
//                               type="text"
//                               value={form.vin}
//                               maxLength={17}
//                               onChange={async (event) => {
//                                 const val = event.target.value
//                                   .toUpperCase()
//                                   .replace(/[IOQ\s]/g, "")
//                                   .slice(0, 17);

//                                 update("vin", val);

//                                 if (
//                                   val.length === 17 &&
//                                   !vehicleLoading.decoding
//                                 ) {
//                                   setVehicleLoading((p) => ({
//                                     ...p,
//                                     decoding: true,
//                                   }));

//                                   setVehicleError("");

//                                   try {
//                                     const { decodeVin } =
//                                       await import("@/services/vehicleService");

//                                     const data = await decodeVin(val);

//                                     if (data?.Results) {
//                                       const year = data.Results.find(
//                                         (r) => r.Variable === "Model Year",
//                                       )?.Value;

//                                       const make = data.Results.find(
//                                         (r) => r.Variable === "Make",
//                                       )?.Value;

//                                       const model = data.Results.find(
//                                         (r) => r.Variable === "Model",
//                                       )?.Value;

//                                       const errorCode = data.Results.find(
//                                         (r) => r.Variable === "Error Code",
//                                       )?.Value;

//                                       if (!make || !model) {
//                                         setVehicleError(
//                                           `Invalid VIN: ${
//                                             errorCode ||
//                                             "Vehicle details not found."
//                                           }`,
//                                         );
//                                       } else {
//                                         if (year) update("year", year);
//                                         if (make) update("make", make);
//                                         if (model) update("model", model);
//                                       }
//                                     }
//                                   } catch (err) {
//                                     setVehicleError(
//                                       "Failed to decode VIN. Please enter vehicle details manually.",
//                                     );
//                                   } finally {
//                                     setVehicleLoading((p) => ({
//                                       ...p,
//                                       decoding: false,
//                                     }));
//                                   }
//                                 }
//                               }}
//                               placeholder="Enter 17-character VIN"
//                               className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm outline-none focus:border-[#087a45]"
//                             />

//                             <button
//                               type="button"
//                               disabled={
//                                 form.vin.length !== 17 ||
//                                 vehicleLoading.decoding
//                               }
//                               onClick={async () => {
//                                 if (form.vin.length !== 17) return;

//                                 setVehicleLoading((p) => ({
//                                   ...p,
//                                   decoding: true,
//                                 }));

//                                 setVehicleError("");

//                                 try {
//                                   const { decodeVin } =
//                                     await import("@/services/vehicleService");

//                                   const data = await decodeVin(form.vin);

//                                   if (data?.Results) {
//                                     const year = data.Results.find(
//                                       (r) => r.Variable === "Model Year",
//                                     )?.Value;

//                                     const make = data.Results.find(
//                                       (r) => r.Variable === "Make",
//                                     )?.Value;

//                                     const model = data.Results.find(
//                                       (r) => r.Variable === "Model",
//                                     )?.Value;

//                                     if (!make || !model) {
//                                       setVehicleError(
//                                         "Vehicle details could not be found for this VIN.",
//                                       );
//                                     } else {
//                                       if (year) update("year", year);
//                                       if (make) update("make", make);
//                                       if (model) update("model", model);
//                                     }
//                                   }
//                                 } catch {
//                                   setVehicleError(
//                                     "Failed to decode VIN. Please enter vehicle details manually.",
//                                   );
//                                 } finally {
//                                   setVehicleLoading((p) => ({
//                                     ...p,
//                                     decoding: false,
//                                   }));
//                                 }
//                               }}
//                               className="h-14 shrink-0 rounded-2xl bg-[#087a45] px-6 text-sm font-bold text-white transition hover:bg-[#066b3c] disabled:cursor-not-allowed disabled:opacity-50"
//                             >
//                               {vehicleLoading.decoding
//                                 ? "Decoding..."
//                                 : "Decode"}
//                             </button>
//                           </div>

//                           {errors.vin && (
//                             <p className="mt-1.5 text-xs font-medium text-red-500">
//                               {errors.vin}
//                             </p>
//                           )}

//                           <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.04em] text-black/50">
//                             VIN must contain 17 characters and cannot contain I,
//                             O or Q.
//                           </p>

//                           {vehicleError && (
//                             <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs leading-5 text-red-600">
//                               {vehicleError}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ) : currentStep?.key === "vehicle-photos" ? (
//                     /* =================================================
//         VEHICLE PHOTOS
//      ================================================= */

//                     <div>
//                       <p className="mb-6 text-sm leading-6">
//                         {currentStep.description}
//                       </p>

//                       <div className="rounded-3xl border border-black/10 bg-white p-5">
//                         <label className="mb-3 block text-sm font-bold text-[#101512]">
//                           Vehicle Photos
//                         </label>

//                         <p className="mb-4 text-xs leading-5 text-black/55">
//                           Upload at least 4 clear photos of your vehicle.
//                         </p>

//                         <input
//                           type="file"
//                           accept="image/jpeg,image/png,image/webp"
//                           multiple
//                           onChange={(event) => {
//                             const files = Array.from(event.target.files || []);

//                             update("vehiclePhotos", files);
//                           }}
//                           className="block w-full rounded-2xl border border-dashed border-black/20 bg-[#fafbf9] p-4 text-sm"
//                         />

//                         {form.vehiclePhotos?.length > 0 && (
//                           <div className="mt-4">
//                             <p className="text-xs font-bold text-[#087a45]">
//                               {form.vehiclePhotos.length} photo
//                               {form.vehiclePhotos.length !== 1 ? "s" : ""}{" "}
//                               selected
//                             </p>

//                             <div className="mt-3 grid gap-2 sm:grid-cols-2">
//                               {form.vehiclePhotos.map((file, index) => (
//                                 <div
//                                   key={`${file.name}-${index}`}
//                                   className="rounded-xl bg-[#f5f6f3] px-3 py-2 text-xs"
//                                 >
//                                   {file.name}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {errors.vehiclePhotos && (
//                           <p className="mt-2 text-xs font-medium text-red-500">
//                             {errors.vehiclePhotos}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   ) : currentStep?.key === "loan" ? (
//                     /* =================================================
//                           LOAN
//                       ================================================= */

//                     <div>
//                       <p className="mb-6 text-sm leading-6">
//                         {currentStep.description}
//                       </p>

//                       <div className="grid gap-4 sm:grid-cols-2">
//                         <Field
//                           label={t("steps.loan.fields.amountRequested")}
//                           value={form.amountRequested}
//                           onChange={(event) =>
//                             update("amountRequested", event.target.value)
//                           }
//                           type="number"
//                           placeholder="Enter amount requested"
//                           error={errors.amountRequested}
//                           prefix="$"
//                         />

//                         <Select
//                           label={t("steps.loan.fields.reasonForFunds")}
//                           value={form.reasonForFunds}
//                           onChange={(event) =>
//                             update("reasonForFunds", event.target.value)
//                           }
//                           error={errors.reasonForFunds}
//                         >
//                           <option value="">Select reason</option>

//                           <option value="Personal">Personal</option>

//                           <option value="Debt Consolidation">
//                             Debt Consolidation
//                           </option>

//                           <option value="Business">Business</option>

//                           <option value="Emergency">Emergency</option>

//                           <option value="Other">Other</option>
//                         </Select>

//                         <Select
//                           label={t("steps.loan.fields.employmentStatus")}
//                           value={form.employmentStatus}
//                           onChange={(event) =>
//                             update("employmentStatus", event.target.value)
//                           }
//                           error={errors.employmentStatus}
//                         >
//                           <option value="">Select employment status</option>

//                           <option value="Employed">Employed</option>

//                           <option value="Self Employed">Self Employed</option>

//                           <option value="Unemployed">Unemployed</option>

//                           <option value="Retired">Retired</option>

//                           <option value="Student">Student</option>
//                         </Select>
//                       </div>
//                     </div>
//                   ) : (
//                     /* =================================================
//                           PERSONAL FIELDS
//                       ================================================= */

//                     <div className="grid gap-4 sm:grid-cols-2">
//                       {currentStep?.fields.map(
//                         ({ key, label, type = "text", optional }) => {
//                           const isVerification =
//                             key === "gmailVerificationCode" ||
//                             key === "mobileVerificationCode";

//                           const isSSN = key === "ssnItin";

//                           const isPhone = key === "phone";

//                           const isAddress = key === "address";

//                           const fullWidth =
//                             isVerification || isSSN || isAddress;

//                           let icon = null;

//                           if (isVerification) {
//                             icon = <Mail size={17} />;
//                           }

//                           if (isSSN) {
//                             icon = <ShieldCheck size={17} />;
//                           }

//                           if (isAddress) {
//                             icon = <MapPin size={17} />;
//                           }

//                           if (isAddress) {
//                             return (
//                               <AddressAutocomplete
//                                 key={key}
//                                 label={label}
//                                 value={form.address}
//                                 onChange={(val) => update("address", val)}
//                                 onSelectAddress={({
//                                   address,
//                                   street,
//                                   city,
//                                   state,
//                                   zipCode,
//                                 }) => {
//                                   setForm((prev) => ({
//                                     ...prev,
//                                     address: address || prev.address,
//                                     street: street || prev.street,
//                                     city: city || prev.city,
//                                     state: state || prev.state,
//                                     zipCode: zipCode || prev.zipCode,
//                                   }));
//                                   setErrors((prev) => {
//                                     const clean = { ...prev };
//                                     delete clean.address;
//                                     delete clean.street;
//                                     delete clean.city;
//                                     delete clean.state;
//                                     delete clean.zipCode;
//                                     return clean;
//                                   });
//                                 }}
//                                 error={errors.address}
//                                 className="sm:col-span-2"
//                               />
//                             );
//                           }

//                           return (
//                             <Field
//                               key={key}
//                               label={label}
//                               value={form[key]}
//                               onChange={(event) =>
//                                 update(key, event.target.value)
//                               }
//                               type={isSSN ? "text" : type}
//                               optional={optional}
//                               icon={icon}
//                               error={errors[key]}
//                               className={
//                                 fullWidth ? "sm:col-span-2" : "sm:col-span-1"
//                               }
//                               placeholder={
//                                 isVerification
//                                   ? "Enter verification code"
//                                   : isSSN
//                                     ? "Enter SSN / ITIN"
//                                     : isPhone
//                                       ? "(555) 555-5555"
//                                       : `Enter ${label.toLowerCase()}`
//                               }
//                             />
//                           );
//                         },
//                       )}
//                     </div>
//                   )}

//                   {/* =================================================
//                         EMAIL MESSAGE
//                     ================================================= */}

//                   {currentStep?.key === "personal-email-verification" && (
//                     <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef7df] p-4 text-xs text-[#087a45]">
//                       <Mail size={18} className="mt-0.5 shrink-0" />

//                       <p>
//                         We sent a verification code to{" "}
//                         <strong>{form.email || "your email address"}</strong>.
//                       </p>
//                     </div>
//                   )}

//                   {/* =================================================
//                         MOBILE MESSAGE
//                     ================================================= */}

//                   {currentStep?.key === "personal-mobile-verification" && (
//                     <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef7df] p-4 text-xs text-[#087a45]">
//                       <Smartphone size={18} className="mt-0.5 shrink-0" />

//                       <p>
//                         We sent a verification code to{" "}
//                         <strong>{form.phone || "your mobile number"}</strong>.
//                       </p>
//                     </div>
//                   )}

//                   {/* =================================================
//                         SSN MESSAGE
//                     ================================================= */}

//                   {currentStep?.key === "personal-ssn" && (
//                     <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f5f7f3] p-4 text-xs leading-5 text-black/50">
//                       <ShieldCheck
//                         size={18}
//                         className="mt-0.5 shrink-0 text-[#087a45]"
//                       />

//                       <p>
//                         Your SSN / ITIN is sensitive information. Keep it secure
//                         and only send it through your encrypted application
//                         flow.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ======================================================
//                   REVIEW
//               ====================================================== */}

//               {!isSubmitted && step === STEPS.length && (
//                 <div className="mt-8">
//                   <div className="rounded-[26px] bg-[#eef7df] p-7">
//                     <div className="flex">
//                       <CheckCircle2 className="text-[#087a45]" size={34} />

//                       <h3 className="ml-2 text-2xl font-black text-[#101512]">
//                         {t("ready.title")}
//                       </h3>
//                     </div>

//                     <p className="mt-3 text-sm leading-6 text-black/55">
//                       {t("ready.description")}
//                     </p>
//                   </div>

//                   {/* PERSONAL */}

//                   <ReviewCard
//                     icon={<User size={17} />}
//                     title="Personal Information"
//                     onEdit={() =>
//   setStep(
//     STEPS.findIndex(
//       (item) => item.key === "personal-basic",
//     ),
//   )
// }
//                   >
//                     <ReviewItem
//                       label="Full Name"
//                       value={`${form.firstName} ${
//                         form.middleName ? `${form.middleName} ` : ""
//                       }${form.lastName}`}
//                     />

//                     <ReviewItem
//                       label="Date of Birth"
//                       value={
//                         form.dateOfBirthDay &&
//                         form.dateOfBirthMonth &&
//                         form.dateOfBirthYear
//                           ? `${form.dateOfBirthMonth}/${form.dateOfBirthDay}/${form.dateOfBirthYear}`
//                           : "—"
//                       }
//                     />

//                     <ReviewItem label="Phone" value={form.phone} />

//                     <ReviewItem label="Email" value={form.email} />

//                     <ReviewItem label="Address" value={form.address} />

//                     <ReviewItem
//                       label="City / State"
//                       value={`${form.city || "—"}, ${form.state || "—"}`}
//                     />

//                     <ReviewItem label="ZIP" value={form.zipCode} />

//                     <ReviewItem label="SSN / ITIN" value="•••••••••" />
//                   </ReviewCard>

//                   {/* VEHICLE */}

//                   <ReviewCard
//                     icon={<Car size={17} />}
//                     title="Vehicle Information"
//                     onEdit={() =>
//   setStep(
//     STEPS.findIndex(
//       (item) => item.key === "vehicle",
//     ),
//   )
// }
//                   >
//                     <ReviewItem label="Year" value={form.year} />

//                     <ReviewItem label="Make" value={form.make} />

//                     <ReviewItem label="Model" value={form.model} />

//                     <ReviewItem label="VIN" value={form.vin} />
//                   </ReviewCard>

//                   {/* LOAN */}

//                   <ReviewCard
//                     icon={<DollarSign size={17} />}
//                     title="Loan Information"
//                     onEdit={() =>
//   setStep(
//     STEPS.findIndex(
//       (item) => item.key === "loan",
//     ),
//   )
// }
//                   >
//                     <ReviewItem
//                       label="Amount Requested"
//                       value={
//                         form.amountRequested
//                           ? `$${Number(
//                               String(form.amountRequested).replace(
//                                 /[$,\s]/g,
//                                 "",
//                               ),
//                             ).toLocaleString()}`
//                           : "—"
//                       }
//                     />

//                     <ReviewItem
//                       label="Reason"
//                       value={form.reasonForFunds || "—"}
//                     />

//                     <ReviewItem
//                       label="Employment"
//                       value={form.employmentStatus || "—"}
//                     />
//                   </ReviewCard>
//                 </div>
//               )}

//               {/* ======================================================
//                   SUCCESS
//               ====================================================== */}

//               {isSubmitted && (
//                 <div className="mt-8 space-y-5">
//                   <div className="rounded-[26px] border border-emerald-500/20 bg-[#eef7df] p-6">
//                     <div className="flex items-start gap-4">
//                       <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#087a45] text-white">
//                         <CheckCircle2 size={26} />
//                       </div>

//                       <div>
//                         <span className="text-[10px] font-black uppercase tracking-widest text-[#087a45]">
//                           Application Submitted
//                         </span>

//                         <h3 className="mt-1 text-xl font-black text-[#101512]">
//                           {form.firstName}
//                           &apos;s Auto Title Loan Application
//                         </h3>

//                         <p className="mt-2 text-xs leading-5 text-black/60">
//                           Your application has been successfully received and is
//                           now under review.
//                         </p>
//                       </div>
//                     </div>

//                     <div className="mt-5 flex flex-wrap gap-2">
//                       <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
//                         ● Under Review
//                       </span>

//                       <span className="rounded-xl border border-emerald-200 bg-white px-3 py-1 font-mono text-xs font-bold text-[#087a45]">
//                         #
//                         {submittedLoan?._id
//                           ? submittedLoan._id.slice(-6).toUpperCase()
//                           : "SUBMITTED"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* PERSONAL SUMMARY */}

//                   <ReviewCard
//                     icon={<User size={17} />}
//                     title="Personal Information"
//                   >
//                     <ReviewItem
//                       label="Name"
//                       value={`${form.firstName} ${form.lastName}`}
//                     />

//                     <ReviewItem label="Email" value={form.email} />

//                     <ReviewItem label="Phone" value={form.phone} />

//                     <ReviewItem label="ZIP" value={form.zipCode} />
//                   </ReviewCard>

//                   {/* VEHICLE SUMMARY */}

//                   <ReviewCard
//                     icon={<Car size={17} />}
//                     title="Vehicle Information"
//                   >
//                     <ReviewItem
//                       label="Vehicle"
//                       value={`${form.year} ${form.make} ${form.model}`}
//                     />

//                     <ReviewItem label="VIN" value={form.vin} />
//                   </ReviewCard>

//                   {/* LOAN SUMMARY */}

//                   <ReviewCard
//                     icon={<DollarSign size={17} />}
//                     title="Loan Information"
//                   >
//                     <ReviewItem
//                       label="Amount Requested"
//                       value={
//                         form.amountRequested
//                           ? `$${Number(
//                               String(form.amountRequested).replace(
//                                 /[$,\s]/g,
//                                 "",
//                               ),
//                             ).toLocaleString()}`
//                           : "—"
//                       }
//                     />

//                     <ReviewItem
//                       label="Employment"
//                       value={form.employmentStatus || "—"}
//                     />
//                   </ReviewCard>

//                   <div className="flex flex-col gap-3 pt-2 sm:flex-row">
//                     <Link
//                       href={`/${locale}/portal`}
//                       className="btn-primary flex flex-1 items-center justify-center gap-2 text-center"
//                     >
//                       View My Application
//                       <ArrowRight size={16} />
//                     </Link>

//                     <button
//                       type="button"
//                       onClick={resetApplication}
//                       className="rounded-2xl border border-[var(--line)] bg-white px-5 py-3.5 text-xs font-bold text-[#000] transition-all hover:text-white hover:bg-[var(--ink)]"
//                     >
//                       Submit Another Vehicle
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ======================================================
//                   SUBMIT ERROR
//               ====================================================== */}

//               {submitError && (
//                 <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
//                   {submitError}
//                 </div>
//               )}

//               {/* ======================================================
//                   NAVIGATION
//               ====================================================== */}

//               {!isSubmitted && (
//                 <div className="mt-9 flex justify-between gap-3">
//                   <button
//                     type="button"
//                     onClick={handleBack}
//                     disabled={step === 0 || isSubmitting}
//                     className="btn-ghost flex items-center gap-2 disabled:opacity-30"
//                   >
//                     <ArrowLeft size={16} />
//                     Back
//                   </button>

//                   {step < STEPS.length ? (
//                     <button
//                       type="button"
//                       onClick={handleNext}
//                       disabled={isSubmitting}
//                       className="btn-primary flex items-center gap-2"
//                     >
//                      {step < STEPS.length - 1 ? "Next" : "Continue"}

//                       <ArrowRight size={16} />
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={handleSubmit}
//                       disabled={isSubmitting}
//                       className="btn-primary flex items-center gap-2 disabled:opacity-60"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <Loader2 size={16} className="animate-spin" />
//                           Submitting...
//                         </>
//                       ) : (
//                         <>
//                           Continue & Submit
//                           <ArrowRight size={16} />
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </Reveal>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ApplyContent;


"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  DollarSign,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  User,
  UserPlus,
} from "lucide-react";

import Reveal from "@/components/Reveal";

import Field from "@/components/apply/Field";
import AddressAutocomplete from "@/components/apply/AddressAutocomplete";
import Steps from "@/components/apply/Steps";
import { ReviewCard, ReviewItem } from "@/components/apply/ReviewCard";

import Select from "@/components/ui/Select";
import CustomSelect from "@/components/ui/CustomSelect";
import VehicleSelect from "@/components/ui/VehicleSelect";

import { getVehicleMakes, getVehicleModels } from "@/services/vehicleService";

import { submitLoanApplication } from "@/services/loanService";

import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

/* ================================================================
   CONSTANTS
================================================================ */

const CURRENT_YEAR = new Date().getFullYear();

const MINIMUM_AGE = 18;

/*
 * US states + DC.
 *
 * The user can enter the two-letter abbreviation.
 */
const US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

/*
 * VIN:
 *
 * US-standard VIN is 17 characters.
 *
 * I, O and Q are not used in VINs because
 * they can be confused with 1 and 0.
 */
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

/*
 * US ZIP:
 *
 * 12345
 * 12345-6789
 */
const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;

/*
 * US phone:
 *
 * Accepted internally as:
 *
 * 1234567890
 * +11234567890
 * 123-456-7890
 * (123) 456-7890
 *
 * We normalize it to digits before validation.
 */
const US_PHONE_REGEX = /^(?:1)?[2-9]\d{2}[2-9]\d{6}$/;

/*
 * Standard email validation.
 *
 * This accepts Gmail, Outlook, Yahoo, business
 * email addresses, etc.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
 * Name:
 *
 * Allows:
 * John
 * O'Connor
 * Mary-Jane
 * John Smith
 */
const NAME_REGEX = /^[A-Za-zÀ-ÿ' -]+$/;

/*
 * SSN:
 *
 * 9 digits.
 *
 * We accept:
 *
 * 123456789
 * 123-45-6789
 */
const SSN_REGEX =
  /^(?!000|666|9\d\d)\d{3}(?:-)?(?!00)\d{2}(?:-)?(?!0000)\d{4}$/;

/*
 * Verification codes.
 */
const VERIFICATION_CODE_REGEX = /^\d{4,8}$/;

/* ================================================================
   INITIAL FORM
================================================================ */

const INITIAL_FORM = {
  /* ============================================================
     LOAN TYPE
  ============================================================ */
  loanType: "title-loan",

  /* ============================================================
     PERSONAL
  ============================================================ */
  firstName: "",
  middleName: "",
  lastName: "",

  /* DOB */
  dateOfBirthDay: "",
  dateOfBirthMonth: "",
  dateOfBirthYear: "",

  /* SSN / ITIN */
  ssnItin: "",

  /* Military */
  militaryStatus: "",

  /* ============================================================
     CONTACT
  ============================================================ */
  phone: "",
  email: "",

  /* Verification */
  gmailVerificationCode: "",
  mobileVerificationCode: "",

  /* SMS Preferences */
  promotionalSmsConsent: false,
  accountAlertsSmsConsent: false,

  /* ============================================================
     ADDRESS
  ============================================================ */
  address: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",

  /* ============================================================
     EMPLOYMENT & INCOME
  ============================================================ */
  employmentStatus: "",
  employerName: "",
  incomeAmount: "",
  incomeFrequency: "",

  /* ============================================================
     HOUSING / PERSONAL LOAN FINANCIAL INFO
  ============================================================ */
  housingStatus: "",
  monthlyHousingPayment: "",

  /* ============================================================
     VEHICLE - TITLE LOAN ONLY
  ============================================================ */
  vehicleType: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  vin: "",
  mileage: "",
  condition: "",
  color: "",
  titleStatus: "",
  existingLien: "",
  lienAmount: "",

  /* Vehicle Photos */
  vehiclePhotos: [],

  /* ============================================================
     LOAN
  ============================================================ */
  amountRequested: "",
  reasonForFunds: "",
};
/* ================================================================
   VEHICLE YEARS
================================================================ */

const VEHICLE_YEARS = Array.from(
  {
    length: CURRENT_YEAR - 1980 + 1,
  },
  (_, index) => String(CURRENT_YEAR - index),
);


/*
 * Preliminary, transparent estimate for the application UI.
 * This is not a KBB quote. SOW flow keeps KBB as a reference
 * and the final assessed value under admin review.
 */
const calculateVehicleEstimate = ({
  year,
  make,
  model,
  trim,
  vehicleType,
  mileage,
  condition,
  titleStatus,
}) => {
  if (!year || !make || !model || mileage === "" || !condition) return 0;

  const type = String(vehicleType || "Car").toLowerCase();
  const modelText = `${make} ${model} ${trim || ""}`.toLowerCase();
  const age = Math.max(0, CURRENT_YEAR - Number(year));
  const miles = Math.max(0, Number(mileage) || 0);

  const baseByType = {
    car: 28000,
    truck: 39000,
    suv: 36000,
    van: 32000,
    motorcycle: 12500,
    other: 22000,
  };
  let base = baseByType[type] || baseByType.car;

  // Broad vehicle-class adjustment only; this is not a live market lookup.
  if (/luxury|premium|amg|m|rs[ -]|sport|performance|limited|platinum|denali|king ranch|raptor|s-class|7 series|a8|x5|x7|range rover|lexus|porsche|cadillac|genesis|maserati|bentley|ferrari|lamborghini/.test(modelText)) {
    base *= 1.35;
  } else if (/civic|corolla|versa|sentra|elantra|forte|mirage|spark|fit|yaris/.test(modelText)) {
    base *= 0.78;
  } else if (/f-150|silverado|sierra|ram 1500|tacoma|tundra|colorado|ranger|frontier|wrangler|4runner|suburban|expedition|escalade/.test(modelText)) {
    base *= 1.18;
  }

  // Broad brand adjustment, kept deliberately conservative.
  if (/toyota|honda|lexus|subaru/.test(modelText)) base *= 1.08;
  if (/mitsubishi|fiat|smart|jaguar|land rover/.test(modelText)) base *= 0.92;

  // Approximate depreciation: 15% in year one, then 10% per year.
  const ageFactor = age <= 1 ? 1 - age * 0.15 : 0.85 * Math.pow(0.90, age - 1);
  const expectedMiles = age * 12000;
  const mileageFactor = Math.max(0.45, Math.min(1.08, 1 - ((miles - expectedMiles) / 100000) * 0.18));
  const conditionFactor = {
    Excellent: 1.12,
    Good: 1,
    Fair: 0.78,
    Poor: 0.55,
  }[condition] || 1;
  const titleFactor = {
    Clean: 1,
    Rebuilt: 0.72,
    Salvage: 0.48,
  }[titleStatus] || 1;

  return Math.max(0, Math.round((base * ageFactor * mileageFactor * conditionFactor * titleFactor) / 100) * 100);
};


/* ================================================================
   HELPERS
================================================================ */

/**
 * Keep only digits.
 */
const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

/**
 * Normalize US phone.
 */
const normalizePhone = (value) =>
  onlyDigits(value).replace(/^1(?=\d{10}$)/, "");

/**
 * Format SSN.
 *
 * 123456789
 * ->
 * 123-45-6789
 */
const formatSSN = (value) => {
  const digits = onlyDigits(value).slice(0, 9);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

/**
 * Format US phone.
 */
const formatUSPhone = (value) => {
  const digits = normalizePhone(value).slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/**
 * Normalize VIN.
 */
const normalizeVIN = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .slice(0, 17);

/**
 * Validate date and age.
 */
const validateDOB = (day, month, year) => {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);

  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
    return "Enter a valid date of birth.";
  }

  if (y < 1900 || y > CURRENT_YEAR) {
    return "Enter a valid birth year.";
  }

  if (m < 1 || m > 12) {
    return "Enter a valid birth month.";
  }

  if (d < 1 || d > 31) {
    return "Enter a valid birth day.";
  }

  const date = new Date(y, m - 1, d);

  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return "Enter a valid date of birth.";
  }

  const today = new Date();

  let age = today.getFullYear() - y;

  const birthdayThisYear = new Date(today.getFullYear(), m - 1, d);

  if (today < birthdayThisYear) {
    age--;
  }

  if (age < MINIMUM_AGE) {
    return `You must be at least ${MINIMUM_AGE} years old.`;
  }

  return "";
};

/* ================================================================
   APPLY CONTENT
================================================================ */

function ApplyContent() {
  const t = useTranslations("apply");

  const { locale } = useParams();
  const searchParams = useSearchParams();

  const loanType =
    searchParams.get("loanType") === "personal-loan"
      ? "personal-loan"
      : "title-loan";

  const { user, isAuthenticated, openAuthModal } = useAuth();

  /* ==============================================================
     STATE
  ============================================================== */

  const [step, setStep] = useState(0);

  const [form, setForm] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [submittedLoan, setSubmittedLoan] = useState(null);

  const [submitError, setSubmitError] = useState("");

  /* ==============================================================
     VEHICLE STATE
  ============================================================== */

  const [vehicleMakes, setVehicleMakes] = useState([]);

  const [vehicleModels, setVehicleModels] = useState([]);

  const [vehicleLoading, setVehicleLoading] = useState({
    makes: false,
    models: false,
  });

  const [vehicleError, setVehicleError] = useState("");

  /* ==============================================================
     AUTH PREFILL
  ============================================================== */

  useEffect(() => {
    if (!user) return;

    const nameParts = (user.name || "").trim().split(" ");

    const firstName = nameParts[0] || "";

    const lastName = nameParts.slice(1).join(" ") || "";

    setForm((previous) => ({
      ...previous,

      firstName: previous.firstName || firstName,

      lastName: previous.lastName || lastName,

      email: previous.email || user.email || "",

      phone: previous.phone || user.phone || "",
    }));
  }, [user]);

  /* ==============================================================
     STEPS
  ============================================================== */

  const STEPS = useMemo(() => {
    const commonSteps = [
      {
        key: "personal-basic",
        parent: "personal",
        title: "Personal Information",
        description: "Tell us about yourself.",
        fields: [
          {
            key: "firstName",
            label: "First Name",
          },
          {
            key: "middleName",
            label: "M.I.",
            optional: true,
          },
          {
            key: "lastName",
            label: "Last Name",
          },
          {
            key: "phone",
            label: "Mobile / Home Phone",
            type: "tel",
          },
          {
            key: "email",
            label: "Email Address",
            type: "email",
          },
        ],
      },

      {
        key: "personal-dob",
        parent: "personal",
        title: "Date of Birth",
        description: "Enter your date of birth.",
        fields: [
          {
            key: "dateOfBirthDay",
            label: "Day",
          },
          {
            key: "dateOfBirthMonth",
            label: "Month",
          },
          {
            key: "dateOfBirthYear",
            label: "Year",
          },
        ],
      },

      {
        key: "personal-email-verification",
        parent: "personal",
        title: "Email Verification",
        description: "Enter the verification code sent to your email address.",
        fields: [
          {
            key: "gmailVerificationCode",
            label: "Email Verification Code",
          },
        ],
      },

      {
        key: "personal-ssn",
        parent: "personal",
        title: "Social Security Number",
        description: "Enter your Social Security Number or ITIN securely.",
        fields: [
          {
            key: "ssnItin",
            label: "SSN / ITIN",
          },
        ],
      },

      {
        key: "personal-military",
        parent: "personal",
        title: "Military Service",
        description:
          "Please tell us whether you are currently serving on active military duty or are a spouse, child, or dependent of someone who is.",
        fields: [
          {
            key: "militaryStatus",
            label: "Military Status",
          },
        ],
      },

      {
        key: "personal-address",
        parent: "personal",
        title: "Location & Address",
        description: "Enter your current residential address.",
        fields: [
          {
            key: "address",
            label: "Address",
          },
          {
            key: "street",
            label: "Street",
            optional: true,
          },
          {
            key: "city",
            label: "City",
          },
          {
            key: "state",
            label: "State",
          },
          {
            key: "zipCode",
            label: "ZIP Code",
          },
        ],
      },

      {
        key: "personal-mobile-verification",
        parent: "personal",
        title: "Mobile Verification",
        description: "Enter the verification code sent to your mobile number.",
        fields: [
          {
            key: "mobileVerificationCode",
            label: "Mobile Verification Code",
          },
        ],
      },
    ];

 const titleLoanSteps = [
  {
    key: "vehicle",
    parent: "vehicle",
    applicationStep: 1,
    title: "Vehicle Information",
    description:
      "Tell us about the vehicle you want to use for your Title Loan.",
    fields: [
      {
        key: "vehicleType",
        label: "Vehicle Type",
      },
      {
        key: "year",
        label: "Year",
      },
      {
        key: "make",
        label: "Make",
      },
      {
        key: "model",
        label: "Model",
      },
      {
        key: "trim",
        label: "Trim Level",
        optional: true,
      },
      {
        key: "vin",
        label: "VIN",
      },
      {
        key: "mileage",
        label: "Mileage",
      },
      {
        key: "condition",
        label: "Vehicle Condition",
      },
      {
        key: "color",
        label: "Vehicle Color",
        optional: true,
      },
      {
        key: "titleStatus",
        label: "Title Status",
      },
      {
        key: "existingLien",
        label: "Existing Lien",
      },
      {
        key: "lienAmount",
        label: "Lien Amount",
        optional: true,
      },
    ],
  },

  {
    key: "vehicle-estimate",
    parent: "vehicle-estimate",
    applicationStep: 2,
    title: "How much are you looking for?",
    description: "Choose the amount you are looking for based on your vehicle estimate.",
    fields: [
      {
        key: "amountRequested",
        label: "Desired Loan Amount",
      },
    ],
  },

  {
    key: "vehicle-photos",
    parent: "vehicle-photos",
    applicationStep: 3,
    title: "Vehicle Photos",
    description: "Upload the required photos of your vehicle.",
    fields: [
      {
        key: "vehiclePhotos",
        label: "Vehicle Photos",
      },
    ],
  },
];

 const personalLoanSteps = [
  {
    key: "financial",
    parent: "financial",
    title: "Financial Information",
    description:
      "Tell us about your current housing and monthly expenses.",
    fields: [
      {
        key: "housingStatus",
        label: "Housing Status",
      },
      {
        key: "monthlyHousingPayment",
        label: "Monthly Housing Payment",
        optional: true,
      },
    ],
  },
];

const employmentStep = {
  key: "employment",
  parent: "financial",
  applicationStep: 3,
  title: "Employment & Income",
  description: "Tell us about your employment and income.",
  fields: [
    {
      key: "employmentStatus",
      label: "Employment Status",
    },
    {
      key: "employerName",
      label: "Employer Name",
    },
    {
      key: "incomeAmount",
      label: "Income Amount",
    },
    {
      key: "incomeFrequency",
      label: "Income Frequency",
    },
  ],
};

const loanStep = {
  key: "loan",
  parent: "loan",
  title: "Loan Information",
  description:
    "Tell us how much you need and what you plan to use the funds for.",
  fields: [
    {
      key: "amountRequested",
      label: "Amount Requested",
    },
    {
      key: "reasonForFunds",
      label: "Reason for Funds",
    },
  ],
};

/* ==============================================================
   TITLE LOAN
   Application:
   1. Vehicle Information
   2. Loan Estimate
   3. Vehicle Photos
   4. Employment & Income
   5. Loan Information
============================================================== */

if (loanType === "title-loan") {
  return [
    ...commonSteps,
    ...titleLoanSteps,

    {
      ...employmentStep,
      applicationStep: 4,
    },

    {
      ...loanStep,
      applicationStep: 5,
    },
  ];
}
/* ==============================================================
   PERSONAL LOAN
   Application:
   1. Employment & Income
   2. Financial Information
   3. Loan Information
============================================================== */

return [
  ...commonSteps,

  {
    ...employmentStep,
    applicationStep: 1,
  },

  {
    ...personalLoanSteps[0],
    applicationStep: 2,
  },

  {
    ...loanStep,
    applicationStep: 3,
  },
];
  }, [loanType]);

  const reviewStep = useMemo(
    () => ({
      title: t("steps.submit.title"),

      description: t("steps.submit.description"),
    }),
    [t],
  );

  const currentStep = STEPS[step];

  const estimatedVehicleValue = useMemo(
    () =>
      loanType === "title-loan"
        ? calculateVehicleEstimate({
            year: form.year,
            make: form.make,
            model: form.model,
            trim: form.trim,
            vehicleType: form.vehicleType,
            mileage: form.mileage,
            condition: form.condition,
            titleStatus: form.titleStatus,
          })
        : 0,
    [
      loanType,
      form.year,
      form.make,
      form.model,
      form.trim,
      form.vehicleType,
      form.mileage,
      form.condition,
      form.titleStatus,
    ],
  );

  const minimumLoanAmount = estimatedVehicleValue
    ? Math.ceil((estimatedVehicleValue * 0.6) / 100) * 100
    : 0;
  const maximumLoanAmount = estimatedVehicleValue
    ? Math.floor((estimatedVehicleValue * 0.8) / 100) * 100
    : 0;
  const selectedLoanAmount = Number(
    String(form.amountRequested || "").replace(/[$,\s]/g, ""),
  );
  const safeSelectedLoanAmount =
    minimumLoanAmount > 0 && maximumLoanAmount >= minimumLoanAmount
      ? Math.min(
          maximumLoanAmount,
          Math.max(minimumLoanAmount, selectedLoanAmount || minimumLoanAmount),
        )
      : 0;


  /* ==============================================================
     UPDATE FORM
  ============================================================== */

  const update = (key, value) => {
    let nextValue = value;

    /*
     * Phone
     */
    if (key === "phone") {
      nextValue = formatUSPhone(value);
    }

    /*
     * SSN
     */
    if (key === "ssnItin") {
      nextValue = formatSSN(value);
    }

    /*
     * VIN
     */
    if (key === "vin") {
      nextValue = normalizeVIN(value);
    }

    /*
     * State / County (supports 2-letter codes or full region/county names e.g. CA, Greater London)
     */
    if (key === "state") {
      nextValue = String(value || "")
        .replace(/[^A-Za-zÀ-ÿ0-9' ._-]/g, "")
        .slice(0, 50);
    }

    /*
     * ZIP / Postal Code (supports UK postcodes like SW1A 1AA, US ZIPs 90210, and international codes)
     */
    if (key === "zipCode") {
      nextValue = String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, "")
        .slice(0, 12);
    }

    /*
     * DOB fields
     */
    if (key === "dateOfBirthDay") {
      nextValue = onlyDigits(value).slice(0, 2);
    }

    if (key === "dateOfBirthMonth") {
      nextValue = onlyDigits(value).slice(0, 2);
    }

    if (key === "dateOfBirthYear") {
      nextValue = onlyDigits(value).slice(0, 4);
    }

    /*
     * Verification codes
     */
    if (key === "gmailVerificationCode" || key === "mobileVerificationCode") {
      nextValue = onlyDigits(value).slice(0, 8);
    }

    setForm((previous) => ({
      ...previous,
      [key]: nextValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: "",
    }));

    if (key === "make" || key === "year") {
      setVehicleError("");
    }
  };

  /* ==============================================================
     LOAD MAKES
  ============================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadMakes = async () => {
      setVehicleLoading((previous) => ({
        ...previous,
        makes: true,
      }));

      setVehicleError("");

      try {
        const makes = await getVehicleMakes();

        if (cancelled) return;

        setVehicleMakes(makes);
      } catch (error) {
        if (cancelled) return;

        console.error("Vehicle makes loading error:", error);

        setVehicleError(error?.message || "Unable to load vehicle makes.");
      } finally {
        if (!cancelled) {
          setVehicleLoading((previous) => ({
            ...previous,
            makes: false,
          }));
        }
      }
    };

    loadMakes();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==============================================================
     LOAD MODELS
  ============================================================== */

  useEffect(() => {
    if (currentStep?.key !== "vehicle" || !form.year || !form.make) {
      setVehicleModels([]);
      return;
    }

    let cancelled = false;

    const loadModels = async () => {
      setVehicleLoading((previous) => ({
        ...previous,
        models: true,
      }));

      setVehicleError("");

      try {
        const models = await getVehicleModels({
          year: form.year,
          make: form.make,
        });

        if (cancelled) return;

        setVehicleModels(models);
      } catch (error) {
        if (cancelled) return;

        console.error("Vehicle models loading error:", error);

        setVehicleModels([]);

        setVehicleError(error?.message || "Unable to load vehicle models.");
      } finally {
        if (!cancelled) {
          setVehicleLoading((previous) => ({
            ...previous,
            models: false,
          }));
        }
      }
    };

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [currentStep?.key, step, form.year, form.make]);

  /* ==============================================================
     VALIDATION
  ============================================================== */

  const validateStep = () => {
    const newErrors = {};

    if (!currentStep) {
      return true;
    }

    /* ============================================================
       REQUIRED FIELDS
    ============================================================ */

    currentStep.fields.forEach(({ key, optional }) => {
      if (optional) return;

      const value = String(form[key] || "").trim();

      if (!value) {
        newErrors[key] = "This field is required.";
      }
    });

    /* ============================================================
       PERSONAL BASIC
    ============================================================ */

    if (currentStep.key === "personal-basic") {
      const firstName = form.firstName.trim();

      const middleName = form.middleName.trim();

      const lastName = form.lastName.trim();

      /*
       * First name
       */
      if (firstName && !NAME_REGEX.test(firstName)) {
        newErrors.firstName = "Enter a valid first name.";
      }

      /*
       * Middle name
       */
      if (middleName && !NAME_REGEX.test(middleName)) {
        newErrors.middleName = "Enter a valid middle name.";
      }

      /*
       * Last name
       */
      if (lastName && !NAME_REGEX.test(lastName)) {
        newErrors.lastName = "Enter a valid last name.";
      }

      /*
       * Email
       */
      if (form.email && !EMAIL_REGEX.test(form.email.trim())) {
        newErrors.email = "Enter a valid email address.";
      }

      /*
       * Phone
       */
      const phone = normalizePhone(form.phone);

      if (form.phone && !US_PHONE_REGEX.test(phone)) {
        newErrors.phone = "Enter a valid US phone number.";
      }
    }

    /* ============================================================
       DOB
    ============================================================ */

    if (currentStep.key === "personal-dob") {
      const dobError = validateDOB(
        form.dateOfBirthDay,
        form.dateOfBirthMonth,
        form.dateOfBirthYear,
      );

      if (dobError) {
        newErrors.dateOfBirthDay = dobError;
      }
    }

    /* ============================================================
       EMAIL VERIFICATION
    ============================================================ */

    if (currentStep.key === "personal-email-verification") {
      if (!VERIFICATION_CODE_REGEX.test(form.gmailVerificationCode)) {
        newErrors.gmailVerificationCode = "Enter the valid verification code.";
      }
    }

    /* ============================================================
       SSN / ITIN
    ============================================================ */

    if (currentStep.key === "personal-ssn") {
      const ssn = form.ssnItin.replace(/\D/g, "");

      if (!/^\d{9}$/.test(ssn)) {
        newErrors.ssnItin = "SSN / ITIN must contain exactly 9 digits.";
      } else if (!SSN_REGEX.test(form.ssnItin)) {
        newErrors.ssnItin = "Enter a valid SSN / ITIN.";
      }
    }

    /* ============================================================
       ADDRESS
    ============================================================ */

    if (currentStep.key === "personal-address") {
      /*
       * City
       */
      if (form.city && !/^[A-Za-zÀ-ÿ0-9' .-]+$/.test(form.city.trim())) {
        newErrors.city = "Enter a valid city or town name.";
      }

      /*
       * State - enforce US 2-letter codes only
       */
      if (form.state && !US_STATE_CODES.includes(form.state.toUpperCase())) {
        newErrors.state = "Enter a valid 2-letter US state code.";
      }

      /*
       * ZIP Code - supports only US ZIPs (12345 or 12345-6789)
       */
      const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;
      if (form.zipCode && !ZIP_REGEX.test(form.zipCode.trim())) {
        newErrors.zipCode = "Enter a valid US ZIP code.";
      }
    }

    /* ============================================================
       MOBILE VERIFICATION
    ============================================================ */

    if (currentStep.key === "personal-mobile-verification") {
      if (!VERIFICATION_CODE_REGEX.test(form.mobileVerificationCode)) {
        newErrors.mobileVerificationCode = "Enter the valid verification code.";
      }
    }

    /* ============================================================
       VEHICLE
    ============================================================ */

    if (currentStep.key === "vehicle") {
      if (!form.vehicleType) {
        newErrors.vehicleType = "Select the vehicle type.";
      }

      if (!form.year) {
        newErrors.year = "Please select a vehicle year.";
      }

      if (!form.make) {
        newErrors.make = "Please select a vehicle make.";
      }

      if (!form.model) {
        newErrors.model = "Please select a vehicle model.";
      }

      if (form.mileage === "") {
        newErrors.mileage = "Enter the vehicle mileage.";
      } else {
        const mileage = Number(form.mileage);

        if (!Number.isInteger(mileage) || mileage < 0) {
          newErrors.mileage = "Enter a valid non-negative mileage.";
        }
      }

      if (!form.condition) {
        newErrors.condition = "Select the vehicle condition.";
      }

      if (!form.titleStatus) {
        newErrors.titleStatus = "Select the vehicle title status.";
      }

      if (!form.existingLien) {
        newErrors.existingLien =
          "Select whether the vehicle has an existing lien.";
      }

      if (form.existingLien === "Yes" && form.lienAmount !== "") {
        const lienAmount = Number(form.lienAmount);

        if (!Number.isFinite(lienAmount) || lienAmount < 0) {
          newErrors.lienAmount = "Enter a valid lien amount.";
        }
      }

      const vin = normalizeVIN(form.vin);

      if (!VIN_REGEX.test(vin)) {
        newErrors.vin = "VIN must contain exactly 17 valid characters.";
      }

      if (/[IOQ]/i.test(form.vin)) {
        newErrors.vin = "VIN cannot contain I, O, or Q.";
      }
    }

    if (currentStep.key === "vehicle-estimate") {
      const amount = Number(String(form.amountRequested || "").replace(/[$,\s]/g, ""));

      if (!estimatedVehicleValue) {
        newErrors.amountRequested = "Complete the vehicle details to calculate your estimate.";
      } else if (!Number.isFinite(amount) || amount < minimumLoanAmount || amount > maximumLoanAmount) {
        newErrors.amountRequested = `Choose an amount between $${minimumLoanAmount.toLocaleString()} and $${maximumLoanAmount.toLocaleString()}.`;
      }
    }

    if (currentStep.key === "vehicle-photos") {
      if (!Array.isArray(form.vehiclePhotos) || form.vehiclePhotos.length < 4) {
        newErrors.vehiclePhotos = "Please upload at least 4 vehicle photos.";
      }

      const invalidFile = (form.vehiclePhotos || []).find(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      );

      if (invalidFile) {
        newErrors.vehiclePhotos = "Only JPG, PNG, and WebP images are allowed.";
      }

      const tooLarge = (form.vehiclePhotos || []).find(
        (file) => file.size > 5 * 1024 * 1024,
      );

      if (tooLarge) {
        newErrors.vehiclePhotos = "Each vehicle photo must be 5MB or smaller.";
      }
    }
    /* ============================================================
       LOAN
    ============================================================ */

    if (currentStep.key === "loan") {
      const amount = Number(
        String(form.amountRequested).replace(/[$,\s]/g, ""),
      );

      if (!Number.isFinite(amount) || amount <= 0) {
        newErrors.amountRequested = "Enter a valid loan amount.";
      }

      if (amount > 10000000) {
        newErrors.amountRequested = "Enter a valid loan amount.";
      }

      if (loanType === "title-loan") {
        if (!estimatedVehicleValue) {
          newErrors.amountRequested =
            "Complete the vehicle details to calculate the estimated value first.";
        } else if (amount < minimumLoanAmount || amount > maximumLoanAmount) {
          newErrors.amountRequested =
            `Choose an amount between $${minimumLoanAmount.toLocaleString()} and $${maximumLoanAmount.toLocaleString()} (60%–80% of the estimated vehicle value).`;
        }
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ==============================================================
     NEXT
  ============================================================== */

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep?.key === "vehicle" && loanType === "title-loan" && !form.amountRequested && minimumLoanAmount > 0) {
      setForm((previous) => ({ ...previous, amountRequested: String(minimumLoanAmount) }));
    }

    setStep((previous) => Math.min(previous + 1, STEPS.length));
  };

  /* ==============================================================
     BACK
  ============================================================== */

  const handleBack = () => {
    setErrors({});
    setVehicleError("");

    setStep((previous) => Math.max(previous - 1, 0));
  };

  /* ==============================================================
     SUBMIT
  ============================================================== */

  const handleSubmit = async () => {
    /*
     * Validate every step before submitting.
     *
     * This prevents someone from jumping to
     * the review screen and submitting
     * incomplete/invalid information.
     */

    const originalStep = step;

    let allValid = true;

    for (let index = 0; index < STEPS.length; index++) {
      setStep(index);

      const stepData = STEPS[index];

      const previousCurrentStep = currentStep;

      /*
       * Validate directly against the
       * step's fields.
       */
      const tempErrors = {};

      stepData.fields.forEach(({ key, optional }) => {
        if (optional) return;

        if (!String(form[key] || "").trim()) {
          tempErrors[key] = "This field is required.";
        }
      });

      if (Object.keys(tempErrors).length) {
        allValid = false;

        setErrors(tempErrors);

        break;
      }
    }

    setStep(originalStep);

    if (!allValid) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      /*
       * IMPORTANT:
       *
       * Do NOT console.log(form).
       *
       * The object contains SSN / ITIN.
       */

     const payload = {
  ...form,

  // IMPORTANT:
  // Always send the loan type selected from the URL.
  loanType,

  // Separate fixed vehicle estimate from the requested loan amount.
  estimatedValue: estimatedVehicleValue,

  phone: normalizePhone(form.phone),

  ssnItin: form.ssnItin.replace(/\D/g, ""),

  vin: normalizeVIN(form.vin),

  state: form.state.toUpperCase(),

  zipCode: form.zipCode.trim(),

  amountRequested: Number(
    String(form.amountRequested).replace(/[$,\s]/g, ""),
  ),
};

      const response = await submitLoanApplication(payload);

      if (response?.data?.loan) {
        setSubmittedLoan(response.data.loan);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Application submission error:", error);

      setSubmitError(error?.message || t("error.somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==============================================================
     RESET
  ============================================================== */

  const resetApplication = () => {
    setForm(INITIAL_FORM);

    setStep(0);

    setErrors({});

    setSubmitError("");

    setIsSubmitted(false);

    setSubmittedLoan(null);

    setVehicleModels([]);

    setVehicleError("");
  };

  /* ==============================================================
     AUTH GATE
  ============================================================== */

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
        <div className="container-x mx-auto max-w-xl">
          <div className="glass rounded-[34px] p-8 text-center shadow-xl md:p-12">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)]">
              <Lock size={32} />
            </div>

            <h1 className="h3 text-[var(--ink)]">Sign In Required to Apply</h1>

            <p className="mt-3 text-sm leading-6 text-black/60">
              To apply for an auto title loan, please sign in to your Title Bros
              account or create a new one.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="btn-primary flex flex-1 items-center justify-center gap-2"
              >
                <LogIn size={16} />
                Sign In to Account
              </button>

              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--white)] py-3.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--paper)]"
              >
                <UserPlus size={16} className="text-[var(--green)]" />
                Create New Account
              </button>
            </div>

            <div className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
              Title Bros Staff?{" "}
              <Link
                href={`/${locale}/admin/login`}
                className="font-bold text-[var(--green)] hover:underline"
              >
                Staff Operations Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ==============================================================
     MAIN
  ============================================================== */

  return (
    <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          {/* ======================================================
              LEFT
          ====================================================== */}

          <Reveal>
            <div className="eyebrow text-[#101512]">{t("eyebrow")}</div>

            <h1 className="h2 mt-6 text-[#101512]">{t("title")}</h1>

            <p className="mt-7 max-w-md leading-7 text-black/50">
              {t("description")}
            </p>

            <Steps
  step={step}
  currentStepKey={currentStep?.key}
  steps={STEPS}
  isSubmitted={isSubmitted}
/>
          </Reveal>

          {/* ======================================================
              RIGHT
          ====================================================== */}

          <Reveal delay={0.08}>
            <div className="glass rounded-[34px] p-6 md:p-10">
              {/* ==================================================
                  STEP COUNTER
              ================================================== */}

              {!isSubmitted && (
  <div className="text-xs font-black uppercase tracking-[.16em] text-[var(--ink)]/35">
    {(() => {
      const personalSteps = STEPS.filter(
        (item) => item.parent === "personal",
      );

      const applicationSteps = STEPS.filter(
        (item) => item.parent !== "personal",
      );

      const personalIndex = personalSteps.findIndex(
        (item) => item.key === currentStep?.key,
      );

      const applicationIndex = applicationSteps.findIndex(
        (item) => item.key === currentStep?.key,
      );

      if (personalIndex >= 0) {
        return `Personal Information — Step ${
          personalIndex + 1
        } of ${personalSteps.length}`;
      }

      if (applicationIndex >= 0) {
        return `Application Step ${
          applicationIndex + 1
        } of ${applicationSteps.length}`;
      }

      return "";
    })()}
  </div>
)}

              {/* ==================================================
                  TITLE
              ================================================== */}

              <h2 className="mt-3 text-3xl font-black tracking-tight">
               {!isSubmitted
    ? step < STEPS.length
      ? currentStep?.title
      : reviewStep.title
    : "Application Submitted"}
              </h2>

              {/* ==================================================
                  NORMAL STEPS
              ================================================== */}

              {!isSubmitted && step < STEPS.length && (
                <div className="mt-8">
                  {/* =================================================
                        DOB
                    ================================================= */}

                  {currentStep?.key === "personal-dob" ? (
                    <div>
                      {/* <p className="mb-6 text-sm leading-6 text-black/50"> */}
                      <p className="mb-6 text-sm font-black leading-6 text-[var(--ink)]/45">
                        {currentStep.description}
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        <Field
                          label="Day"
                          value={form.dateOfBirthDay}
                          onChange={(event) =>
                            update("dateOfBirthDay", event.target.value)
                          }
                          type="number"
                          placeholder="DD"
                          error={errors.dateOfBirthDay}
                          inputClassName="text-center"
                        />

                        <Field
                          label="Month"
                          value={form.dateOfBirthMonth}
                          onChange={(event) =>
                            update("dateOfBirthMonth", event.target.value)
                          }
                          type="number"
                          placeholder="MM"
                          error={errors.dateOfBirthMonth}
                          inputClassName="text-center"
                        />

                        <Field
                          label="Year"
                          value={form.dateOfBirthYear}
                          onChange={(event) =>
                            update("dateOfBirthYear", event.target.value)
                          }
                          type="number"
                          placeholder="YYYY"
                          error={errors.dateOfBirthYear}
                          inputClassName="text-center"
                        />
                      </div>
                    </div>
                  ) : currentStep?.key === "vehicle" ? (
                    /* =================================================
        VEHICLE
     ================================================= */

                    <div>
                      <p className="mb-6 text-sm leading-6">
                        {currentStep.description}
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* VEHICLE TYPE */}
                        <Select
                          label="Vehicle Type"
                          value={form.vehicleType}
                          onChange={(event) =>
                            update("vehicleType", event.target.value)
                          }
                          error={errors.vehicleType}
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Car">Car</option>
                          <option value="Truck">Truck</option>
                          <option value="SUV">SUV</option>
                          <option value="Van">Van</option>
                          <option value="Motorcycle">Motorcycle</option>
                          <option value="Other">Other</option>
                        </Select>

                        {/* YEAR */}
                        <CustomSelect
                          label="Year"
                          value={form.year}
                          options={VEHICLE_YEARS}
                          placeholder="Select year"
                          error={errors.year}
                          onChange={(value) => {
                            update("year", value);
                            update("make", "");
                            update("model", "");
                            setVehicleModels([]);
                          }}
                        />

                        {/* MAKE */}
                        <VehicleSelect
                          label="Make"
                          value={form.make}
                          options={vehicleMakes}
                          loading={vehicleLoading.makes}
                          disabled={!form.year}
                          placeholder={
                            form.year ? "Select make" : "Select year first"
                          }
                          error={errors.make}
                          onChange={(value) => {
                            update("make", value);
                            update("model", "");
                            setVehicleModels([]);
                          }}
                        />

                        {/* MODEL */}
                        <VehicleSelect
                          label="Model"
                          value={form.model}
                          options={vehicleModels}
                          loading={vehicleLoading.models}
                          disabled={!form.year || !form.make}
                          placeholder={
                            !form.year
                              ? "Select year first"
                              : !form.make
                                ? "Select make first"
                                : "Select model"
                          }
                          error={errors.model}
                          onChange={(value) => update("model", value)}
                        />

                        {/* TRIM */}
                        <Field
                          label="Trim Level"
                          value={form.trim}
                          onChange={(event) =>
                            update("trim", event.target.value)
                          }
                          placeholder="Enter trim level"
                          error={errors.trim}
                        />

                        {/* MILEAGE */}
                        <Field
                          label="Mileage"
                          value={form.mileage}
                          onChange={(event) =>
                            update("mileage", event.target.value)
                          }
                          type="number"
                          placeholder="Enter mileage"
                          error={errors.mileage}
                        />

                        {/* CONDITION */}
                        <Select
                          label="Vehicle Condition"
                          value={form.condition}
                          onChange={(event) =>
                            update("condition", event.target.value)
                          }
                          error={errors.condition}
                        >
                          <option value="">Select condition</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </Select>

                        {/* COLOR */}
                        <Field
                          label="Vehicle Color"
                          value={form.color}
                          onChange={(event) =>
                            update("color", event.target.value)
                          }
                          placeholder="Enter vehicle color"
                          error={errors.color}
                        />

                        {/* TITLE STATUS */}
                        <Select
                          label="Title Status"
                          value={form.titleStatus}
                          onChange={(event) =>
                            update("titleStatus", event.target.value)
                          }
                          error={errors.titleStatus}
                        >
                          <option value="">Select title status</option>
                          <option value="Clean">Clean</option>
                          <option value="Salvage">Salvage</option>
                          <option value="Rebuilt">Rebuilt</option>
                        </Select>

                        {/* EXISTING LIEN */}
                        <Select
                          label="Existing Lien"
                          value={form.existingLien}
                          onChange={(event) =>
                            update("existingLien", event.target.value)
                          }
                          error={errors.existingLien}
                        >
                          <option value="">Select option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Select>

                        {/* LIEN AMOUNT */}
                        {form.existingLien === "Yes" && (
                          <Field
                            label="Lien Amount"
                            value={form.lienAmount}
                            onChange={(event) =>
                              update("lienAmount", event.target.value)
                            }
                            type="number"
                            placeholder="Enter lien amount"
                            error={errors.lienAmount}
                            prefix="$"
                          />
                        )}

                        {/* VIN */}
                        <div className="sm:col-span-2 space-y-2">
                          <label className="text-[13px] font-bold text-[#101512]">
                            VIN
                          </label>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={form.vin}
                              maxLength={17}
                              onChange={async (event) => {
                                const val = event.target.value
                                  .toUpperCase()
                                  .replace(/[IOQ\s]/g, "")
                                  .slice(0, 17);

                                update("vin", val);

                                if (
                                  val.length === 17 &&
                                  !vehicleLoading.decoding
                                ) {
                                  setVehicleLoading((p) => ({
                                    ...p,
                                    decoding: true,
                                  }));

                                  setVehicleError("");

                                  try {
                                    const { decodeVin } =
                                      await import("@/services/vehicleService");

                                    const data = await decodeVin(val);

                                    if (data?.Results) {
                                      const year = data.Results.find(
                                        (r) => r.Variable === "Model Year",
                                      )?.Value;

                                      const make = data.Results.find(
                                        (r) => r.Variable === "Make",
                                      )?.Value;

                                      const model = data.Results.find(
                                        (r) => r.Variable === "Model",
                                      )?.Value;

                                      const errorCode = data.Results.find(
                                        (r) => r.Variable === "Error Code",
                                      )?.Value;

                                      if (!make || !model) {
                                        setVehicleError(
                                          `Invalid VIN: ${
                                            errorCode ||
                                            "Vehicle details not found."
                                          }`,
                                        );
                                      } else {
                                        if (year) update("year", year);
                                        if (make) update("make", make);
                                        if (model) update("model", model);
                                      }
                                    }
                                  } catch (err) {
                                    setVehicleError(
                                      "Failed to decode VIN. Please enter vehicle details manually.",
                                    );
                                  } finally {
                                    setVehicleLoading((p) => ({
                                      ...p,
                                      decoding: false,
                                    }));
                                  }
                                }
                              }}
                              placeholder="Enter 17-character VIN"
                              className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm outline-none focus:border-[#087a45]"
                            />

                            <button
                              type="button"
                              disabled={
                                form.vin.length !== 17 ||
                                vehicleLoading.decoding
                              }
                              onClick={async () => {
                                if (form.vin.length !== 17) return;

                                setVehicleLoading((p) => ({
                                  ...p,
                                  decoding: true,
                                }));

                                setVehicleError("");

                                try {
                                  const { decodeVin } =
                                    await import("@/services/vehicleService");

                                  const data = await decodeVin(form.vin);

                                  if (data?.Results) {
                                    const year = data.Results.find(
                                      (r) => r.Variable === "Model Year",
                                    )?.Value;

                                    const make = data.Results.find(
                                      (r) => r.Variable === "Make",
                                    )?.Value;

                                    const model = data.Results.find(
                                      (r) => r.Variable === "Model",
                                    )?.Value;

                                    if (!make || !model) {
                                      setVehicleError(
                                        "Vehicle details could not be found for this VIN.",
                                      );
                                    } else {
                                      if (year) update("year", year);
                                      if (make) update("make", make);
                                      if (model) update("model", model);
                                    }
                                  }
                                } catch {
                                  setVehicleError(
                                    "Failed to decode VIN. Please enter vehicle details manually.",
                                  );
                                } finally {
                                  setVehicleLoading((p) => ({
                                    ...p,
                                    decoding: false,
                                  }));
                                }
                              }}
                              className="h-14 shrink-0 rounded-2xl bg-[#087a45] px-6 text-sm font-bold text-white transition hover:bg-[#066b3c] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {vehicleLoading.decoding
                                ? "Decoding..."
                                : "Decode"}
                            </button>
                          </div>

                          {errors.vin && (
                            <p className="mt-1.5 text-xs font-medium text-red-500">
                              {errors.vin}
                            </p>
                          )}

                          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.04em] text-black/50">
                            VIN must contain 17 characters and cannot contain I,
                            O or Q.
                          </p>

                          {vehicleError && (
                            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs leading-5 text-red-600">
                              {vehicleError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : currentStep?.key === "vehicle-estimate" ? (
                    <div>
                      <p className="mb-6 text-sm leading-6 text-black/50">
                        Choose an amount that works for what you have in mind.
                      </p>

                      {!estimatedVehicleValue ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          Complete your vehicle details first to calculate an estimate.
                        </div>
                      ) : (
                        <div className="space-y-7">
                          <div>
                            <label className="mb-2 block text-[11px] font-black uppercase tracking-[.14em] text-black/45">
                              Desired Loan Amount
                            </label>
                            <div className="flex h-[54px] items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 focus-within:border-[#087a45]">
                              <span className="text-sm text-black/55">$</span>
                              <input
                                type="number"
                                min={minimumLoanAmount}
                                max={maximumLoanAmount}
                                step={100}
                                value={form.amountRequested || String(minimumLoanAmount)}
                                onChange={(event) => {
                                  const raw = event.target.value;
                                  if (raw === "") {
                                    update("amountRequested", "");
                                    return;
                                  }
                                  const amount = Number(raw);
                                  update(
                                    "amountRequested",
                                    String(Math.min(maximumLoanAmount, Math.max(minimumLoanAmount, Number.isFinite(amount) ? amount : minimumLoanAmount))),
                                  );
                                }}
                                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                                aria-label="Desired loan amount"
                              />
                            </div>
                            {errors.amountRequested && (
                              <p className="mt-2 text-xs font-medium text-red-500">{errors.amountRequested}</p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              {[0, 0.25, 0.5, 0.75, 1]
                                .map((ratio) => Math.round((minimumLoanAmount + (maximumLoanAmount - minimumLoanAmount) * ratio) / 100) * 100)
                                .filter((amount, index, values) => values.indexOf(amount) === index)
                                .map((amount) => {
                                  const selected = Number(form.amountRequested || minimumLoanAmount) === amount;
                                  return (
                                    <button
                                      key={amount}
                                      type="button"
                                      onClick={() => update("amountRequested", String(amount))}
                                      className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selected ? "border-[#087a45] bg-[#087a45] text-white" : "border-black/20 bg-white text-[#101512] hover:border-[#087a45]"}`}
                                    >
                                      ${amount.toLocaleString("en-US")}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>

                          <div className="rounded-[24px] bg-[#f6f7f5] p-5 sm:p-6">
                            <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_0.8fr] sm:items-center">
                              <div>
                                <p className="text-[12px] font-black uppercase tracking-[.16em] text-black/40">Potential Range</p>
                                <p className="mt-2 text-2xl font-black tracking-tight text-[#101512] sm:text-[30px]">
                                  ${minimumLoanAmount.toLocaleString("en-US")} – ${maximumLoanAmount.toLocaleString("en-US")}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-wide text-black/35">Your Requested Amount</p>
                                <p className="mt-2 text-[20px] font-black text-[#087a45]">
                                  ${Number(form.amountRequested || minimumLoanAmount).toLocaleString("en-US")}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-wide text-black/35">Vehicle Estimate</p>
                                <p className="mt-2 text-[16px] font-black text-[#087a45]">
                                  ${estimatedVehicleValue.toLocaleString("en-US")}
                                </p>
                              </div>
                            </div>

                            <input
                              aria-label="Adjust desired loan amount"
                              type="range"
                              min={minimumLoanAmount}
                              max={maximumLoanAmount}
                              step={100}
                              value={Math.min(maximumLoanAmount, Math.max(minimumLoanAmount, Number(form.amountRequested || minimumLoanAmount)))}
                              onChange={(event) => update("amountRequested", event.target.value)}
                              className="mt-6 w-full cursor-pointer accent-[#087a45]"
                            />
                            {/* <div className="mt-1 flex justify-between text-[10px] font-semibold text-black/40">
                              <span>60% · ${minimumLoanAmount.toLocaleString("en-US")}</span>
                              <span>80% · ${maximumLoanAmount.toLocaleString("en-US")}</span>
                            </div> */}
                            <p className="mt-4 text-[12px] leading-5 text-black/40">
                              This range is an educational estimate, not a loan offer, quote, or commitment. The vehicle estimate stays fixed while you adjust the requested amount.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : currentStep?.key === "vehicle-photos" ? (
                    /* =================================================
        VEHICLE PHOTOS
     ================================================= */

                    <div>
                      <p className="mb-6 text-sm leading-6">
                        {currentStep.description}
                      </p>

                      <div className="rounded-3xl border border-black/10 bg-white p-5">
                        <label className="mb-3 block text-sm font-bold text-[#101512]">
                          Vehicle Photos
                        </label>

                        <p className="mb-4 text-xs leading-5 text-black/55">
                          Upload at least 4 clear photos of your vehicle.
                        </p>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={(event) => {
                            const files = Array.from(event.target.files || []);

                            update("vehiclePhotos", files);
                          }}
                          className="block w-full rounded-2xl border border-dashed border-black/20 bg-[#fafbf9] p-4 text-sm"
                        />

                        {form.vehiclePhotos?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-[#087a45]">
                              {form.vehiclePhotos.length} photo
                              {form.vehiclePhotos.length !== 1 ? "s" : ""}{" "}
                              selected
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {form.vehiclePhotos.map((file, index) => (
                                <div
                                  key={`${file.name}-${index}`}
                                  className="rounded-xl bg-[#f5f6f3] px-3 py-2 text-xs"
                                >
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {errors.vehiclePhotos && (
                          <p className="mt-2 text-xs font-medium text-red-500">
                            {errors.vehiclePhotos}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : currentStep?.key === "loan" ? (
                    /* =================================================
                          LOAN
                      ================================================= */

                    <div>
                      <p className="mb-6 text-sm leading-6">
                        {currentStep.description}
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                          <Field
                            label={t("steps.loan.fields.amountRequested")}
                            value={form.amountRequested}
                            onChange={(event) => {
                              const raw = event.target.value;
                              if (loanType !== "title-loan" || !estimatedVehicleValue || raw === "") {
                                update("amountRequested", raw);
                                return;
                              }
                              const amount = Number(raw);
                              update("amountRequested", String(Math.min(maximumLoanAmount, Math.max(minimumLoanAmount, Number.isFinite(amount) ? amount : minimumLoanAmount))));
                            }}
                            type="number"
                            placeholder="Enter amount requested"
                            error={errors.amountRequested}
                            prefix="$"
                          />

                        </div>

                        <Select
                          label={t("steps.loan.fields.reasonForFunds")}
                          value={form.reasonForFunds}
                          onChange={(event) =>
                            update("reasonForFunds", event.target.value)
                          }
                          error={errors.reasonForFunds}
                        >
                          <option value="">Select reason</option>

                          <option value="Personal">Personal</option>

                          <option value="Debt Consolidation">
                            Debt Consolidation
                          </option>

                          <option value="Business">Business</option>

                          <option value="Emergency">Emergency</option>

                          <option value="Other">Other</option>
                        </Select>

                        <Select
                          label={t("steps.loan.fields.employmentStatus")}
                          value={form.employmentStatus}
                          onChange={(event) =>
                            update("employmentStatus", event.target.value)
                          }
                          error={errors.employmentStatus}
                        >
                          <option value="">Select employment status</option>

                          <option value="Employed">Employed</option>

                          <option value="Self Employed">Self Employed</option>

                          <option value="Unemployed">Unemployed</option>

                          <option value="Retired">Retired</option>

                          <option value="Student">Student</option>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    /* =================================================
                          PERSONAL FIELDS
                      ================================================= */

                    <div className="grid gap-4 sm:grid-cols-2">
                      {currentStep?.fields.map(
                        ({ key, label, type = "text", optional }) => {
                          const isVerification =
                            key === "gmailVerificationCode" ||
                            key === "mobileVerificationCode";

                          const isSSN = key === "ssnItin";

                          const isPhone = key === "phone";

                          const isAddress = key === "address";

                          const fullWidth =
                            isVerification || isSSN || isAddress;

                          let icon = null;

                          if (isVerification) {
                            icon = <Mail size={17} />;
                          }

                          if (isSSN) {
                            icon = <ShieldCheck size={17} />;
                          }

                          if (isAddress) {
                            icon = <MapPin size={17} />;
                          }

                          if (isAddress) {
                            return (
                              <AddressAutocomplete
                                key={key}
                                label={label}
                                value={form.address}
                                onChange={(val) => update("address", val)}
                                onSelectAddress={({
                                  address,
                                  street,
                                  city,
                                  state,
                                  zipCode,
                                }) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    address: address || prev.address,
                                    street: street || prev.street,
                                    city: city || prev.city,
                                    state: state || prev.state,
                                    zipCode: zipCode || prev.zipCode,
                                  }));
                                  setErrors((prev) => {
                                    const clean = { ...prev };
                                    delete clean.address;
                                    delete clean.street;
                                    delete clean.city;
                                    delete clean.state;
                                    delete clean.zipCode;
                                    return clean;
                                  });
                                }}
                                error={errors.address}
                                className="sm:col-span-2"
                              />
                            );
                          }

                          return (
                            <Field
                              key={key}
                              label={label}
                              value={form[key]}
                              onChange={(event) =>
                                update(key, event.target.value)
                              }
                              type={isSSN ? "text" : type}
                              optional={optional}
                              icon={icon}
                              error={errors[key]}
                              className={
                                fullWidth ? "sm:col-span-2" : "sm:col-span-1"
                              }
                              placeholder={
                                isVerification
                                  ? "Enter verification code"
                                  : isSSN
                                    ? "Enter SSN / ITIN"
                                    : isPhone
                                      ? "(555) 555-5555"
                                      : `Enter ${label.toLowerCase()}`
                              }
                            />
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* =================================================
                        EMAIL MESSAGE
                    ================================================= */}

                  {currentStep?.key === "personal-email-verification" && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef7df] p-4 text-xs text-[#087a45]">
                      <Mail size={18} className="mt-0.5 shrink-0" />

                      <p>
                        We sent a verification code to{" "}
                        <strong>{form.email || "your email address"}</strong>.
                      </p>
                    </div>
                  )}

                  {/* =================================================
                        MOBILE MESSAGE
                    ================================================= */}

                  {currentStep?.key === "personal-mobile-verification" && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef7df] p-4 text-xs text-[#087a45]">
                      <Smartphone size={18} className="mt-0.5 shrink-0" />

                      <p>
                        We sent a verification code to{" "}
                        <strong>{form.phone || "your mobile number"}</strong>.
                      </p>
                    </div>
                  )}

                  {/* =================================================
                        SSN MESSAGE
                    ================================================= */}

                  {currentStep?.key === "personal-ssn" && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f5f7f3] p-4 text-xs leading-5 text-black/50">
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#087a45]"
                      />

                      <p>
                        Your SSN / ITIN is sensitive information. Keep it secure
                        and only send it through your encrypted application
                        flow.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================
                  REVIEW
              ====================================================== */}

              {!isSubmitted && step === STEPS.length && (
                <div className="mt-8">
                  <div className="rounded-[26px] bg-[#eef7df] p-7">
                    <div className="flex">
                      <CheckCircle2 className="text-[#087a45]" size={34} />

                      <h3 className="ml-2 text-2xl font-black text-[#101512]">
                        {t("ready.title")}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-black/55">
                      {t("ready.description")}
                    </p>
                  </div>

                  {/* PERSONAL */}

                  <ReviewCard
                    icon={<User size={17} />}
                    title="Personal Information"
                    onEdit={() =>
  setStep(
    STEPS.findIndex(
      (item) => item.key === "personal-basic",
    ),
  )
}
                  >
                    <ReviewItem
                      label="Full Name"
                      value={`${form.firstName} ${
                        form.middleName ? `${form.middleName} ` : ""
                      }${form.lastName}`}
                    />

                    <ReviewItem
                      label="Date of Birth"
                      value={
                        form.dateOfBirthDay &&
                        form.dateOfBirthMonth &&
                        form.dateOfBirthYear
                          ? `${form.dateOfBirthMonth}/${form.dateOfBirthDay}/${form.dateOfBirthYear}`
                          : "—"
                      }
                    />

                    <ReviewItem label="Phone" value={form.phone} />

                    <ReviewItem label="Email" value={form.email} />

                    <ReviewItem label="Address" value={form.address} />

                    <ReviewItem
                      label="City / State"
                      value={`${form.city || "—"}, ${form.state || "—"}`}
                    />

                    <ReviewItem label="ZIP" value={form.zipCode} />

                    <ReviewItem label="SSN / ITIN" value="•••••••••" />
                  </ReviewCard>

                  {/* VEHICLE */}

                  <ReviewCard
                    icon={<Car size={17} />}
                    title="Vehicle Information"
                    onEdit={() =>
  setStep(
    STEPS.findIndex(
      (item) => item.key === "vehicle",
    ),
  )
}
                  >
                    <ReviewItem label="Year" value={form.year} />

                    <ReviewItem label="Make" value={form.make} />

                    <ReviewItem label="Model" value={form.model} />

                    <ReviewItem label="VIN" value={form.vin} />

                    <ReviewItem label="Estimated Vehicle Value" value={estimatedVehicleValue ? estimatedVehicleValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "Complete vehicle details"} />
                    {loanType === "title-loan" && (
                      <ReviewItem
                        label="Requested Loan Amount"
                        value={
                          form.amountRequested
                            ? `$${Number(
                                String(form.amountRequested).replace(/[$,\s]/g, ""),
                              ).toLocaleString("en-US")}`
                            : "—"
                        }
                      />
                    )}
                  </ReviewCard>

                  {/* LOAN */}

                  <ReviewCard
                    icon={<DollarSign size={17} />}
                    title="Loan Information"
                    onEdit={() =>
  setStep(
    STEPS.findIndex(
      (item) => item.key === "loan",
    ),
  )
}
                  >
                    <ReviewItem
                      label="Amount Requested"
                      value={
                        form.amountRequested
                          ? `$${Number(
                              String(form.amountRequested).replace(
                                /[$,\s]/g,
                                "",
                              ),
                            ).toLocaleString()}`
                          : "—"
                      }
                    />

                    <ReviewItem
                      label="Reason"
                      value={form.reasonForFunds || "—"}
                    />

                    <ReviewItem
                      label="Employment"
                      value={form.employmentStatus || "—"}
                    />
                  </ReviewCard>
                </div>
              )}

              {/* ======================================================
                  SUCCESS
              ====================================================== */}

              {isSubmitted && (
                <div className="mt-8 space-y-5">
                  <div className="rounded-[26px] border border-emerald-500/20 bg-[#eef7df] p-6">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#087a45] text-white">
                        <CheckCircle2 size={26} />
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#087a45]">
                          Application Submitted
                        </span>

                        <h3 className="mt-1 text-xl font-black text-[#101512]">
                          {form.firstName}
                          &apos;s Auto Title Loan Application
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-black/60">
                          Your application has been successfully received and is
                          now under review.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                        ● Under Review
                      </span>

                      <span className="rounded-xl border border-emerald-200 bg-white px-3 py-1 font-mono text-xs font-bold text-[#087a45]">
                        #
                        {submittedLoan?._id
                          ? submittedLoan._id.slice(-6).toUpperCase()
                          : "SUBMITTED"}
                      </span>
                    </div>
                  </div>

                  {/* PERSONAL SUMMARY */}

                  <ReviewCard
                    icon={<User size={17} />}
                    title="Personal Information"
                  >
                    <ReviewItem
                      label="Name"
                      value={`${form.firstName} ${form.lastName}`}
                    />

                    <ReviewItem label="Email" value={form.email} />

                    <ReviewItem label="Phone" value={form.phone} />

                    <ReviewItem label="ZIP" value={form.zipCode} />
                  </ReviewCard>

                  {/* VEHICLE SUMMARY */}

                  <ReviewCard
                    icon={<Car size={17} />}
                    title="Vehicle Information"
                  >
                    <ReviewItem
                      label="Vehicle"
                      value={`${form.year} ${form.make} ${form.model}`}
                    />

                    <ReviewItem label="VIN" value={form.vin} />

                    <ReviewItem label="Estimated Vehicle Value" value={estimatedVehicleValue ? estimatedVehicleValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "Complete vehicle details"} />
                    {loanType === "title-loan" && (
                      <ReviewItem
                        label="Requested Loan Amount"
                        value={
                          form.amountRequested
                            ? `$${Number(
                                String(form.amountRequested).replace(/[$,\s]/g, ""),
                              ).toLocaleString("en-US")}`
                            : "—"
                        }
                      />
                    )}
                  </ReviewCard>

                  {/* LOAN SUMMARY */}

                  <ReviewCard
                    icon={<DollarSign size={17} />}
                    title="Loan Information"
                  >
                    <ReviewItem
                      label="Amount Requested"
                      value={
                        form.amountRequested
                          ? `$${Number(
                              String(form.amountRequested).replace(
                                /[$,\s]/g,
                                "",
                              ),
                            ).toLocaleString()}`
                          : "—"
                      }
                    />

                    <ReviewItem
                      label="Employment"
                      value={form.employmentStatus || "—"}
                    />
                  </ReviewCard>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <Link
                      href={`/${locale}/portal`}
                      className="btn-primary flex flex-1 items-center justify-center gap-2 text-center"
                    >
                      View My Application
                      <ArrowRight size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={resetApplication}
                      className="rounded-2xl border border-[var(--line)] bg-white px-5 py-3.5 text-xs font-bold text-[#000] transition-all hover:text-white hover:bg-[var(--ink)]"
                    >
                      Submit Another Vehicle
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================
                  SUBMIT ERROR
              ====================================================== */}

              {submitError && (
                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* ======================================================
                  NAVIGATION
              ====================================================== */}

              {!isSubmitted && (
                <div className="mt-9 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || isSubmitting}
                    className="btn-ghost flex items-center gap-2 disabled:opacity-30"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  {step < STEPS.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2"
                    >
                     {step < STEPS.length - 1 ? "Next" : "Continue"}

                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Continue & Submit
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default ApplyContent;
