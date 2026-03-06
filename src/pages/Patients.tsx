import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";

interface Patient {
  id: number;
  name: string;
  age?: number | null;
  condition?: string | null;
  status: string;
  last_visit?: string | null;
  risk: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    apiGet<{ patients: Patient[] }>("/api/patients")
      .then((data) => setPatients(data.patients || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load patients"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, query]);

  const addDemoPatients = async () => {
    setError(null);
    setLoading(true);
    try {
      const demo = [
        { name: "John Doe", age: 45, condition: "Hypertension", status: "Active", risk: "Medium", last_visit: "2026-03-05" },
        { name: "Jane Smith", age: 32, condition: "Diabetes Type 2", status: "Active", risk: "Low", last_visit: "2026-03-04" },
        { name: "Robert Johnson", age: 58, condition: "Cardiac Arrhythmia", status: "Critical", risk: "High", last_visit: "2026-03-06" },
        { name: "Emily Davis", age: 27, condition: "Asthma", status: "Active", risk: "Low", last_visit: "2026-03-03" },
        { name: "Michael Brown", age: 64, condition: "COPD", status: "Monitoring", risk: "Medium", last_visit: "2026-03-01" },
      ];
      for (const d of demo) {
        await apiPost("/api/patients", d);
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add demo patients");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Patient Records</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor patient information</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-none h-9 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={addDemoPatients} disabled={loading}>
            Add demo patients
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Patient", "Age", "Condition", "Status", "Last Visit", "Risk"].map((h) => (
                <th key={h} className="text-left py-3 font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">No patients yet.</td>
              </tr>
            ) : filtered.map((p, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {p.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="py-3">{p.age ?? "—"}</td>
                <td className="py-3">{p.condition ?? "—"}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.status === "Critical" ? "bg-medical-red-light text-medical-red" :
                    p.status === "Monitoring" ? "bg-medical-amber-light text-medical-amber" :
                    "bg-medical-green-light text-medical-green"
                  }`}>{p.status}</span>
                </td>
                <td className="py-3 text-muted-foreground">{p.last_visit ?? "—"}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.risk === "High" ? "bg-medical-red-light text-medical-red" :
                    p.risk === "Medium" ? "bg-medical-amber-light text-medical-amber" :
                    "bg-medical-green-light text-medical-green"
                  }`}>{p.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
