import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Bell, Home as HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HomeIcon size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">NATPAC</div>
            <div className="text-[11px] text-muted-foreground">Travel Data Logger</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/trips"
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
          >
            My Trips
          </Link>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground hover:text-foreground">
            <Bell size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
