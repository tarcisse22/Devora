"use client";

import { useEffect, useState } from "react";

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function formatAgo(date: Date, now: number) {
  const seconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  return "just now";
}

/** "3 hours ago", refreshed every minute; full date on hover. */
export function TimeAgo({ date }: { date: Date | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);
  if (!date) return <span>just now</span>;
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {formatAgo(date, now)}
    </time>
  );
}
