"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SipMfTransaction } from "@/services/sipMfTransactionService";

interface Props {
  transactions: SipMfTransaction[];
  error: string | null;
}

const StatusBadge = ({ status }: { status: 'IN_PROCESS' | 'FAILED' | 'SUCCESS' | 'PARTIAL' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  let variantClasses = "";

  switch (status) {
    case 'SUCCESS':
      variantClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case 'FAILED':
      variantClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case 'IN_PROCESS':
      variantClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      break;
    case 'PARTIAL':
      variantClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      break;
  }

  const statusText = status === 'IN_PROCESS' ? 'In Process' : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {statusText}
    </span>
  );
};

const OrderStateBadge = ({ state }: { state: 'submitted' | 'failed' | 'successful' }) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  let variantClasses = "";

  switch (state) {
    case 'successful':
      variantClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case 'failed':
      variantClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case 'submitted':
      variantClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
  }

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </span>
  );
};

export default function SipMfTransactionsTable({ transactions, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedRows(new Set());
  }, [transactions]);

  const toggleRow = (transactionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewClient = (clientId: number) => {
    const currentPath = pathname || "/sips";
    const currentQuery = searchParams.toString();
    const fromUrl = currentQuery ? `${currentPath}?${currentQuery}` : currentPath;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedClientId", clientId.toString());
      sessionStorage.setItem("sipsSkipNextPageReset", "true");
      sessionStorage.setItem("previousPage", fromUrl);
    }

    const profileUrl = `/clients/profile?from=${encodeURIComponent(fromUrl)}`;
    router.push(profileUrl);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getReferredByName = (referredUserInfo: SipMfTransaction['referredUserInfo']) => {
    if (!referredUserInfo) return "—";
    return `${referredUserInfo.firstName || ""} ${referredUserInfo.lastName || ""}`.trim() || "—";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1400px]">
          {error && <div className="m-4"><p style={{ color: "red" }}>{error}</p></div>}
          {!error && transactions.length > 0 ? (
            <table className="w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400 w-12"></th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Transaction ID</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">User Name</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Referred By</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Email</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Phone</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Total Orders</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Successful</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Failed</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Total Amount</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Processed</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {transactions.map((transaction) => {
                  const isExpanded = expandedRows.has(transaction.transactionId);
                  const userName = `${transaction.userInfo.firstName || ""} ${transaction.userInfo.lastName || ""}`.trim() || "—";
                  const canViewClient = Boolean(transaction.userId) && userName !== "—";

                  return (
                    <React.Fragment key={transaction.transactionId}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 text-start">
                          <button
                            onClick={() => toggleRow(transaction.transactionId)}
                            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            <svg
                              className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {transaction.transactionId}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-start">
                          {canViewClient ? (
                            <button
                              type="button"
                              onClick={() => handleViewClient(transaction.userId)}
                              className="block font-medium text-blue-600 text-theme-sm hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-left"
                              title="View Client Profile"
                            >
                              {userName}
                            </button>
                          ) : (
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {userName}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {getReferredByName(transaction.referredUserInfo)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.userInfo.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.userInfo.mobileNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                          {transaction.totalOrders}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                          {transaction.successfulOrders}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                          {transaction.failedOrders}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatCurrency(transaction.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatCurrency(transaction.processedAmount)}
                        </td>
                        <td className="px-4 py-3 text-start">
                          <StatusBadge status={transaction.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={13} className="px-0 py-0 bg-gray-50 dark:bg-white/[0.01]">
                            <div className="px-8 py-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Order Details ({transaction.orders.length} orders)
                              </h4>
                              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.05]">
                                <table className="w-full">
                                  <thead className="bg-gray-100 dark:bg-white/[0.02]">
                                    <tr>
                                      <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Scheme</th>
                                      <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Scheme Name</th>
                                      <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">State</th>
                                      <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Amount</th>
                                      <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Processed</th>
                                      <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Error</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                                    {transaction.orders.map((order) => (
                                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                          {order.scheme}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                          {order.schemeName}
                                        </td>
                                        <td className="px-4 py-3 text-start">
                                          <OrderStateBadge state={order.state} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                          {formatCurrency(order.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                          {formatCurrency(order.processed_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                          {order.last_error || order.failure_code || "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            !error && <div className="m-4"><p>No SIP MF transactions found.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
