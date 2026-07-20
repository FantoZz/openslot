"use client";
import { FormEvent, useEffect, useState } from "react";

export function BookingForm({ slug, timezone }: { slug:string; timezone:string }) {
  const [slots,setSlots] = useState<string[]>([]); const [selected,setSelected] = useState("");
  const [loading,setLoading] = useState(true); const [error,setError] = useState(""); const [done,setDone] = useState<{meetUrl?:string} | null>(null);
  useEffect(() => { fetch(`/api/slots/${slug}`).then(async r => { const data=await r.json(); if(!r.ok) throw new Error(data.error); setSlots(data.slots); }).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }, [slug]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); if(!selected) return setError("Сначала выберите время");
    const body={...Object.fromEntries(new FormData(event.currentTarget)),startsAt:selected};
    const response=await fetch(`/api/book/${slug}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data=await response.json(); if(!response.ok) return setError(data.error); setDone(data);
  }
  if(done) return <div className="notice"><strong>Встреча забронирована.</strong><p>Приглашение отправлено на вашу почту.{done.meetUrl && <> <a href={done.meetUrl}>Открыть Google Meet</a>.</>}</p></div>;
  const formatter=new Intl.DateTimeFormat("ru",{timeZone:timezone,weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
  return <form onSubmit={submit}>
    <div><h3>Выберите время</h3>{loading ? <p>Проверяем календарь…</p> : slots.length ? <div className="slots">{slots.map(slot=><button type="button" key={slot} className={`slot ${selected===slot?"selected":""}`} onClick={()=>setSelected(slot)}>{formatter.format(new Date(slot))}</button>)}</div> : <p>Свободных окон на ближайшие 14 дней нет.</p>}</div>
    <label>Ваше имя<input name="guestName" required /></label>
    <label>Email<input name="guestEmail" type="email" required /></label>
    <label>Комментарий<textarea name="notes" rows={3} /></label>
    {error && <span className="error">{error}</span>}<button>Забронировать</button>
  </form>;
}
