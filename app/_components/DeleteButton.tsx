"use client";
import { removeCountdown } from "@/app/_actions/removeCountdown";

export function DeleteButton({ id }: { id: string }) {
  return (
    <form action={removeCountdown}>
      <input type="hidden" name="id" value={id} />
      <button className="text-white hover:underline" type="submit">
        Remove
      </button>
    </form>
  );
}
