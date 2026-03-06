import { useState } from "react";
import { motion } from "framer-motion";
import { Siren, HeartPulse, Droplets, Activity, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";

export default function EmergencyRisk() {
  const [vitals, setVitals] = useState({ heartRate: "", oxygenLevel: "", systolic: "", diastolic: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    risk_level: string;
    risk_score?: number;
    recommendation: string;
    reasons?: string[];
  } | null>(null);

  const calculate = async () => {
    const heart_rate = vitals.heartRate.trim() ? parseInt(vitals.heartRate, 10) : undefined;
    const oxygen_level = vitals.oxygenLevel.trim() ? parseInt(vitals.oxygenLevel, 10) : undefined;
    const systolic = vitals.systolic.trim() ? parseInt(vitals.systolic, 10) : undefined;
    const diastolic = vitals.diastolic.trim() ? parseInt(vitals.diastolic, 10) : undefined;
    if (!heart_rate && !oxygen_level && !systolic && !diastolic) {
      setError("Enter at least one vital.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await apiPost<{ risk_level: string; recommendation: string; reasons?: string[] }>(
        "/api/risk-predict",
        {
          heart_rate: heart_rate ?? undefined,
          blood_pressure: systolic,
          blood_pressure_diastolic: diastolic,
          oxygen_level: oxygen_level ?? undefined,
        }
      );
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assess. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result?.risk_level ?? null;
  const riskColor = riskLevel === "HIGH" ? "text-medical-red" : riskLevel === "MEDIUM" ? "text-medical-amber" : "text-medical-green";
  const riskBg = riskLevel === "HIGH" ? "bg-medical-red-light" : riskLevel === "MEDIUM" ? "bg-medical-amber-light" : "bg-medical-green-light";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Emergency Risk Predictor</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter patient vitals to assess emergency risk level (backend)</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <HeartPulse className="w-3.5 h-3.5" /> Heart Rate (bpm)
            </label>
            <Input
              value={vitals.heartRate}
              onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
              placeholder="72"
              className="bg-muted/50 border-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Droplets className="w-3.5 h-3.5" /> Oxygen Level (%)
            </label>
            <Input
              value={vitals.oxygenLevel}
              onChange={(e) => setVitals({ ...vitals, oxygenLevel: e.target.value })}
              placeholder="98"
              className="bg-muted/50 border-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5" /> Systolic BP (mmHg)
            </label>
            <Input
              value={vitals.systolic}
              onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })}
              placeholder="120"
              className="bg-muted/50 border-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5" /> Diastolic BP (mmHg)
            </label>
            <Input
              value={vitals.diastolic}
              onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })}
              placeholder="80"
              className="bg-muted/50 border-none"
            />
          </div>
        </div>
        <Button
          onClick={calculate}
          disabled={loading}
          className="mt-4 gradient-primary text-primary-foreground border-none"
          size="sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Siren className="w-3.5 h-3.5 mr-1.5" />}
          Assess Risk
        </Button>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 text-center">
          <div className={`w-24 h-24 rounded-full ${riskBg} flex items-center justify-center mx-auto mb-4`}>
            <span className={`text-3xl font-bold font-display ${riskColor}`}>{result.risk_score ?? result.risk_level}</span>
          </div>
          <p className={`text-lg font-bold font-display ${riskColor}`}>{result.risk_level} Risk</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">{result.recommendation}</p>
          {result.reasons?.length ? (
            <p className="text-[10px] text-muted-foreground mt-2">Reasons: {result.reasons.join(", ")}</p>
          ) : null}
          {result.risk_level === "HIGH" && (
            <div className="mt-4 p-3 rounded-lg bg-medical-red-light border border-medical-red/20">
              <p className="text-xs font-semibold text-medical-red flex items-center justify-center gap-1.5">
                <Siren className="w-4 h-4" /> Emergency Alert: Seek immediate medical care
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
