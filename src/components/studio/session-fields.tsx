"use client";

import { Field } from "@/components/ui/field";
import { useStudioStore } from "@/lib/studio-store";

export const SessionFields = () => {
  const title = useStudioStore((state) => state.title);
  const dateISO = useStudioStore((state) => state.dateISO);
  const setTitle = useStudioStore((state) => state.setTitle);
  const setDate = useStudioStore((state) => state.setDate);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        id="strip-title"
        label="Title"
        type="text"
        autoComplete="off"
        maxLength={40}
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        placeholder="A slow afternoon"
      />
      <Field
        id="strip-date"
        label="Date"
        type="date"
        value={dateISO}
        onChange={(event) => setDate(event.currentTarget.value)}
      />
    </div>
  );
};
