import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Plus, X, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";

export default function InteractionChecker() {
  const [medicines, setMedicines] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    interaction_level: string;
    explanation: string;
    safety_note: string;
    matched_medicines?: string[];
  } | null>(null);

  const addMedicine = () => setMedicines([...medicines, ""]);
  const removeMedicine = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, val: string) => {
    const copy = [...medicines];
    copy[i] = val;
    setMedicines(copy);
  };

  const handleCheck = async () => {
    const list = medicines.map((m) => m.trim()).filter(Boolean);
    if (list.length < 2) {
      setError("Enter at least 2 medicines to check.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await apiPost<{
        interaction_level: string;
        explanation: string;
        safety_note: string;
        matched_medicines?: string[];
      }>("/api/check-interaction", { medicines: list });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result?.interaction_level?.toUpperCase() || "";
  const isHigh = riskLevel === "HIGH";
  const isLow = riskLevel === "LOW" || riskLevel === "NONE";
  const isMedium = !isHigh && !isLow;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Medicine Interaction Checker</h1>
        <p className="text-sm text-muted-foreground mt-1">Check for potential drug interactions and safety warnings</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" /> Enter Medicines
        </h3>
        <div className="space-y-3">
          {medicines.map((med, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={med}
                onChange={(e) => updateMedicine(i, e.target.value)}
                placeholder={`Medicine ${i + 1}`}
                className="bg-muted/50 border-none"
              />
              {medicines.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeMedicine(i)} className="text-muted-foreground hover:text-medical-red">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" size="sm" onClick={addMedicine}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Medicine
          </Button>
          <Button size="sm" onClick={handleCheck} disabled={loading} className="gradient-primary text-primary-foreground border-none">
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
            Check Interactions
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="glass-card p-4 border-l-4 border-l-destructive bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-sm font-semibold">Interaction Results</h3>
          <div
            className={`glass-card p-4 border-l-4 ${
              isHigh ? "border-l-medical-red" : isMedium ? "border-l-medical-amber" : "border-l-medical-green"
            }`}
          >
            <div className="flex items-start gap-3">
              {isHigh ? (
                <AlertTriangle className="w-5 h-5 text-medical-red mt-0.5" />
              ) : isLow ? (
                <CheckCircle className="w-5 h-5 text-medical-green mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-medical-amber mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(result.matched_medicines || medicines.filter(Boolean)).length ? (
                    <p className="text-sm font-semibold">
                      {(result.matched_medicines || medicines.filter(Boolean)).join(" + ")}
                    </p>
                  ) : null}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh ? "bg-medical-red-light text-medical-red" : isMedium ? "bg-medical-amber-light text-medical-amber" : "bg-medical-green-light text-medical-green"
                    }`}
                  >
                    {result.interaction_level} Risk
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{result.explanation}</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Safety: {result.safety_note}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
