import React, { useState } from "react";

export interface AdminModalField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "image" | "tags" | "monthYear" | "select";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  // Untuk field image: atur apakah boleh memilih banyak file atau hanya satu.
  // Default: true (boleh multiple) supaya tidak mengubah perilaku lama.
  multiple?: boolean;
}

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  fields: AdminModalField[];
  initialData?: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  isSaving?: boolean;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  title,
  fields,
  initialData,
  onClose,
  onSubmit,
  isSaving = false,
}) => {
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>({});
  const [tagValues, setTagValues] = useState<Record<string, string[]>>({});
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const data: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.type === "image") {
        // Gunakan preview yang sudah tersimpan sebagai sumber kebenaran
        data[field.name] = imagePreviews[field.name] ?? [];
      } else if (field.type === "tags") {
        data[field.name] = tagValues[field.name] ?? [];
      } else if (field.type === "monthYear") {
        const month = (fd.get(`${field.name}_month`) as string) || "";
        const year = (fd.get(`${field.name}_year`) as string) || "";
        data[field.name] = month && year ? `${month} ${year}` : "";
      } else {
        data[field.name] = fd.get(field.name) ?? "";
      }
    });
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 6.75l10.5 10.5m0-10.5l-10.5 10.5"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-140px)] overflow-y-auto px-5 py-4 space-y-4"
        >
          {fields.map((field) => {
            if (field.type === "monthYear") {
              const months = [
                "Bulan",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mei",
                "Jun",
                "Jul",
                "Agu",
                "Sep",
                "Okt",
                "Nov",
                "Des",
              ];

              const currentYear = new Date().getFullYear();
              const years: string[] = ["Tahun"];
              for (let y = currentYear; y >= currentYear - 30; y -= 1) {
                years.push(String(y));
              }

              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    {field.label}
                  </label>
                  <div className="flex gap-2">
                    <select
                      name={`${field.name}_month`}
                      className="w-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      defaultValue=""
                    >
                      {months.map((m, idx) => (
                        <option key={m} value={idx === 0 ? "" : m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      name={`${field.name}_year`}
                      className="w-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      defaultValue=""
                    >
                      {years.map((y, idx) => (
                        <option key={y} value={idx === 0 ? "" : y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    {field.label}
                  </label>
                  <select
                    name={field.name}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    defaultValue={(initialData?.[field.name] as string) ?? ""}
                  >
                    {(field.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.type === "tags") {
              const currentTags = tagValues[field.name] ?? [];
              const currentInput = tagInputs[field.name] ?? "";

              const addTag = (raw: string) => {
                const value = raw.trim();
                if (!value) return;
                setTagValues((prev) => {
                  const existing = prev[field.name] ?? [];
                  if (existing.includes(value)) return prev;
                  return { ...prev, [field.name]: [...existing, value] };
                });
                setTagInputs((prev) => ({ ...prev, [field.name]: "" }));
              };

              const removeTag = (value: string) => {
                setTagValues((prev) => {
                  const existing = prev[field.name] ?? [];
                  return {
                    ...prev,
                    [field.name]: existing.filter((t) => t !== value),
                  };
                });
              };

              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    {field.label}
                  </label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {currentTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-200"
                      >
                        <span>{tag}</span>
                        <span className="text-[10px] text-slate-500">×</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name={field.name}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={field.placeholder ?? "Ketik tag lalu tekan Enter"}
                    value={currentInput}
                    onChange={(e) =>
                      setTagInputs((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(currentInput);
                      }
                    }}
                  />
                </div>
              );
            }

            if (field.type === "image") {
              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type="file"
                    name={field.name}
                    multiple={field.multiple !== false}
                    accept="image/*"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => {
                      const files = e.target.files;
                      const urls = files
                        ? Array.from(files).map((file) => URL.createObjectURL(file))
                        : [];

                      setImagePreviews((prev) => {
                        // Default: multiple true (append). Kalau multiple === false, replace.
                        if (field.multiple === false) {
                          return {
                            ...prev,
                            [field.name]: urls,
                          };
                        }

                        return {
                          ...prev,
                          [field.name]: [...(prev[field.name] ?? []), ...urls],
                        };
                      });
                    }}
                  />
                  {imagePreviews[field.name] && imagePreviews[field.name].length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {imagePreviews[field.name].map((src, idx) => (
                        <div
                          key={idx}
                          className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={src}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    {field.label}
                  </label>
                  <textarea
                    name={field.name}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    placeholder={field.placeholder}
                    defaultValue={(initialData?.[field.name] as string) ?? ""}
                  />
                </div>
              );
            }

            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  {field.label}
                </label>
                <input
                  type={field.type === "number" ? "number" : "text"}
                  name={field.name}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={field.placeholder}
                  defaultValue={(initialData?.[field.name] as string) ?? ""}
                />
              </div>
            );
          })}

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
