"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LatestSipsTable from "@/components/tables/LatestSipsTable";
import Pagination from "@/components/tables/Pagination";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import { getLatestSips, LatestSipGroup } from "@/services";

export default function SipsPage() {
  const [sips, setSips] = useState<LatestSipGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const { selectedOption, customDates } = useGlobalContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

  const fetchSips = useCallback(async () => {
    console.log(
      "Fetching SIPs for advisor:",
      user?.id,
      "timeframe:",
      selectedOption,
      "page:",
      page,
      "customDates:",
      customDates
    );

    if (!user?.id) {
      console.log("No logged-in user, clearing state");
      setSips([]);
      setTotalPages(1);
      setTotal(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIXED: Properly handle custom vs till_date
      let timeframeValue: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom' = 'monthly';
      let startDateValue: string | undefined;
      let endDateValue: string | undefined;

      if (selectedOption === 'custom') {
        timeframeValue = 'custom';
        startDateValue = customDates.start;
        endDateValue = customDates.end;
      } else if (selectedOption === 'till_date') {
        timeframeValue = 'till_date';
        // No dates needed for till_date - it shows ALL records
      } else if (selectedOption) {
        timeframeValue = selectedOption as 'daily' | 'weekly' | 'monthly' | 'yearly';
      }

      console.log("Sending to API - timeframe:", timeframeValue, "startDate:", startDateValue, "endDate:", endDateValue);

      const response = await getLatestSips({
        advisorId: user.id,
        appType: 'fydaa',
        page: page,
        timeframe: timeframeValue,
        startDate: startDateValue,
        endDate: endDateValue,
        search: searchQuery || undefined,
      });

      console.log("Fetched SIPs response:", response);

      if (response?.success) {
        const sipData = response.data;
        setSips(sipData);
        setTotalPages(response.totalPages);
        setTotal(response.totalPages * pageSize);
        setError(null);
      } else {
        setError("Failed to load SIPs");
        setSips([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (e) {
      console.error("Error fetching SIPs:", e);
      setError("Failed to load SIPs");
      setSips([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedOption, customDates, page, searchQuery]);

  useEffect(() => {
    fetchSips();
  }, [fetchSips]);

  // Reset to page 1 when search query or timeframe changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedOption, customDates]);

  // Keyboard shortcut "Cmd/Ctrl + K" focuses search input
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

  return (
    <div>
      <PageBreadcrumb pageTitle="Latest SIPs" />

      <div className="space-y-6">
        <ComponentCard title="SIPs List">
          <form onSubmit={(e) => { e.preventDefault(); }} className="mb-4">
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
                placeholder="Search SIPs..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </form>

          {!isLoading && total > 0 && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>
          )}

          {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

          {isLoading ? (
            <div className="my-10 flex justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : sips.length === 0 ? (
            <div className="m-4">
              <p>No SIPs found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
            </div>
          ) : (
            <>
              <LatestSipsTable rows={sips} error={error} />

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
