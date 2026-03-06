import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, ScanText, FileText, Pill, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPostForm } from "@/lib/api";

interface MedicineEntry {
  name: string;
  active_salt: string;
}

export default function PrescriptionAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<MedicineEntry[]>([]);
  const [extractedPreview, setExtractedPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "")) {
      setError("Use JPG, PNG, GIF, BMP or WebP.");
      return;
    }
    setFile(f);
    setError(null);
    setMedicines([]);
    setExtractedPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    setMedicines([]);
    setExtractedPreview(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const data = await apiPostForm<{ medicines: MedicineEntry[]; extracted_text_preview?: string }>(
        "/api/analyze-prescription",
        form
      );
      setMedicines(data.medicines || []);
      setExtractedPreview(data.extracted_text_preview || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Is the backend running? Do you have GEMINI_API_KEY and OCR (Tesseract) set up?");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = medicines.length > 0 || extractedPreview !== null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Prescription Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload a prescription to extract and analyze medicines using OCR</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all"
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">Click to upload prescription image</p>
          <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG (max 16MB)</p>
          {file && <p className="text-xs text-primary mt-2 font-medium">{file.name}</p>}
        </div>
        {file && (
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="mt-4 gradient-primary text-primary-foreground border-none"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanText className="w-4 h-4 mr-2" />}
            Analyze Prescription
          </Button>
        )}
      </motion.div>

      {error && (
        <div className="glass-card p-4 border-l-4 border-l-destructive bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {hasResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {extractedPreview && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <ScanText className="w-4 h-4 text-primary" /> OCR Extraction Preview
              </h3>
              <div className="bg-muted/40 rounded-lg p-4 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {extractedPreview}
              </div>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Pill className="w-4 h-4 text-primary" /> Extracted Medicines
            </h3>
            {medicines.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-muted-foreground">Medicine</th>
                      <th className="text-left py-2 font-semibold text-muted-foreground">Active Salt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((r, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2.5 font-medium">{r.name}</td>
                        <td className="py-2.5 text-muted-foreground">{r.active_salt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No medicines extracted. Try a clearer image or check OCR setup.</p>
            )}
          </div>
          {medicines.length > 0 && (
            <Button
              className="gradient-primary text-primary-foreground border-none"
              onClick={() => window.location.href = "/interactions"}
            >
              <FileText className="w-4 h-4 mr-2" /> Check Interactions for These Medicines
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
