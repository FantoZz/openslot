import nodemailer from "nodemailer";

type BookingNotification = {
  organizerEmail: string;
  bookingTitle: string;
  guestName: string;
  guestEmail: string;
  notes?: string | null;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  meetUrl?: string | null;
  calendarUrl?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendBookingNotification(notification: BookingNotification) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !password || !from) {
    console.warn("Booking email was not sent: SMTP is not configured");
    return false;
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;
  const formatter = new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: notification.timezone,
  });
  const startText = formatter.format(notification.startsAt);
  const endText = new Intl.DateTimeFormat("uk-UA", {
    timeStyle: "short",
    timeZone: notification.timezone,
  }).format(notification.endsAt);
  const title = escapeHtml(notification.bookingTitle);
  const guestName = escapeHtml(notification.guestName);
  const guestEmail = escapeHtml(notification.guestEmail);
  const notes = notification.notes ? escapeHtml(notification.notes) : "Не вказано";
  const links = [
    notification.meetUrl && `<a href="${escapeHtml(notification.meetUrl)}">Приєднатися до Google Meet</a>`,
    notification.calendarUrl && `<a href="${escapeHtml(notification.calendarUrl)}">Відкрити подію в Google Calendar</a>`,
  ].filter(Boolean).join(" · ");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from,
    to: notification.organizerEmail,
    subject: `Нове бронювання: ${notification.bookingTitle}`,
    text: [
      `Нове бронювання: ${notification.bookingTitle}`,
      `Гість: ${notification.guestName} (${notification.guestEmail})`,
      `Час: ${startText}–${endText} (${notification.timezone})`,
      `Коментар: ${notification.notes || "Не вказано"}`,
      notification.meetUrl && `Google Meet: ${notification.meetUrl}`,
      notification.calendarUrl && `Google Calendar: ${notification.calendarUrl}`,
    ].filter(Boolean).join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#102650;max-width:620px">
        <p style="color:#4770c7;font-size:13px;letter-spacing:.08em">MATAS UNIVERSITY · OPENSLOT</p>
        <h1 style="font-size:24px;margin:0 0 20px">Нове бронювання</h1>
        <p><strong>Зустріч:</strong> ${title}</p>
        <p><strong>Гість:</strong> ${guestName} &lt;${guestEmail}&gt;</p>
        <p><strong>Час:</strong> ${escapeHtml(startText)}–${escapeHtml(endText)} (${escapeHtml(notification.timezone)})</p>
        <p><strong>Коментар:</strong> ${notes}</p>
        ${links ? `<p>${links}</p>` : ""}
      </div>
    `,
  });

  return true;
}
