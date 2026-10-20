import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  children: ReactNode;
};

export function Section({ id, label, children }: Props) {
  return (
    <section id={id} className="scroll-mt-(--topbar-height)">
      <div className="border-b border-foreground/5 px-6 py-4">
        <h2 className="text-sm font-medium text-foreground">{label}</h2>
      </div>
      {children}
    </section>
  );
}
