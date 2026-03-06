import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Outlet } from "react-router-dom";

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-6 medical-pattern overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
