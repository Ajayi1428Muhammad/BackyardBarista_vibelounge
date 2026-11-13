interface NavbarProps {
  onCraftFocus: () => void;
  onOpenJournal: () => void;
  savedCount: number;
}

export function Navbar({ onCraftFocus, onOpenJournal, savedCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#EBDAC4]/10 bg-[#120C09]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-tight text-[#FAF5EC] whitespace-nowrap shrink-0 transition-colors hover:text-[#D9822B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
        >
          The Backyard Barista
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#CBBBA8]"
        >
          <a
            href="#craft-studio"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF5EC] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            Craft Studio
          </a>
          <a
            href="#recipe-card"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF5EC] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            Recipe Card
          </a>
          <button
            type="button"
            onClick={onOpenJournal}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF5EC] hover:underline hover:underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            Saved Journal{savedCount > 0 ? ` (${savedCount})` : ''}
          </button>
          <a
            href="#brew-guide"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF5EC] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9822B]"
          >
            Brew Ratios
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onCraftFocus}
            className="min-h-[40px] rounded-lg bg-[#D9822B] px-5 py-2 text-sm font-semibold text-[#120C09] whitespace-nowrap shrink-0 transition-colors hover:bg-[#E89238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF5EC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120C09] cursor-pointer"
          >
            Craft Recipe
          </button>
        </div>
      </div>
    </header>
  );
}
