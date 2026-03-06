import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Send, AlertTriangle, Heart, Apple, Moon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";

const lifestyleAdvice = [
  { icon: Heart, title: "Stay Hydrated", desc: "Drink 8-10 glasses of water daily" },
  { icon: Apple, title: "Balanced Diet", desc: "Include iron-rich foods and vitamins" },
  { icon: Moon, title: "Rest Well", desc: "Ensure 7-8 hours of quality sleep" },
];

export default function SymptomSolver() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    possible_causes?: string[];
    simple_remedies?: string[];
    lifestyle_suggestions?: string[];
    warning_signs?: string[];
  } | null>(null);

  const handleSubmit = async () => {
    const symptoms = (query || "").trim();
    if (!symptoms) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await apiPost<{
        possible_causes?: string[];
        simple_remedies?: string[];
        lifestyle_suggestions?: string[];
        warning_signs?: string[];
      }>("/api/symptom-check", { symptoms });
      setResult({
        possible_causes: data.possible_causes,
        simple_remedies: data.simple_remedies,
        lifestyle_suggestions: data.lifestyle_suggestions,
        warning_signs: data.warning_signs,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get guidance. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = result || error;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Symptom & Doubt Solver</h1>
        <p className="text-sm text-muted-foreground mt-1">Describe your symptoms for AI-powered health guidance</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-start gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your symptoms... e.g., I have a headache and mild nausea for the past 2 days"
            className="bg-muted/50 border-none min-h-[100px] resize-none"
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-3 gradient-primary text-primary-foreground border-none"
          size="sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
          Get AI Guidance
        </Button>
      </motion.div>

      {error && (
        <div className="glass-card p-4 border-l-4 border-l-destructive bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Ensure backend is running at http://localhost:5000 and GEMINI_API_KEY is set.</p>
        </div>
      )}

      {hasResult && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-5 border-l-4 border-l-primary">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-primary" /> AI Health Guidance
            </h3>
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              {result.possible_causes?.length ? (
                <>
                  <p><strong>Possible causes (educational):</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.possible_causes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {result.simple_remedies?.length ? (
                <>
                  <p><strong>Simple remedies:</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.simple_remedies.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {result.lifestyle_suggestions?.length ? (
                <>
                  <p><strong>Lifestyle suggestions:</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.lifestyle_suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lifestyleAdvice.map((item, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-medical-teal-light flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-medical-teal" />
                </div>
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {result.warning_signs?.length ? (
            <div className="glass-card p-5 border-l-4 border-l-medical-red">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-medical-red" /> Warning Signs – Seek Immediate Care
              </h3>
              <ul className="space-y-1.5">
                {result.warning_signs.map((sign, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-medical-red flex-shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
