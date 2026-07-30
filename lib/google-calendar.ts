import { OAuth2Client } from "googleapis-common";
import { calendar } from "googleapis/build/src/apis/calendar";
import { prisma } from "@/lib/prisma";

export async function calendarForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.refresh_token) {
    throw new Error("Google Calendar не підключено. Вийдіть і ввійдіть знову, дозволивши доступ до календаря.");
  }

  const auth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });
  auth.on("tokens", (tokens) => {
    if (!tokens.refresh_token) return;
    void prisma.account.update({
      where: { id: account.id },
      data: {
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : undefined,
      },
    }).catch((error) => console.error("Failed to save rotated Google token", error));
  });
  return calendar({ version: "v3", auth });
}

export async function getBusy(userId: string, timeMin: Date, timeMax: Date) {
  const calendar = await calendarForUser(userId);
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    },
  });
  return response.data.calendars?.primary?.busy ?? [];
}

export async function findCalendarEventTitles(
  userId: string,
  query: string,
  timeMin: Date,
  timeMax: Date,
) {
  const client = await calendarForUser(userId);
  const response = await client.events.list({
    calendarId: "primary",
    q: query,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });
  return Array.from(
    new Set(
      (response.data.items ?? [])
        .filter((event) => event.status !== "cancelled" && event.summary)
        .map((event) => event.summary!.trim()),
    ),
  ).slice(0, 12);
}

export async function getCalendarWindows(
  userId: string,
  eventTitle: string,
  timeMin: Date,
  timeMax: Date,
) {
  const client = await calendarForUser(userId);
  const response = await client.events.list({
    calendarId: "primary",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });
  const target = eventTitle.trim().toLocaleLowerCase();
  const allowed: Array<{ start: string; end: string }> = [];
  const busy: Array<{ start: string; end: string }> = [];

  for (const event of response.data.items ?? []) {
    const start = event.start?.dateTime;
    const end = event.end?.dateTime;
    if (event.status === "cancelled" || !start || !end) continue;
    if (event.summary?.trim().toLocaleLowerCase() === target) {
      allowed.push({ start, end });
    } else if (event.transparency !== "transparent") {
      busy.push({ start, end });
    }
  }
  return { allowed, busy };
}
