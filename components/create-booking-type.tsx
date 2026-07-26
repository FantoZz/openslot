"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateBookingType() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [includeWeekends, setIncludeWeekends] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const formData = new FormData(event.currentTarget);
    const data = { ...Object.fromEntries(formData), includeWeekends: formData.has("includeWeekends") };
    const response = await fetch("/api/booking-types", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    const result = await response.json(); setPending(false);
    if (!response.ok) return setError(result.error);
    event.currentTarget.reset(); setIncludeWeekends(false); router.refresh();
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
    {error && <span className="error">{error}</span>}
    <button disabled={pending}>{pending ? "Створюємо…" : "Створити посилання"}</button>
  </form>;
}
