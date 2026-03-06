import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { API_BASE, apiGet } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ settings: any }>("/api/settings")
      .then((d) => setSettings(d.settings))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load settings"));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const s = settings || {
    profile: { name: "Dr. Sarah Chen", email: "sarah.chen@medsafe.ai" },
    notifications: {
      high_risk_interaction_alerts: true,
      new_side_effect_reports: true,
      emergency_risk_notifications: true,
    },
    security: { two_factor_authentication: true, session_timeout_30_min: true, audit_logging: false },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and platform preferences</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="sm" className="gradient-primary text-primary-foreground border-none">
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>

      {[
        {
          icon: User, title: "Profile",
          content: (
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={s.profile?.name ?? ""}
                onChange={(e) => setSettings({ ...s, profile: { ...(s.profile || {}), name: e.target.value } })}
                className="bg-muted/50 border-none"
              />
              <Input
                value={s.profile?.email ?? ""}
                onChange={(e) => setSettings({ ...s, profile: { ...(s.profile || {}), email: e.target.value } })}
                className="bg-muted/50 border-none"
              />
            </div>
          ),
        },
        {
          icon: Bell, title: "Notifications",
          content: (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">High-risk interaction alerts</span>
                <Switch
                  checked={!!s.notifications?.high_risk_interaction_alerts}
                  onCheckedChange={(v) => setSettings({ ...s, notifications: { ...(s.notifications || {}), high_risk_interaction_alerts: v } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">New side-effect reports</span>
                <Switch
                  checked={!!s.notifications?.new_side_effect_reports}
                  onCheckedChange={(v) => setSettings({ ...s, notifications: { ...(s.notifications || {}), new_side_effect_reports: v } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Emergency risk notifications</span>
                <Switch
                  checked={!!s.notifications?.emergency_risk_notifications}
                  onCheckedChange={(v) => setSettings({ ...s, notifications: { ...(s.notifications || {}), emergency_risk_notifications: v } })}
                />
              </div>
            </div>
          ),
        },
        {
          icon: Shield, title: "Security",
          content: (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">Two-factor authentication</span>
                <Switch
                  checked={!!s.security?.two_factor_authentication}
                  onCheckedChange={(v) => setSettings({ ...s, security: { ...(s.security || {}), two_factor_authentication: v } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Session timeout (30 min)</span>
                <Switch
                  checked={!!s.security?.session_timeout_30_min}
                  onCheckedChange={(v) => setSettings({ ...s, security: { ...(s.security || {}), session_timeout_30_min: v } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Audit logging</span>
                <Switch
                  checked={!!s.security?.audit_logging}
                  onCheckedChange={(v) => setSettings({ ...s, security: { ...(s.security || {}), audit_logging: v } })}
                />
              </div>
            </div>
          ),
        },
      ].map((section, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <section.icon className="w-4 h-4 text-primary" /> {section.title}
          </h3>
          {section.content}
        </motion.div>
      ))}
    </div>
  );
}
