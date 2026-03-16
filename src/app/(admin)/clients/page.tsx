"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdvisorClientsTable, { AdvisorClientRow } from "@/components/tables/AdvisorClientsTable";
import Pagination from "@/components/tables/Pagination";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import { clientService } from "@/services";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state from URL query parameters on first render
  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  const initialSearchQuery = useMemo(() => {
    return searchParams.get("search") ?? "";
  }, [searchParams]);

  const initialInvestmentStatus = useMemo(() => {
    return searchParams.get("investmentStatus") ?? "all";
  }, [searchParams]);

  const [clients, setClients] = useState<AdvisorClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [investmentStatus, setInvestmentStatus] = useState(initialInvestmentStatus);

  const { user } = useAuth();
  const { appType, selectedOption, customDates } = useGlobalContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextPageResetRef = useRef(false);
  const previousFiltersRef = useRef({
    searchQuery: initialSearchQuery,
    appType,
    selectedOption,
    investmentStatus: initialInvestmentStatus,
  });
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
      page,
      "search:",
      searchQuery
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
      const normalizedAppType =
        appType?.toLowerCase() === "savestment"
          ? "savestment"
          : appType?.toLowerCase() === "fydaa"
          ? "fydaa"
          : undefined;

      const timeframeValue = selectedOption as
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "till_date"
        | "custom"
        | undefined;

      const response = await clientService.fetchAdvisorClients(user.id, {
        appType: normalizedAppType,
        page: searchQuery ? 1 : page,
        limit: searchQuery ? 1000 : pageSize,
        timeframe: timeframeValue,
        startDate: selectedOption === "custom" ? customDates.start : undefined,
        endDate: selectedOption === "custom" ? customDates.end : undefined,
        investmentStatus: normalizedAppType === 'fydaa' ? investmentStatus : undefined,
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
        onboardingDate: u.createdAt,
        hasSIP: u.hasSIP === 1,
        managerName: u.managerName ?? null,
      }));

      // Sort by onboarding date (newest first)
      const sortedClients = mappedClients.sort((a, b) => {
        return new Date(b.onboardingDate).getTime() - new Date(a.onboardingDate).getTime();
      });

      // Apply search filter
      let filteredUsers = sortedClients;
      if (searchQuery) {
        filteredUsers = sortedClients.filter((client) => {
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
        setClients(sortedClients);
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
  }, [user?.id, appType, selectedOption, customDates, page, searchQuery, investmentStatus]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // When navigating back from the profile page, skip the first automatic page reset
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("clientsSkipNextPageReset") === "true") {
      skipNextPageResetRef.current = true;
      sessionStorage.removeItem("clientsSkipNextPageReset");
    }
  }, []);

  // Reset to page 1 when search query, appType, timeframe, or investmentStatus changes
  useEffect(() => {
    const prev = previousFiltersRef.current;
    const hasChanged =
      prev.searchQuery !== searchQuery ||
      prev.appType !== appType ||
      prev.selectedOption !== selectedOption ||
      prev.investmentStatus !== investmentStatus;

    previousFiltersRef.current = { searchQuery, appType, selectedOption, investmentStatus };

    if (!hasChanged) return;

    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
      return;
    }

    setPage(1);
  }, [searchQuery, appType, selectedOption, investmentStatus]);

  // Keep URL query parameters in sync with pagination and search state
  useEffect(() => {
    // Start from current search params so we preserve unrelated query params
    const params = new URLSearchParams(searchParams.toString());

    if (page && page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }

    if (investmentStatus && investmentStatus !== 'all') {
      params.set("investmentStatus", investmentStatus);
    } else {
      params.delete("investmentStatus");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    // Avoid unnecessary router.replace calls if nothing changed
    if (newQuery === currentQuery) return;

    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl);
  }, [page, searchQuery, investmentStatus, pathname, router, searchParams]);

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
          <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex-1 w-full"
            >
            <div className="relative search-box">
              <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
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

            {/* Investment Status Filter - Only for Fydaa users */}
            {appType?.toLowerCase() === 'fydaa' && (
              <div className="relative min-w-[180px]">
                <Select
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" }
                  ]}
                  placeholder="Investment Status"
                  value={investmentStatus === 'all' ? null : investmentStatus}
                  onChange={(option) => {
                    const newStatus = option?.value || 'all';
                    setInvestmentStatus(newStatus);
                    // Update URL with new investment status
                    const url = new URL(window.location.href);
                    url.searchParams.set('page', '1');
                    if (newStatus !== 'all') {
                      url.searchParams.set('investmentStatus', newStatus);
                    } else {
                      url.searchParams.delete('investmentStatus');
                    }
                    // Preserve search query
                    if (searchQuery) {
                      url.searchParams.set('search', searchQuery);
                    }
                    window.history.pushState({}, '', url.toString());
                    setPage(1);
                  }}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            )}
          </div>

          {!isLoading && total > 0 && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {clients.length} of {total} total clients
              {searchQuery && ` (filtered by "${searchQuery}")`}
              {appType?.toLowerCase() === 'fydaa' && investmentStatus !== 'all' && ` with ${investmentStatus} investment status`}
            </div>
          )}

          {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

          {isLoading ? (
            <div className="my-10 flex justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : clients.length === 0 ? (
            <div className="m-4">
              <p>No clients found{searchQuery ? ` matching "${searchQuery}"` : ""}.</p>
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
