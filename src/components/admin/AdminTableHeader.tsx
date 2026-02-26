import React from "react";
import { Search, Plus, Download } from "lucide-react";

interface AdminTableHeaderProps {
  placeholder?: string;
  addLabel?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  onExportClick?: () => void;
  rightSlot?: React.ReactNode;
}

const AdminTableHeader: React.FC<AdminTableHeaderProps> = ({
  placeholder = "Search",
  addLabel = "Tambah Data",
  onSearchChange,
  onAddClick,
  onExportClick,
  rightSlot,
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex-1 max-auto w-full">
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-xs border border-slate-100">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}
        {onExportClick && (
          <button
            type="button"
            onClick={onExportClick}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminTableHeader;
