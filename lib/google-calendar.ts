import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function calendarForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.refresh_token) {
    throw new Error("Google Calendar не подключён. Выйдите и войдите снова, разрешив доступ к календарю.");
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: account.refresh_token });
  return google.calendar({ version: "v3", auth });
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
