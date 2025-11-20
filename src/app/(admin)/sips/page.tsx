"use client";

import React, { useState, useEffect, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SipMfTransactionsTable from "@/components/tables/SipMfTransactionsTable";
import Pagination from "@/components/tables/Pagination";
import Select from "@/components/form/Select";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import { getSipMfTransactions, SipMfTransaction, type FrontendStatus } from "@/services/sipMfTransactionService";

export default function SipsPage() {
  const [transactions, setTransactions] = useState<SipMfTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FrontendStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const { selectedOption, customDates } = useGlobalContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

  const prevFiltersRef = useRef({ searchQuery, statusFilter, selectedOption, startDate: customDates.start, endDate: customDates.end });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'PARTIAL', label: 'Partial' },
    { value: 'IN_PROCESS', label: 'In Process' },
  ];

  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.searchQuery !== searchQuery ||
      prevFiltersRef.current.statusFilter !== statusFilter ||
      prevFiltersRef.current.selectedOption !== selectedOption ||
      prevFiltersRef.current.startDate !== customDates.start ||
      prevFiltersRef.current.endDate !== customDates.end;

    if (filtersChanged && page !== 1) {
      setPage(1);
    }

    prevFiltersRef.current = { searchQuery, statusFilter, selectedOption, startDate: customDates.start, endDate: customDates.end };
  }, [searchQuery, statusFilter, selectedOption, customDates.start, customDates.end, page]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) {
        setTransactions([]);
        setTotalPages(1);
        setTotal(0);
        setError(null);
        return;
      }

      setIsLoading(true);
      setTransactions([]);
      
      try {
        const timeframeValue = selectedOption as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom' | undefined;

        const response = await getSipMfTransactions({
          page,
          limit: pageSize,
          timeframe: timeframeValue,
          startDate: selectedOption === 'custom' ? customDates.start : undefined,
          endDate: selectedOption === 'custom' ? customDates.end : undefined,
          search: searchQuery || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });

        if (response.success) {
          const newTransactions = [...response.data];
          setTransactions(newTransactions);
          setTotalPages(response.pagination.totalPages);
          setTotal(response.pagination.totalItems);
          setError(null);
        } else {
          setError("Failed to load SIP MF transactions");
          setTransactions([]);
          setTotalPages(1);
          setTotal(0);
        }
      } catch (e) {
        console.error("Error fetching SIP MF transactions:", e);
        setError("Failed to load SIP MF transactions");
        setTransactions([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, selectedOption, customDates.start, customDates.end, page, searchQuery, statusFilter]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const startRange = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRange = Math.min(page * pageSize, total);

  return (
    <div>
      <PageBreadcrumb pageTitle="SIP MF Transactions" />

      <div className="space-y-6">
        <ComponentCard title="SIP MF Transactions List">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row">
            {/* Search Box */}
            <form onSubmit={(e) => { e.preventDefault(); }} className="flex-1">
              <div className="relative search-box">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </form>

            {/* Status Filter - Using Custom Select */}
            <div className="w-full sm:w-48">
              <Select
                options={statusOptions}
                placeholder="All Status"
                value={statusFilter}
                onChange={(option: { value: string; label: string } | null) => 
                  setStatusFilter((option?.value as FrontendStatus | 'all') || 'all')
                }
              />

            </div>
          </div>

          {!isLoading && total > 0 && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {startRange} to {endRange} of {total} total transactions
            </div>
          )}

          {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

          {isLoading ? (
            <div className="my-10 flex justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="m-4">
              <p>No SIP MF transactions found.</p>
            </div>
          ) : (
            <>
              <SipMfTransactionsTable 
                key={`page-${page}-${searchQuery}-${statusFilter}`}
                transactions={transactions} 
                error={error} 
              />

              <div className="mt-4 flex justify-start">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
