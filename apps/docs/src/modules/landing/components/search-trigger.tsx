"use client";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { SearchIcon } from "@/shared/icons/icons";

export function SearchTrigger() {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      aria-label="Search"
      onClick={() => setOpenSearch(true)}
      className="inline-flex size-8 items-center justify-center text-foreground/40 pressable hover:bg-foreground/5 hover:text-foreground/70 focus-visible:bg-foreground/8 focus-visible:text-foreground"
    >
      <SearchIcon className="size-4" />
    </button>
  );
}
