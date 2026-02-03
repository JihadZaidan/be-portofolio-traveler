import React from "react";
import Skeleton from "../ui/Skeleton";

export interface Column {
  header: string;
  accessor: string;
  type?:
    | "text"
    | "image"
    | "svg"
    | "status"
    | "action"
    | "email"
    | "date"
    | "textarea"
    | "number"
    | "video"
    | "json";
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: Array<Record<string, unknown> & { id?: number }>;
  onDelete?: (id?: number) => void;
  onEdit?: (id?: number) => void;
  itemsPerPage?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  onDelete,
  onEdit,
  itemsPerPage = 5,
  currentPage = 1,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
}) => {

  const computedTotalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const effectiveTotalPages =
    typeof totalPages === "number"
      ? Math.max(1, Math.max(totalPages, computedTotalPages))
      : computedTotalPages;
  const effectiveCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages);
  const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const renderCell = (column: Column, row: Record<string, unknown>) => {
    if (column.render) {
      return column.render(row[column.accessor], row);
    }

    switch (column.type) {
      case "image":
        return (
          <div className="flex-shrink-0 h-8 w-8">
            <img
              className="h-8 w-8 rounded-lg object-cover border border-slate-200"
              src={row[column.accessor] as string}
              alt=""
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.png";
              }}
            />
          </div>
        );
      case "svg":
        return (
          <div className="flex-shrink-0 h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <img
              className="h-6 w-6 object-contain"
              src={row[column.accessor] as string}
              alt=""
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-icon.png";
              }}
            />
          </div>
        );
      case "video":
        return (
          <div className="flex-shrink-0 h-8 w-8">
            <video
              className="h-8 w-8 rounded-lg object-cover"
              src={row[column.accessor] as string}
            />
          </div>
        );
      case "json":
        return (
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[11px] text-gray-600">
              {row[column.accessor] as string}
            </span>
          </div>
        );
      case "textarea":
        return (
          <div className="max-w-md text-[11px] text-slate-600">
            <p className="line-clamp-2 leading-relaxed">{row[column.accessor] as string}</p>
          </div>
        );
      case "action":
        return (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(row.id as number)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(row.id as number)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.92a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.92a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165M9 5.25V3m0 0V2.25L9 2.25A2.25 2.25 0 0111.25 0h1.5A2.25 2.25 0 0115 2.25V3m-3 0v1.5H9m3 0V3m0 0H9m3 0H9"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      case "date":
        return (
          <div className="text-[11px] text-slate-600">
            {row[column.accessor] as string}
          </div>
        );
      default:
        return (
          <div className="text-[11px] text-slate-700">
            {row[column.accessor] as string}
          </div>
        );
    }
  };

  return (
    <div className="overflow-visible rounded-2xl border border-slate-100 bg-white shadow-xs">
      <div className="min-w-full inline-block align-middle">
        <div className="relative overflow-x-auto overflow-y-visible">
          <table className="w-full table-fixed divide-y divide-slate-100">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 w-12">
                  No
                </th>
                {columns.map((column, index) => {
                  const isLongText =
                    ["description", "title"].includes(column.accessor) ||
                    column.type === "textarea";
                  const isAction = column.type === "action";
                  return (
                    <th
                      key={index}
                      className={`px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50${
                        isAction ? " w-24" : ""
                      }${
                        isLongText
                          ? " whitespace-normal break-words max-w-md"
                          : " truncate"
                      }`}
                    >
                      {column.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-300 w-12">
                        <Skeleton className="h-4 w-6" rounded="rounded" />
                      </td>
                      {columns.map((col, cidx) => (
                        <td
                          key={cidx}
                          className={`px-4 py-3${
                            col.type === "action" ? " w-24" : ""
                          }${
                            ["description", "title"].includes(col.accessor) ||
                            col.type === "textarea"
                              ? " whitespace-normal break-words max-w-md"
                              : " whitespace-nowrap"
                          }`}
                        >
                          <Skeleton
                            className={`h-4 ${col.type === "action" ? "w-16" : "w-24"}`}
                            rounded="rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginatedData.length > 0
                  ? paginatedData.map((row, index) => (
                      <tr key={row.id || index} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-500 w-12">
                          {(effectiveCurrentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-4 py-3 text-[11px] text-slate-700${
                              column.type === "action" ? " w-24" : ""
                            }${
                              ["description", "title"].includes(column.accessor) ||
                              column.type === "textarea"
                                ? " whitespace-normal break-words max-w-md"
                                : " truncate"
                            }`}
                          >
                            {renderCell(column, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  : (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No data found.
                        </td>
                      </tr>
                    )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-700">Show result:</span>
          <select
            className="px-2 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange?.(effectiveCurrentPage - 1)}
            disabled={effectiveCurrentPage === 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`px-2 py-0.5 rounded-lg text-[11px] ${
                effectiveCurrentPage === page
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange?.(effectiveCurrentPage + 1)}
            disabled={effectiveCurrentPage === effectiveTotalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
