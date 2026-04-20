export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const defaultHours = () =>
  Object.fromEntries(
    DAYS.map((d) => [
      d,
      { enabled: false, ranges: [{ from: "09:00", to: "22:00" }] },
    ]),
  );

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fromMinutes = (m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mins = String(m % 60).padStart(2, "0");
  return `${h}:${mins}`;
};

export const to12hFormat = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const generateAvailableSlots = (
  hoursArray,
  dateStr,
  slotDuration = 60,
  bufferTime = 0,
) => {
  const ranges = getOpenRangesForDate(hoursArray, dateStr);
  if (ranges.length === 0) return [];

  const allSlots = [];
  const totalStep = slotDuration + bufferTime;

  ranges.forEach((range) => {
    let currentMins = toMinutes(range.from);
    const endMins = toMinutes(range.to);

    while (currentMins + slotDuration <= endMins) {
      allSlots.push(fromMinutes(currentMins));
      currentMins += totalStep;
    }
  });

  return allSlots;
};

const formatTime = (t) => t?.padStart(5, "0");

export const normalizeHours = (openingHours) => {
  const hoursMap = Array.isArray(openingHours)
    ? Object.fromEntries(openingHours.map((item) => [item.day, item]))
    : openingHours || {};

  return Object.fromEntries(
    DAYS.map((day) => {
      const config = hoursMap[day];

      const hasRanges = config?.ranges?.length > 0;

      return [
        day,
        {
          enabled: config?.enabled ?? false,
          ranges: config?.enabled
            ? hasRanges
              ? config.ranges.map((r) => ({
                  from: formatTime(r.from),
                  to: formatTime(r.to),
                }))
              : [{ from: "09:00", to: "22:00" }]
            : [],
        },
      ];
    }),
  );
};

// hoursArray: the array returned by GET /restaurants/:id/hours
// Each element: { day: "monday", enabled: boolean, ranges: [{from, to}] }
export const getOpenRangesForDate = (hoursArray, dateStr) => {
  if (!Array.isArray(hoursArray) || hoursArray.length === 0) return [];
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const day = days[new Date(dateStr).getDay()];
  const cfg = hoursArray.find((h) => h.day === day);
  if (!cfg?.enabled) return [];
  return cfg.ranges || [];
};
