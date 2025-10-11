import React from "react";
import Image from "next/image";
import { Check, X, Edit2, Trash2 } from "lucide-react";

const Table = ({
  children,
  className = "",
  columns = [],
  data = [],
  onEdit = null,
  onDelete = null,
  selectable = true,
  actions = true,
  autoColumns = false, // เพิ่ม prop สำหรับสร้างคอลัมน์อัตโนมัติ
}) => {
  // ฟังก์ชันสร้างคอลัมน์อัตโนมัติจากข้อมูล
  const generateColumns = (data) => {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    const excludeFields = ["password", "passwordHash", "__v"]; // ฟิลด์ที่ไม่ต้องแสดง

    return Object.keys(firstRow)
      .filter((key) => !excludeFields.includes(key))
      .map((key) => ({
        key: key,
        header: formatHeader(key),
        accessor: key,
        type: detectFieldType(key, firstRow[key]),
      }));
  };

  // ฟังก์ชันแปลงชื่อฟิลด์เป็นหัวตาราง
  const formatHeader = (key) => {
    const headers = {
      _id: "ID",
      id: "ID",
      fName: "ชื่อ",
      lName: "นามสกุล",
      email: "อีเมล",
      phoneNum: "เบอร์โทร",
      address: "ที่อยู่",
      regisDate: "วันที่สมัคร",
      updateDate: "อัปเดตล่าสุด",
      isActive: "สถานะ",
      createdAt: "วันที่สร้าง",
      updatedAt: "อัปเดตล่าสุด",
    };

    return (
      headers[key] ||
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    );
  };

  // ฟังก์ชันตรวจสอบประเภทข้อมูล
  const detectFieldType = (key, value) => {
    if (key.includes("Date") || key.includes("At")) return "date";
    if (key === "email") return "email";
    if (key.includes("phone") || key.includes("Phone")) return "phone";
    if (typeof value === "boolean") return "boolean";
    if (key.includes("price") || key.includes("amount")) return "currency";
    return "text";
  };

  // ใช้คอลัมน์ที่ส่งมา หรือสร้างอัตโนมัติ
  const finalColumns =
    columns.length > 0 ? columns : autoColumns ? generateColumns(data) : [];
  const formatDate = (d) => {
    try {
      const date = new Date(d || Date.now());
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "date":
        return formatDate(value);
      case "boolean":
        return value ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
            <Check className="h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-xs font-medium">
            <X className="h-3.5 w-3.5" /> Inactive
          </span>
        );
      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {value}
          </a>
        );
      case "phone":
        return (
          <a
            href={`tel:${value}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {value}
          </a>
        );
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      default:
        return value.toString();
    }
  };

  const renderCell = (row, column) => {
    const value = column.accessor ? row[column.accessor] : row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return formatValue(value, column.type);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left brand-text-muted">
              {selectable && (
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border brand-border text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                  />
                </th>
              )}
              {finalColumns.map((column, idx) => (
                <th
                  key={column.key || idx}
                  className={`px-6 py-4 font-medium text-gray-900 ${
                    column.className || ""
                  }`}
                >
                  {column.header || column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right font-medium text-gray-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    finalColumns.length +
                    (selectable ? 1 : 0) +
                    (actions ? 1 : 0)
                  }
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {selectable && (
                    <td className="px-6 py-4 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border brand-border text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                      />
                    </td>
                  )}
                  {finalColumns.map((column, colIdx) => (
                    <td
                      key={column.key || colIdx}
                      className={`px-6 py-4 align-middle select-text${
                        column.cellClassName || ""
                      }`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer duration-200"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors cursor-pointer duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
