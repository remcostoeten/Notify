"use client";

import { cn } from "@/shared/helpers/cn";

export type Option<Value extends string | number> = {
  value: Value;
  label: string;
};

type SelectFieldProps<Value extends string | number> = {
  label: string;
  value: Value;
  options: readonly Option<Value>[];
  onChange: (value: Value) => void;
  className?: string;
};

type SwitchFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SelectField<Value extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: SelectFieldProps<Value>) {
  return (
    <label className={cn("flex flex-col gap-2 p-4", className)}>
      <span className="font-mono text-[11px] tracking-wider text-foreground/45 uppercase">
        {label}
      </span>
      <select
        value={String(value)}
        onChange={(event) => {
          const next = options.find((option) => String(option.value) === event.target.value);
          if (next) onChange(next.value);
        }}
        className="themed-select h-8 w-full border border-foreground/10 bg-background px-2 text-[13px] text-foreground transition-colors duration-150 ease-hover hover:border-foreground/20 focus-visible:border-foreground/40 focus-visible:bg-foreground/5 focus-visible:outline-none open:border-foreground/20"
      >
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SwitchField({ id, label, checked, onChange }: SwitchFieldProps) {
  return (
    <div className="flex items-center gap-3 border-r border-b border-foreground/5 p-4">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className="group relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-foreground/15 bg-foreground/5 aria-checked:border-foreground aria-checked:bg-foreground"
      >
        <span className="pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-foreground/60 transition-transform duration-150 ease-snappy group-aria-checked:translate-x-4.5 group-aria-checked:bg-background" />
      </button>
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="cursor-pointer text-[13px] text-foreground/65"
      >
        {label}
      </label>
    </div>
  );
}
