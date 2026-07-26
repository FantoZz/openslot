"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteBookingType({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm(`Видалити сторінку «${title}»? Заплановані зустрічі залишаться в календарі.`)) return;
    setPending(true);
    const response = await fetch(`/api/booking-types/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setPending(false);
      window.alert("Не вдалося видалити сторінку. Спробуйте ще раз.");
      return;
    }
    router.refresh();
  }

  return (
    <button className="delete-button" type="button" onClick={remove} disabled={pending} aria-label={`Видалити ${title}`} title="Видалити сторінку">
      ×
    </button>
  );
}
