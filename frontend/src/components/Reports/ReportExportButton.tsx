// ReportExportButton.tsx
import { useState } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import type { DateRange } from "./ReportDashboard";

interface Props {
  dateRange: DateRange;
}

export function ReportExportButton({ dateRange }: Props) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (format: "csv" | "pdf") => {
    setExporting(format);
    setOpen(false);

    // --- Wire to your real export API here ---
    // e.g. exportApi.download({ format, from: dateRange.from, to: dateRange.to })
    setTimeout(() => {
      const fileName = `report_${dateRange.from}_${dateRange.to}.${format}`;
      // Mock: create a dummy download
      const blob = new Blob(
        [
          format === "csv"
            ? `Report,${dateRange.from},${dateRange.to}\nDate,Revenue,Profit\n2025-01-01,500000,120000`
            : `%PDF-1.4 mock report for ${dateRange.label}`,
        ],
        { type: format === "csv" ? "text/csv" : "application/pdf" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(null);
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={!!exporting}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-60 shadow-sm"
      >
        {exporting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            Export
            <ChevronDown
              className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => handleExport("csv")}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export as CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition"
          >
            <FileText className="h-4 w-4 text-red-500" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
