"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdvisorClientsTable, { AdvisorClientRow } from "@/components/tables/AdvisorClientsTable";
import Pagination from "@/components/tables/Pagination";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import { clientService } from "@/services";

export default function ClientsPage() {
  const [clients, setClients] = useState<AdvisorClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const { appType, selectedOption, customDates } = useGlobalContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

  const fetchClients = useCallback(async () => {
    console.log(
      "Fetching clients for advisor:",
      user?.id,
      "app type:",
      appType,
      "timeframe:",
      selectedOption,
      "page:",
      page
    );

    if (!user?.id) {
      console.log("No logged-in user, clearing state");
      setClients([]);
      setTotalPages(1);
      setTotal(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      const normalizedAppType = appType?.toLowerCase() === 'savestment' 
        ? 'savestment' 
        : appType?.toLowerCase() === 'fydaa' 
        ? 'fydaa' 
        : undefined;

      // ✅ Use selectedOption from global context
      const timeframeValue = selectedOption as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom' | undefined;

      const response = await clientService.fetchAdvisorClients(user.id, {
        appType: normalizedAppType,
        page: searchQuery ? 1 : page, // Always page 1 when searching
        limit: searchQuery ? 1000 : pageSize, // Fetch more records when searching
        timeframe: timeframeValue,
        startDate: selectedOption === 'custom' ? customDates.start : undefined,
        endDate: selectedOption === 'custom' ? customDates.end : undefined,
      });

      console.log("Fetched response:", response);

      const mappedClients = response.clients.map((u) => ({
        id: u.id,
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        email: u.email ?? "",
        mobileNumber: u.mobileNumber ?? "",
        app: u.fromApp ?? "Unknown",
        networth: u.total_investment ?? 0,
      }));


      // Apply search filter
      let filteredUsers = mappedClients;
      if (searchQuery) {
        filteredUsers = mappedClients.filter((client) => {
          const matches =
            client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.app.toLowerCase().includes(searchQuery.toLowerCase());
          return matches;
        });
        
        // When searching, paginate filtered results client-side
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setClients(filteredUsers.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(filteredUsers.length / pageSize));
        setTotal(filteredUsers.length);
      } else {
        setClients(mappedClients);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }

      setError(null);
    } catch (e) {
      console.error("Error fetching clients:", e);
      setError("Failed to load clients");
      setClients([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, appType, selectedOption, customDates, page, searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Reset to page 1 when search query, appType, or timeframe changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, appType, selectedOption]);

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
      <PageBreadcrumb pageTitle="Clients" />

      <div className="space-y-6">
        <ComponentCard title="Clients List">
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
                placeholder="Search clients..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </form>

          {!isLoading && total > 0 && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {clients.length} of {total} total clients
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>
          )}

          {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

          {isLoading ? (
            <div className="my-10 flex justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : clients.length === 0 ? (
            <div className="m-4">
              <p>No clients found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
            </div>
          ) : (
            <>
              <AdvisorClientsTable rows={clients} error={error} />

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
