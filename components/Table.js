import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";

const Table = ({
  children,
  className = "",
  sourceData = [
    {
      _id: Number,
      customer: {
        userId: String,
        name: String,
        email: String,
        last_active: Date,
      },
      status: Boolean,
      subcription: Boolean,
    },
  ] || {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    serialNumber: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    product_image: {
      type: String,
      required: false,
    },
    product_information: {
      company: {
        type: String,
        required: false,
      },
      details: {
        type: String,
        required: false,
      },
    },
    expiration_date: {
      product_manufacture: {
        type: Date,
      },
      product_expire: {
        type: Date,
      },
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
}) => {
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

  //   const avatarFor = (name = "User" || ``) => ``;

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left brand-text-muted">
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border brand-border text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                />
              </th>
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Purchase</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sourceData.map((row, idx) => {
              const invoice = `#${row._id ?? idx + 1}`;
              const name = row.customer?.name || "-";
              const email = row.customer?.email || "-";
              const date = formatDate(row.customer?.last_active);
              const paid = !!row.status;
              const sub = !!row.subcription;
              const purchase = sub
                ? "Monthly subscription"
                : "One-time purchase";
              return (
                <tr
                  key={row._id || idx}
                  className={`border-t brand-border hover:bg-black/5`}
                >
                  <td className="px-6 py-4 align-middle">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border brand-border text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                    />
                  </td>
                  <td className="px-6 py-4 align-middle font-medium text-[var(--color-text)] whitespace-nowrap">
                    {invoice}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {/* <Image
                        src={row.customer?.avatar || "/default-avatar.png"}
                        alt={name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      /> */}
                      <div>
                        <div className="text-[var(--color-text)] font-medium">
                          {name}
                        </div>
                        <div className="brand-text-muted text-xs">{email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap brand-text-muted">
                    {date}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    {paid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
                        <Check className="h-3.5 w-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 text-gray-700 px-2.5 py-1 text-xs font-medium">
                        Refunded
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle brand-text-muted">
                    {purchase}
                  </td>
                  <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                    <button className="text-gray-600 hover:text-gray-800 mr-4">
                      Delete
                    </button>
                    <button className="text-violet-600 hover:text-violet-700">
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
