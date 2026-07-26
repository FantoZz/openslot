"use client";
import { FormEvent, useEffect, useState } from "react";

export function BookingForm({ slug, timezone, availabilityDays }: { slug:string; timezone:string; availabilityDays:number }) {
  const [slots,setSlots] = useState<string[]>([]); const [selected,setSelected] = useState("");
  const [loading,setLoading] = useState(true); const [submitting,setSubmitting] = useState(false); const [error,setError] = useState(""); const [done,setDone] = useState<{meetUrl?:string} | null>(null);
  async function readJson(response: Response) {
    const text=await response.text();
    if(!text) throw new Error("Сервер не відповів. Спробуйте пізніше.");
    try { return JSON.parse(text); } catch { throw new Error("Сервер повернув некоректну відповідь. Спробуйте пізніше."); }
  }
  useEffect(() => { fetch(`/api/slots/${slug}`).then(async r => { const data=await readJson(r); if(!r.ok) throw new Error(data.error || "Не вдалося завантажити вільний час"); setSlots(data.slots); }).catch(e=>setError(e instanceof Error ? e.message : "Не вдалося завантажити вільний час")).finally(()=>setLoading(false)); }, [slug]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); if(!selected) return setError("Спочатку оберіть час");
    setSubmitting(true);
    try {
      const body={...Object.fromEntries(new FormData(event.currentTarget)),startsAt:selected};
      const response=await fetch(`/api/book/${slug}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await readJson(response); if(!response.ok) throw new Error(data.error || "Не вдалося забронювати зустріч"); setDone(data);
    } catch(e) {
      setError(e instanceof Error ? e.message : "Не вдалося забронювати зустріч");
    } finally {
      setSubmitting(false);
    }
  }
  if(done) return <div className="notice"><strong>Зустріч заброньовано.</strong><p>Запрошення надіслано на вашу пошту.{done.meetUrl && <> <a href={done.meetUrl}>Відкрити Google Meet</a>.</>}</p></div>;
  const dayFormatter=new Intl.DateTimeFormat("uk",{timeZone:timezone,weekday:"short",day:"numeric",month:"short"});
  const dayKeyFormatter=new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"});
  const timeFormatter=new Intl.DateTimeFormat("uk",{timeZone:timezone,hour:"2-digit",minute:"2-digit"});
  const days=slots.reduce<Array<{key:string;label:string;slots:string[]}>>((groups,slot)=>{
    const date=new Date(slot);
    const key=dayKeyFormatter.format(date);
    const current=groups.at(-1);
    if(current?.key===key) current.slots.push(slot);
    else groups.push({key,label:dayFormatter.format(date),slots:[slot]});
    return groups;
  },[]);
  return <form onSubmit={submit}>
    <div className="slot-picker"><h3>Оберіть час</h3>{loading ? <p>Перевіряємо календар…</p> : error ? null : days.length ? <div className="slot-days">{days.map(day=><section className="slot-day" key={day.key}><h4>{day.label}</h4><div className="slot-times">{day.slots.map(slot=><button type="button" key={slot} className={`slot ${selected===slot?"selected":""}`} onClick={()=>setSelected(slot)}>{timeFormatter.format(new Date(slot))}</button>)}</div></section>)}</div> : <p>Вільних слотів на найближчі {availabilityDays} днів немає.</p>}</div>
    <label>Ваше ім’я<input name="guestName" required /></label>
    <label>Email<input name="guestEmail" type="email" required /></label>
    <label>Коментар<textarea name="notes" rows={3} /></label>
    {error && <span className="error">{error}</span>}<button disabled={loading || !slots.length || submitting}>{submitting ? "Бронюємо…" : "Забронювати"}</button>
  </form>;
}
