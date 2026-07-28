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
