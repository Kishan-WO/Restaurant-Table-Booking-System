// Parse server validation errors into two buckets:
// 1. RHF fields (name, address, contact.phone, bookingConfig.*)
// 2. Opening hours errors keyed by subpath (monday, monday.ranges.0.from, etc.)
//
// Backend shape: { message, errorCode: "VALIDATION_ERROR", details: [{ path, message }] }
// where path looks like "body.name", "body.openingHours.monday.ranges.0.from", etc.
export const parseServerErrors = (
  details,
  setError,
  setHoursErrors,
  setApiError,
) => {
  if (!Array.isArray(details) || details.length === 0) return;

  const hoursErrs = {};
  const fieldMap = {};

  details.forEach(({ path, message }) => {
    // Strip leading "body." prefix emitted by the validation middleware
    const field = path.replace(/^body\./, "");

    if (field.startsWith("openingHours.")) {
      const subField = field.replace("openingHours.", "");
      if (!hoursErrs[subField]) hoursErrs[subField] = message;
    } else {
      if (!fieldMap[field]) fieldMap[field] = message;
    }
  });

  // Set RHF errors
  Object.entries(fieldMap).forEach(([field, message]) => {
    setError(field, { type: "server", message });
  });

  // Set opening hours errors
  if (Object.keys(hoursErrs).length > 0) {
    setHoursErrors(hoursErrs);
    setApiError("Please fix the opening hours errors highlighted below.");
  }
};

export const validateHours = (hours) => {
  const errors = {};

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  Object.entries(hours).forEach(([day, config]) => {
    if (!config.enabled) return;

    const ranges = config.ranges;

    for (let i = 0; i < ranges.length; i++) {
      const { from, to } = ranges[i];

      if (toMinutes(from) >= toMinutes(to)) {
        errors[`${day}.ranges.${i}.from`] = "Start must be before end";
      }

      if (i > 0) {
        const prev = ranges[i - 1];

        if (toMinutes(from) < toMinutes(prev.to)) {
          errors[`${day}.ranges.${i}`] = "Overlapping time range";
        }
      }
    }
  });

  return errors;
};
