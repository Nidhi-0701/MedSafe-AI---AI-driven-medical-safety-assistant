import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Pill, ScanText, Stethoscope, AlertTriangle,
  Siren, Lightbulb, Users, BarChart3, Settings, ChevronLeft, ChevronRight, Heart
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Interaction Checker", path: "/interactions", icon: Pill },
  { title: "Prescription Analyzer", path: "/prescription", icon: ScanText },
  { title: "Symptom Solver", path: "/symptoms", icon: Stethoscope },
  { title: "Side-Effect Monitor", path: "/side-effects", icon: AlertTriangle },
  { title: "Emergency Risk", path: "/emergency", icon: Siren },
  { title: "Health Insights", path: "/insights", icon: Lightbulb },
  { title: "Patient Records", path: "/patients", icon: Users },
  { title: "Reports & Analytics", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-display font-bold text-sm text-sidebar-primary-foreground">MedSafe AI</span>
              <span className="text-[10px] text-sidebar-foreground/60">Medication Safety</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
                />
              )}
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
