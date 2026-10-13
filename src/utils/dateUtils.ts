/**
 * AgriPulse AI - Date & Timezone Utilities
 * Standardized timezone handling for Indian Agricultural Markets (Asia/Kolkata, UTC+05:30).
 */

/**
 * Returns today's current date string (YYYY-MM-DD) in Asia/Kolkata (IST) timezone.
 * Avoids browser-local timezone skew and off-by-one errors.
 */
export function getIndiaTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

/**
 * Given an anchor date (YYYY-MM-DD), calculates:
 * - Start Date: anchor date + 1 day
 * - End Date: anchor date + 14 days (exactly 14 calendar days, excluding anchor date)
 * - Trajectory Dates: array of 14 formatted dates (YYYY-MM-DD and formatted string)
 * - Formatted display range string (e.g., "Oct 15 – Oct 28, 2026")
 */
export function calculate14DayForecastWindow(anchorDateStr: string) {
  if (!anchorDateStr) {
    anchorDateStr = getIndiaTodayDateString();
  }

  const [year, month, day] = anchorDateStr.split('-').map(Number);
  // Construct UTC date to safely perform day-arithmetic without local DST or timezone offsets
  const anchor = new Date(Date.UTC(year, month - 1, day));

  const pad = (n: number) => String(n).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Start Date: day after anchor date
  const start = new Date(anchor);
  start.setUTCDate(anchor.getUTCDate() + 1);

  // End Date: 14 days after anchor date (covers days 1 through 14)
  const end = new Date(anchor);
  end.setUTCDate(anchor.getUTCDate() + 14);

  const startDateStr = `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`;
  const endDateStr = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`;

  const startMonth = monthNames[start.getUTCMonth()];
  const endMonth = monthNames[end.getUTCMonth()];
  const startDay = pad(start.getUTCDate());
  const endDay = pad(end.getUTCDate());
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  let displayRange = '';
  if (startYear !== endYear) {
    displayRange = `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
  } else {
    displayRange = `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
  }

  // Generate 14 trajectory calendar days
  const dailyDates: { day: number; date: string; formattedDate: string }[] = [];
  for (let d = 1; d <= 14; d++) {
    const cur = new Date(anchor);
    cur.setUTCDate(anchor.getUTCDate() + d);
    const dateStr = `${cur.getUTCFullYear()}-${pad(cur.getUTCMonth() + 1)}-${pad(cur.getUTCDate())}`;
    const formatted = `${monthNames[cur.getUTCMonth()]} ${pad(cur.getUTCDate())}`;
    dailyDates.push({
      day: d,
      date: dateStr,
      formattedDate: formatted
    });
  }

  return {
    anchorDateStr,
    startDateStr,
    endDateStr,
    displayRange,
    dailyDates
  };
}
