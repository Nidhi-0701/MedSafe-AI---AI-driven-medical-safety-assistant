import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pill, AlertTriangle, Stethoscope, Siren, Users, FileWarning } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { apiGet } from "@/lib/api";

interface Insights {
  total_medicine_checks: number;
  total_symptom_reports: number;
  total_side_effect_reports: number;
  total_risk_checks: number;
  total_prescription_scans: number;
  total_patients?: number;
  active_patients?: number;
  risk_distribution: { LOW: number; MEDIUM: number; HIGH: number };
  side_effect_frequency: { medicine: string; count: number }[];
}

const fallbackLineData = [
  { day: "Mon", risk: 32 }, { day: "Tue", risk: 45 }, { day: "Wed", risk: 28 },
  { day: "Thu", risk: 52 }, { day: "Fri", risk: 38 }, { day: "Sat", risk: 22 }, { day: "Sun", risk: 30 },
];
const fallbackBarData = [
  { symptom: "Headache", count: 42 }, { symptom: "Nausea", count: 35 }, { symptom: "Dizziness", count: 28 },
  { symptom: "Fatigue", count: 24 }, { symptom: "Rash", count: 18 }, { symptom: "Insomnia", count: 15 },
];
const fallbackAreaData = [
  { month: "Jan", usage: 120 }, { month: "Feb", usage: 150 }, { month: "Mar", usage: 180 },
  { month: "Apr", usage: 165 }, { month: "May", usage: 200 }, { month: "Jun", usage: 230 },
];

export default function Dashboard() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<{ medicine: string; risk: string; time: string }[]>([]);

  useEffect(() => {
    apiGet<Insights>("/api/insights")
      .then((data) => {
        setInsights(data);
        const freq = data.side_effect_frequency?.slice(0, 4) || [];
        setRecentAlerts(
          freq.map((f) => ({
            medicine: f.medicine,
            risk: f.count > 5 ? "High" : f.count > 2 ? "Medium" : "Low",
            time: "From logs",
          }))
        );
      })
      .catch(() => {
        setRecentAlerts([
          { medicine: "Warfarin + Aspirin", risk: "High", time: "Sample" },
          { medicine: "Metformin + Alcohol", risk: "Medium", time: "Sample" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const riskPie = insights?.risk_distribution
    ? [
        { name: "Low", value: insights.risk_distribution.LOW || 0, color: "#2BA84A" },
        { name: "Medium", value: insights.risk_distribution.MEDIUM || 0, color: "#EAB308" },
        { name: "High", value: insights.risk_distribution.HIGH || 0, color: "#E5484D" },
      ].filter((d) => d.value > 0)
    : [
        { name: "Low", value: 55, color: "#2BA84A" },
        { name: "Medium", value: 30, color: "#EAB308" },
        { name: "High", value: 15, color: "#E5484D" },
      ];
  const pieData = riskPie.length > 0 ? riskPie : [{ name: "No data", value: 1, color: "#94a3b8" }];

  const barData =
    insights?.side_effect_frequency?.length &&
    insights.side_effect_frequency.slice(0, 6).some((s) => s.count > 0)
      ? insights.side_effect_frequency.slice(0, 6).map((s) => ({ symptom: s.medicine, count: s.count }))
      : fallbackBarData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time medication safety monitoring</p>
      </div>

      {/* Stat Cards – from backend insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Medicine Checks"
          value={loading ? "…" : (insights?.total_medicine_checks ?? 0).toLocaleString()}
          change={insights ? "" : "+12.5%"}
          trend="up"
          icon={Pill}
          color="text-medical-teal"
          bgColor="bg-medical-teal-light"
          delay={0}
        />
        <StatCard
          title="Interaction Alerts"
          value={loading ? "…" : (insights?.total_medicine_checks ?? 0).toLocaleString()}
          change=""
          trend="up"
          icon={AlertTriangle}
          color="text-medical-amber"
          bgColor="bg-medical-amber-light"
          delay={0.05}
        />
        <StatCard
          title="Symptom Reports"
          value={loading ? "…" : (insights?.total_symptom_reports ?? 0).toLocaleString()}
          change=""
          trend="up"
          icon={Stethoscope}
          color="text-medical-blue"
          bgColor="bg-medical-blue-light"
          delay={0.1}
        />
        <StatCard
          title="High-Risk Alerts"
          value={loading ? "…" : (insights?.risk_distribution?.HIGH ?? 0).toLocaleString()}
          change=""
          trend="down"
          icon={Siren}
          color="text-medical-red"
          bgColor="bg-medical-red-light"
          delay={0.15}
        />
        <StatCard
          title="Active Patients"
          value={loading ? "…" : (insights?.active_patients ?? 0).toLocaleString()}
          change=""
          trend="up"
          icon={Users}
          color="text-medical-purple"
          bgColor="bg-medical-purple-light"
          delay={0.2}
        />
        <StatCard
          title="Side-Effect Logs"
          value={loading ? "…" : (insights?.total_side_effect_reports ?? 0).toLocaleString()}
          change=""
          trend="up"
          icon={FileWarning}
          color="text-medical-green"
          bgColor="bg-medical-green-light"
          delay={0.25}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Daily Health Risk Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={fallbackLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Line type="monotone" dataKey="risk" stroke="hsl(174 62% 40%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(174 62% 40%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Most Common Symptoms / Side effects</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis dataKey="symptom" tick={{ fontSize: 10 }} stroke="hsl(210 15% 50%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Bar dataKey="count" fill="hsl(210 80% 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Risk Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Medicine Usage Patterns</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={fallbackAreaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 25% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Area type="monotone" dataKey="usage" stroke="hsl(174 62% 40%)" fill="hsl(174 62% 40% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Recent Interaction Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.length ? (
              recentAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <div>
                    <p className="text-xs font-medium">{alert.medicine}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.time}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      alert.risk === "High" ? "bg-medical-red-light text-medical-red" : "bg-medical-amber-light text-medical-amber"
                    }`}
                  >
                    {alert.risk}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No alerts yet. Data from backend when available.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
