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
    <label>Название<input name="title" required placeholder="Собеседование с лидом" /></label>
    <label>Адрес ссылки<input name="slug" required pattern="[a-z0-9-]+" placeholder="lead-interview" /></label>
    <label>Описание<textarea name="description" rows={3} placeholder="Обсудим задачу и следующие шаги" /></label>
    <div className="row">
      <label>Длительность<select name="durationMin" defaultValue="60"><option value="30">30 минут</option><option value="45">45 минут</option><option value="60">1 час</option><option value="90">1,5 часа</option></select></label>
      <label>Часовой пояс<input name="timezone" defaultValue="Europe/Kyiv" /></label>
    </div>
    <label>Доступные слоты вперёд<select name="availabilityDays" defaultValue="14"><option value="7">7 дней</option><option value="14">14 дней</option><option value="30">30 дней</option><option value="60">60 дней</option><option value="90">90 дней</option></select></label>
    <div className="row">
      <label>Начало рабочего дня<input name="startHour" type="number" min="0" max="23" defaultValue="9" /></label>
      <label>Конец рабочего дня<input name="endHour" type="number" min="1" max="24" defaultValue="18" /></label>
    </div>
    <label className="checkbox"><input name="includeWeekends" type="checkbox" />Включать субботу и воскресенье</label>
    {error && <span className="error">{error}</span>}
    <button disabled={pending}>{pending ? "Создаём…" : "Создать ссылку"}</button>
  </form>;
}
