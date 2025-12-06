"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSipMfTransactions, SipMfTransaction, type FrontendStatus } from "@/services/sipMfTransactionService";
import ComponentCard from "../common/ComponentCard";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

const StatusBadge = ({ status }: { status: FrontendStatus }) => {
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

export default function LatestSipsList() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<SipMfTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FrontendStatus | 'all'>('all');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'PARTIAL', label: 'Partial' },
    { value: 'IN_PROCESS', label: 'In Process' },
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const response = await getSipMfTransactions({
          page: 1,
          limit: 10,
          timeframe: 'yearly',
          count: 1,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        });

        if (response?.success) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error("Error fetching latest SIP transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.id, selectedStatus]);

  const handleViewAllClick = () => {
    router.push('/sips');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  // Custom title node with View All button and dropdown
  const TitleWithViewAllAndDropdown = (
    <div className="flex items-center justify-between select-none pt-[1.25rem] pb-[0.625rem] px-6">
      <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Latest SIP Transactions
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleViewAllClick}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800 dark:hover:bg-blue-900/50 transition-colors"
        >
          View All
        </button>
        <div className="relative w-48">
          <Select
            options={statusOptions}
            placeholder="All Status"
            value={selectedStatus}
            onChange={(option: { value: string; label: string } | null) => 
              setSelectedStatus((option?.value as FrontendStatus | 'all') || 'all')
            }
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon/>
              </span>
        </div>
      </div>
    </div>
  );

  return (
    <ComponentCard title={TitleWithViewAllAndDropdown} className="h-full" desc="">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No SIP transactions found</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/[0.02] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-left text-gray-900 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">Date</th>
                <th className="px-6 py-3 text-xs font-bold text-left text-gray-900 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">User Name</th>
                <th className="px-6 py-3 text-xs font-bold text-center text-gray-900 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">Total Orders</th>
                <th className="px-6 py-3 text-xs font-bold text-left text-gray-900 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {transactions.map((transaction, index) => {
                const userName = `${transaction.userInfo.firstName || ""} ${transaction.userInfo.lastName || ""}`.trim() || "—";
                return (
                  <tr
                    key={`${transaction.transactionId}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {userName || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                      {transaction.totalOrders}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={transaction.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ComponentCard>
  );
}
