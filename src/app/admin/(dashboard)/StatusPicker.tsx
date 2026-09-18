"use client";

import { useFormStatus } from "react-dom";
import { updateOrderStatus } from "../actions";
import { ORDER_STATUSES } from "@/lib/orders";

function StatusButton({
  value,
  current,
  label,
}: {
  value: string;
  current: string;
  label: string;
}) {
  const { pending } = useFormStatus();
  const active = value === current;

  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending || active}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default ${
        active
          ? "border-pks-500 bg-pks-500 text-white"
          : value === "CANCELLED"
            ? "border-paper-400 text-ink-400 hover:border-pks-400 hover:text-pks-600"
            : "border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600"
      } ${pending ? "opacity-50" : ""}`}
    >
      {label}
    </button>
  );
}

/**
 * One row of buttons per order. Every button posts the same server action,
 * so the status change survives a dead connection or a closed laptop — there
 * is no client state to lose.
 *
 * Labels arrive as a prop rather than being looked up here: the panel's
 * language lives in a cookie the server reads, so the server is the only
 * place that knows it.
 */
export function StatusPicker({
  orderId,
  current,
  moveToLabel,
  labels,
}: {
  orderId: string;
  current: string;
  moveToLabel: string;
  labels: Record<string, string>;
}) {
  return (
    <form action={updateOrderStatus} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <span className="text-ink-400 me-1 text-[10px] tracking-[0.2em] uppercase">
        {moveToLabel}
      </span>
      {ORDER_STATUSES.map((value) => (
        <StatusButton
          key={value}
          value={value}
          current={current}
          label={labels[value] ?? value}
        />
      ))}
    </form>
  );
}

export default StatusPicker;
