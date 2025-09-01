import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { MapPin, TramFront } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TramFront size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">CityTrack</div>
            <div className="text-[11px] text-muted-foreground">Real-time Transit</div>
          </div>
        </Link>
        <Link
          to="/routes"
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
        >
          <MapPin size={14} />
          Nearby Stops
        </Link>
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
