"use client";

import { useState } from "react";

export function CopyBookingLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = new URL(path, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button className="copy-link-button" type="button" onClick={copy}>
      {copied ? "Скопійовано ✓" : "Копіювати посилання"}
    </button>
  );
}
