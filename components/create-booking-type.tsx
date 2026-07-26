"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreateBookingType() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const formData = new FormData(event.currentTarget);
    const data = { ...Object.fromEntries(formData), includeWeekends: formData.has("includeWeekends") };
    const response = await fetch("/api/booking-types", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    const result = await response.json(); setPending(false);
    if (!response.ok) return setError(result.error);
    event.currentTarget.reset(); router.refresh();
  }
  return <form onSubmit={submit}>
    <label>Назва<input name="title" required placeholder="Співбесіда з кандидатом" /></label>
    <label>Адреса посилання<input name="slug" required pattern="[a-z0-9-]+" placeholder="interview" /></label>
    <label>Опис<textarea name="description" rows={3} placeholder="Обговоримо досвід і наступні кроки" /></label>
    <div className="row">
      <label>Тривалість<select name="durationMin" defaultValue="60"><option value="30">30 хвилин</option><option value="45">45 хвилин</option><option value="60">1 година</option><option value="90">1,5 години</option></select></label>
      <label>Часовий пояс<input name="timezone" defaultValue="Europe/Kyiv" /></label>
    </div>
    <label>Доступні слоти наперед<select name="availabilityDays" defaultValue="14"><option value="7">7 днів</option><option value="14">14 днів</option><option value="30">30 днів</option><option value="60">60 днів</option><option value="90">90 днів</option></select></label>
    <div className="row">
      <label>Початок робочого дня<input name="startHour" type="number" min="0" max="23" defaultValue="9" /></label>
      <label>Кінець робочого дня<input name="endHour" type="number" min="1" max="24" defaultValue="18" /></label>
    </div>
    <label className="checkbox"><input name="includeWeekends" type="checkbox" />Включати суботу та неділю</label>
    {error && <span className="error">{error}</span>}
    <button disabled={pending}>{pending ? "Створюємо…" : "Створити посилання"}</button>
  </form>;
}
