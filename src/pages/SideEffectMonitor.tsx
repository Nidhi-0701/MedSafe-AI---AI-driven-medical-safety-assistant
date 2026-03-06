import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileWarning, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost } from "@/lib/api";

interface LogEntry {
  id?: number;
  medicine: string;
  dosage: string;
  age: string | number;
  gender: string;
  symptoms: string;
  date?: string;
  explanation?: string;
  precaution?: string;
}

export default function SideEffectMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [form, setForm] = useState({ medicine: "", dosage: "", age: "", gender: "", symptoms: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<{ explanation?: string; precaution?: string } | null>(null);

  const fetchLogs = () => {
    setFetching(true);
    apiGet<{ logs: { id: number; medicine: string; dosage: string; age: number | null; gender: string; symptoms: string; date: string; explanation?: string; precaution?: string }[] }>("/api/side-effect-logs")
      .then((data) => {
        setLogs(
          (data.logs || []).map((l) => ({
            id: l.id,
            medicine: l.medicine,
            dosage: l.dosage,
            age: l.age ?? "",
            gender: l.gender || "",
            symptoms: l.symptoms,
            date: l.date ? l.date.split("T")[0] : "",
            explanation: l.explanation,
            precaution: l.precaution,
          }))
        );
      })
      .catch(() => setLogs([]))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const addLog = async () => {
    if (!form.medicine.trim() || !form.symptoms.trim()) {
      setError("Medicine and symptoms are required.");
      return;
    }
    setError(null);
    setLastResponse(null);
    setLoading(true);
    try {
      const res = await apiPost<{ explanation?: string; precaution?: string }>("/api/side-effect", {
        medicine: form.medicine.trim(),
        dosage: form.dosage.trim() || undefined,
        age: form.age.trim() ? parseInt(form.age, 10) : undefined,
        gender: form.gender || undefined,
        symptoms: form.symptoms.trim(),
      });
      setLastResponse({ explanation: res.explanation, precaution: res.precaution });
      setForm({ medicine: "", dosage: "", age: "", gender: "", symptoms: "" });
      fetchLogs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Side-Effect Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">Log and track medicine side effects (saved to backend)</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <FileWarning className="w-4 h-4 text-primary" /> Log Side Effect
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            value={form.medicine}
            onChange={(e) => setForm({ ...form, medicine: e.target.value })}
            placeholder="Medicine"
            className="bg-muted/50 border-none"
          />
          <Input
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            placeholder="Dosage"
            className="bg-muted/50 border-none"
          />
          <Input
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Age"
            className="bg-muted/50 border-none"
          />
          <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
            <SelectTrigger className="bg-muted/50 border-none">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            placeholder="Symptoms"
            className="bg-muted/50 border-none"
          />
        </div>
        <Button
          onClick={addLog}
          disabled={loading}
          size="sm"
          className="mt-3 gradient-primary text-primary-foreground border-none"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
          Add Entry (saves to backend + AI note)
        </Button>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        {lastResponse && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
            {lastResponse.explanation && <p><strong>Explanation:</strong> {lastResponse.explanation}</p>}
            {lastResponse.precaution && <p><strong>Precaution:</strong> {lastResponse.precaution}</p>}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold mb-4">Recent Side-Effect Logs (from backend)</h3>
        {fetching ? (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Medicine", "Dosage", "Age", "Gender", "Symptoms"].map((h) => (
                  <th key={h} className="text-left py-2 font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground text-center">
                    No logs yet. Add an entry above (backend must be running).
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id ?? i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-muted-foreground">{log.date ?? "—"}</td>
                    <td className="py-2.5 font-medium">{log.medicine}</td>
                    <td className="py-2.5">{log.dosage}</td>
                    <td className="py-2.5">{log.age}</td>
                    <td className="py-2.5">{log.gender}</td>
                    <td className="py-2.5">{log.symptoms}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
