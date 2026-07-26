import { DateTime } from "luxon";

type Busy = { start?: string | null; end?: string | null };

export function buildSlots(input: {
  from: DateTime;
  days: number;
  durationMin: number;
  timezone: string;
  startHour: number;
  endHour: number;
  weekendStartHour: number;
  weekendEndHour: number;
  weekdays: number[];
  busy: Busy[];
}) {
  const slots: string[] = [];
  const now = DateTime.utc().plus({ minutes: 15 });
  for (let offset = 0; offset < input.days; offset++) {
    const day = input.from.setZone(input.timezone).startOf("day").plus({ days: offset });
    if (!input.weekdays.includes(day.weekday)) continue;
    const isWeekend = day.weekday >= 6;
    const startHour = isWeekend ? input.weekendStartHour : input.startHour;
    const endHour = isWeekend ? input.weekendEndHour : input.endHour;
    let cursor = day.set({ hour: startHour });
    const limit = day.set({ hour: endHour });
    while (cursor.plus({ minutes: input.durationMin }) <= limit) {
      const start = cursor.toUTC();
      const end = start.plus({ minutes: input.durationMin });
      const overlaps = input.busy.some((item) => {
        if (!item.start || !item.end) return false;
        return start < DateTime.fromISO(item.end) && end > DateTime.fromISO(item.start);
      });
      if (start > now && !overlaps) slots.push(start.toISO()!);
      cursor = cursor.plus({ minutes: input.durationMin });
    }
  }
  return slots;
}
