import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, TrendingUp, Shield, Pill } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiGet } from "@/lib/api";

const tips = [
  { icon: Shield, title: "Never share prescriptions", desc: "Medicines are prescribed based on individual health conditions" },
  { icon: Pill, title: "Complete your course", desc: "Don't stop antibiotics early even if you feel better" },
  { icon: AlertTriangle, title: "Report side effects", desc: "Always inform your doctor about unexpected reactions" },
  { icon: TrendingUp, title: "Track your vitals", desc: "Regular monitoring helps in early detection of issues" },
];

interface Insights {
  total_medicine_checks: number;
  total_symptom_reports: number;
  total_side_effect_reports: number;
  total_risk_checks: number;
  side_effect_frequency: { medicine: string; count: number }[];
}

export default function HealthInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    apiGet<Insights>("/api/insights")
      .then(setInsights)
      .catch(() => setInsights(null));
  }, []);

  const interactionData =
    insights?.side_effect_frequency?.length &&
    insights.side_effect_frequency.some((s) => s.count > 0)
      ? insights.side_effect_frequency.slice(0, 8).map((s) => ({ pair: s.medicine, count: s.count }))
      : [
          { pair: "NSAID + Blood Thinner", count: 0 },
          { pair: "ACE Inh + Potassium", count: 0 },
          { pair: "Statin + Fibrate", count: 0 },
          { pair: "Metformin + Alcohol", count: 0 },
          { pair: "SSRI + MAOI", count: 0 },
        ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Health Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Data-driven health recommendations and safety information (from backend)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-medical-amber" /> Side-Effect / Medicine Frequency
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={interactionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <YAxis dataKey="pair" type="category" tick={{ fontSize: 10 }} width={130} stroke="hsl(210 15% 50%)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="count" fill="hsl(174 62% 40%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Medicine Safety Tips</h3>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                <div className="w-8 h-8 rounded-lg bg-medical-teal-light flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-4 h-4 text-medical-teal" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{tip.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Platform Stats (from backend)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Interaction Checks", stat: insights?.total_medicine_checks ?? "—", desc: "Total checks performed", color: "text-medical-blue" },
            { title: "Symptom Reports", stat: insights?.total_symptom_reports ?? "—", desc: "Symptom checks", color: "text-medical-green" },
            { title: "Side-Effect Logs", stat: insights?.total_side_effect_reports ?? "—", desc: "Logged side effects", color: "text-medical-teal" },
          ].map((item, i) => (
            <div key={i} className="text-center p-4 rounded-lg bg-muted/30">
              <p className={`text-2xl font-bold font-display ${item.color}`}>{item.stat}</p>
              <p className="text-xs font-semibold mt-1">{item.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
