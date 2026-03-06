import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { apiGet } from "@/lib/api";

interface Insights {
  total_medicine_checks: number;
  total_symptom_reports: number;
  total_side_effect_reports: number;
  total_risk_checks: number;
  total_prescription_scans: number;
  risk_distribution: { LOW: number; MEDIUM: number; HIGH: number };
}

export default function Reports() {
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    apiGet<Insights>("/api/insights")
      .then(setInsights)
      .catch(() => setInsights(null));
  }, []);

  const monthlyData = [
    { month: "Checks", checks: insights?.total_medicine_checks ?? 0, alerts: (insights?.risk_distribution?.HIGH ?? 0) + (insights?.risk_distribution?.MEDIUM ?? 0) },
    { month: "Symptoms", checks: insights?.total_symptom_reports ?? 0, alerts: 0 },
    { month: "Side effects", checks: insights?.total_side_effect_reports ?? 0, alerts: 0 },
    { month: "Risk checks", checks: insights?.total_risk_checks ?? 0, alerts: insights?.risk_distribution?.HIGH ?? 0 },
    { month: "Scans", checks: insights?.total_prescription_scans ?? 0, alerts: 0 },
  ].filter((r) => r.checks > 0 || r.alerts > 0);

  const hasChartData = monthlyData.length > 0;
  const displayData = hasChartData ? monthlyData : [
    { month: "No data", checks: 0, alerts: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform stats from backend</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Checks & Alerts (from backend)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="checks" fill="hsl(174 62% 40%)" radius={[4, 4, 0, 0]} name="Count" />
              <Bar dataKey="alerts" fill="hsl(38 92% 55%)" radius={[4, 4, 0, 0]} name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
          {!hasChartData && (
            <p className="text-xs text-muted-foreground mt-2">Use the app (interactions, risk, side effects) to see data here.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Medicine checks:</strong> {insights?.total_medicine_checks ?? 0}</p>
            <p><strong>Symptom reports:</strong> {insights?.total_symptom_reports ?? 0}</p>
            <p><strong>Side-effect logs:</strong> {insights?.total_side_effect_reports ?? 0}</p>
            <p><strong>Risk checks:</strong> {insights?.total_risk_checks ?? 0}</p>
            <p><strong>Prescription scans:</strong> {insights?.total_prescription_scans ?? 0}</p>
            {insights?.risk_distribution && (
              <p className="pt-2 border-t border-border">
                Risk: Low {insights.risk_distribution.LOW}, Medium {insights.risk_distribution.MEDIUM}, High {insights.risk_distribution.HIGH}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
