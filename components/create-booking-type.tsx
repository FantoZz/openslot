"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateBookingType() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const [availabilityMode, setAvailabilityMode] = useState<"FREE" | "EVENT">("FREE");
  const [eventQuery, setEventQuery] = useState("");
  const [eventTitles, setEventTitles] = useState<string[]>([]);
  const [searchingEvents, setSearchingEvents] = useState(false);

  useEffect(() => {
    if (availabilityMode !== "EVENT" || eventQuery.trim().length < 2) {
      setEventTitles([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchingEvents(true);
      try {
        const response = await fetch(`/api/calendar-events?q=${encodeURIComponent(eventQuery)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok) setEventTitles(data.events ?? []);
      } finally {
        setSearchingEvents(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [availabilityMode, eventQuery]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = {
      ...Object.fromEntries(formData),
      includeWeekends: formData.has("includeWeekends"),
      singleUse: formData.has("singleUse"),
    };
    const response = await fetch("/api/booking-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    setPending(false);
    if (!response.ok) return setError(result.error);
    form.reset();
    setIncludeWeekends(false);
    setAvailabilityMode("FREE");
    setEventQuery("");
    router.refresh();
  }

  return <form onSubmit={submit}>
    <label>Назва<input name="title" required placeholder="Співбесіда з кандидатом" /></label>
    <label>Адреса посилання <span className="optional">(необов’язково)</span><input name="slug" pattern="[a-z0-9-]+" placeholder="Згенерується автоматично" /></label>
    <label>Опис <span className="optional">(необов’язково)</span><textarea name="description" rows={3} placeholder="Обговоримо досвід і наступні кроки" /></label>
    <div className="row">
      <label>Тривалість<select name="durationMin" defaultValue="60"><option value="30">30 хвилин</option><option value="45">45 хвилин</option><option value="60">1 година</option><option value="90">1,5 години</option></select></label>
      <label>Часовий пояс<input name="timezone" defaultValue="Europe/Kyiv" /></label>
    </div>
    <label>Доступні слоти наперед<select name="availabilityDays" defaultValue="14"><option value="1">Сьогодні</option><option value="2">2 дні</option><option value="3">3 дні</option><option value="7">7 днів</option><option value="14">14 днів</option></select></label>

    <fieldset className="mode-options">
      <legend>Як визначати доступний час</legend>
      <label className="radio-option">
        <input name="availabilityMode" type="radio" value="FREE" checked={availabilityMode === "FREE"} onChange={() => setAvailabilityMode("FREE")} />
        <span><strong>Вільний час</strong><small>Показувати вільні вікна, яких немає в Google Calendar.</small></span>
      </label>
      <label className="radio-option">
        <input name="availabilityMode" type="radio" value="EVENT" checked={availabilityMode === "EVENT"} onChange={() => setAvailabilityMode("EVENT")} />
        <span><strong>Тільки вибрані події</strong><small>Показувати час лише всередині подій із вибраною назвою.</small></span>
      </label>
    </fieldset>

    {availabilityMode === "EVENT" ? <label className="event-search">
      Подія в Google Calendar
      <input
        name="sourceEventTitle"
        value={eventQuery}
        onChange={(event) => setEventQuery(event.target.value)}
        required
        autoComplete="off"
        placeholder="Почніть вводити, наприклад «спортзал»"
      />
      {searchingEvents && <small>Шукаємо події…</small>}
      {!!eventTitles.length && <div className="event-suggestions">
        {eventTitles.map((title) => <button type="button" key={title} onClick={() => {
          setEventQuery(title);
          setEventTitles([]);
        }}>{title}</button>)}
      </div>}
      {!searchingEvents && eventQuery.length >= 2 && !eventTitles.length && <small>Введіть точну назву події або виберіть її з результатів.</small>}
    </label> : <>
      <div className="row">
        <label>Початок робочого дня<input name="startHour" type="number" min="0" max="23" defaultValue="9" /></label>
        <label>Кінець робочого дня<input name="endHour" type="number" min="1" max="24" defaultValue="18" /></label>
      </div>
      <label className="checkbox"><input name="includeWeekends" type="checkbox" checked={includeWeekends} onChange={(event) => setIncludeWeekends(event.target.checked)} />Включати суботу та неділю</label>
      {includeWeekends && <fieldset className="weekend-hours">
        <legend>Години роботи у вихідні</legend>
        <div className="row">
          <label>Початок робочого дня<input name="weekendStartHour" type="number" min="0" max="23" defaultValue="10" /></label>
          <label>Кінець робочого дня<input name="weekendEndHour" type="number" min="1" max="24" defaultValue="16" /></label>
        </div>
      </fieldset>}
    </>}
    {availabilityMode === "EVENT" && <>
      <input name="startHour" type="hidden" value="0" />
      <input name="endHour" type="hidden" value="24" />
      <input name="weekendStartHour" type="hidden" value="0" />
      <input name="weekendEndHour" type="hidden" value="24" />
    </>}

    <label className="checkbox"><input name="singleUse" type="checkbox" />Бронювання лише для однієї людини</label>
    <p className="field-hint">Після першого успішного бронювання посилання автоматично закриється. Створена зустріч залишиться в календарі.</p>
    {error && <span className="error">{error}</span>}
    <button disabled={pending}>{pending ? "Створюємо…" : "Створити посилання"}</button>
  </form>;
}
