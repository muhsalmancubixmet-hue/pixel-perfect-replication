import { saved } from "@/components/admin/Dialogs";

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => any;
}

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  items: T[]
) {
  if (!items || items.length === 0) {
    saved("Export notice", `No data available to export for ${filename}.`);
    return;
  }

  const headers = columns.map((c) => `"${String(c.header).replace(/"/g, '""')}"`);
  const rows = items.map((item) =>
    columns
      .map((col) => {
        const val = col.accessor(item);
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${filename.replace(/\.csv$/, "")}-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  saved("Export successful", `${filename} downloaded`);
}
