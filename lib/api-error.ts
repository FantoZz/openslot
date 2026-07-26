import { NextResponse } from "next/server";

type ApiError = {
  code?: number;
  message?: string;
  response?: { status?: number };
  status?: number;
};

export function calendarApiError(error: unknown) {
  console.error("Google Calendar request failed", error);

  const apiError = error as ApiError;
  const status = apiError.code ?? apiError.status ?? apiError.response?.status;
  const message = apiError.message ?? "";

  if (status === 403 && /has not been used|disabled/i.test(message)) {
    return NextResponse.json(
      {
        error:
          "Google Calendar тимчасово недоступний: організатору потрібно ввімкнути Calendar API у Google Cloud.",
        code: "CALENDAR_API_DISABLED",
      },
      { status: 503 },
    );
  }

  if (status === 401 || /invalid_grant|unauthorized/i.test(message)) {
    return NextResponse.json(
      {
        error:
          "Зв’язок із календарем організатора завершився. Організатору потрібно знову ввійти через Google.",
        code: "CALENDAR_REAUTH_REQUIRED",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: "Календар організатора тимчасово недоступний. Спробуйте пізніше.",
      code: "CALENDAR_UNAVAILABLE",
    },
    { status: 503 },
  );
}
