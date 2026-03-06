import { Search, Bell, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function AppHeader() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines, symptoms, patients..."
          className="pl-10 bg-muted/50 border-none h-9 text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateStr} • {timeStr}</span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-medical-red animate-pulse-soft" />
        </button>

        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">DR</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-xs font-semibold leading-none">Dr. Sarah Chen</p>
            <p className="text-[10px] text-muted-foreground">Chief Physician</p>
          </div>
        </div>
      </div>
    </header>
  );
}
