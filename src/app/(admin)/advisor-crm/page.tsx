"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
    SalesIcon,
    SalesIconOrange,
    SalesIconGreen,
    ChevronDownIcon,
    NewCustomerIcon
} from '@/icons';
import { useAuth } from "@/context/AuthContext";
import { clientService } from "@/services";
import Select from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { useGlobalContext } from "@/context/GlobalState";
import ClientCrmActions from "@/components/crm/ClientCrmActions";

// Client data interface
interface ClientWithCalls {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    mobileNumber: string;
    networth: number;
    onboardingDate: string;
    followUpDate: string | null;
    previousCallDate: string | null;
    managerName?: string | null;
    notes?: { note: string } | null;
}

// Statistics interface
interface CallStats {
    totalClients: number;
    scheduledCalls: number;
    completedCalls: number;
    missedCalls: number;
    overdueCalls: number;
}

export default function AdvisorCRM() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { appType, selectedOption, customDates } = useGlobalContext();
    const [clients, setClients] = useState<ClientWithCalls[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Initialize page from URL query params or default to 1
    const [page, setPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? parseInt(pageParam, 10) : 1;
    });
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Sync page, showAll, and investmentStatus state with URL when navigating back
    useEffect(() => {
        const pageParam = searchParams.get('page');
        const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
        const showAllParam = searchParams.get('showAll');
        const showAllFromUrl = showAllParam === 'true';
        const investmentStatusParam = searchParams.get('investmentStatus');
        const investmentStatusFromUrl = investmentStatusParam || 'all';
        
        // If URL has a page param, we're navigating back - skip filter reset
        if (pageParam) {
            skipFilterReset.current = true;
        }
        
        if (pageFromUrl !== page) {
            setPage(pageFromUrl);
        }
        
        if (showAllFromUrl !== showAll) {
            setShowAll(showAllFromUrl);
        }
        
        if (investmentStatusFromUrl !== investmentStatus) {
            setInvestmentStatus(investmentStatusFromUrl);
        }
    }, [searchParams]);

    // Helper function to update page and URL
    const updatePage = (newPage: number) => {
        setPage(newPage);
        // Update URL without full page reload, preserving other params like showAll and investmentStatus
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage.toString());
        // Preserve showAll if it's true
        if (showAll) {
            url.searchParams.set('showAll', 'true');
        } else {
            url.searchParams.delete('showAll');
        }
        // Preserve investmentStatus if it's not 'all'
        if (investmentStatus && investmentStatus !== 'all') {
            url.searchParams.set('investmentStatus', investmentStatus);
        } else {
            url.searchParams.delete('investmentStatus');
        }
        window.history.pushState({}, '', url.toString());
    };
    // Initialize showAll from URL query params or default to false
    const [showAll, setShowAll] = useState(() => {
        const showAllParam = searchParams.get('showAll');
        return showAllParam === 'true';
    });
    const [followUpFilter, setFollowUpFilter] = useState<string | undefined>(undefined);
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false); // Follow-up timeframe filter
    const [searchQuery, setSearchQuery] = useState(''); // Search query for filtering clients
    // Initialize investmentStatus from URL query params or default to 'all'
    const [investmentStatus, setInvestmentStatus] = useState<string>(() => {
        const investmentStatusParam = searchParams.get('investmentStatus');
        return investmentStatusParam || 'all';
    });

    // Listen for advisor changes and refresh
    useEffect(() => {
        const handleAdvisorChange = () => {
            window.location.reload();
        };
        window.addEventListener('advisor-changed', handleAdvisorChange);
        return () => window.removeEventListener('advisor-changed', handleAdvisorChange);
    }, []);

    // Track if we should skip the filter reset (when navigating back with a page param in URL)
    const skipFilterReset = useRef(false);
    
    const pageSize = 10; // Number of items per page
    
    // Statistics - keeping as placeholder since call tracking is not in backend yet
    const [stats, setStats] = useState<CallStats>({
        totalClients: 0,
        scheduledCalls: 0,
        completedCalls: 0,
        missedCalls: 0,
        overdueCalls: 0
    });

    // Determine appType filter based on showAll toggle
    const normalizedAppType = showAll 
        ? undefined // Show all when toggled
        : appType?.toLowerCase() === "savestment"
        ? "savestment"
        : appType?.toLowerCase() === "fydaa"
        ? "fydaa"
        : undefined;

    // Fetch clients function (moved outside useEffect so it can be reused)
    const fetchClients = async () => {
        if (!user?.id) {
            setClients([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

            try {

                // Determine timeframe filter
                const timeframeValue = selectedOption as
                    | "daily"
                    | "weekly"
                    | "monthly"
                    | "yearly"
                    | "till_date"
                    | "custom"
                    | undefined;

                // Use selectedAdvisor from localStorage ONLY if user is admin
                const selectedAdvisorId = user?.isAdmin ? localStorage.getItem("selectedAdvisorId") : null;
                const effectiveAdvisorId = selectedAdvisorId ? parseInt(selectedAdvisorId, 10) : user.id;

                // Fetch clients with backend pagination and filters
                const response = await clientService.fetchAdvisorClients(effectiveAdvisorId, {
                    page: searchQuery ? 1 : page,
                    limit: searchQuery ? 1000 : pageSize,
                    appType: normalizedAppType,
                    timeframe: timeframeValue,
                    startDate: selectedOption === "custom" ? customDates.start : undefined,
                    endDate: selectedOption === "custom" ? customDates.end : undefined,
                    followUpTimeframe: followUpFilter,
                    showOverdueOnly: showOverdueOnly,
                    investmentStatus: normalizedAppType === 'fydaa' ? investmentStatus : undefined,
                });

                console.log('Fetched clients for advisor CRM:', response);

                // Map the data to our interface
                const mappedClients: ClientWithCalls[] = response.clients.map((client) => ({
                    id: client.id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    mobileNumber: client.mobileNumber,
                    networth: client.total_investment || 0,
                    onboardingDate: client.createdAt,
                    followUpDate: client.followUpDate || null,
                    previousCallDate: client.previousCallDate || null,
                    managerName: client.managerName || null,
                    notes: client.notes || null,
                }));

                // Apply search filter if query exists
                let finalClients = mappedClients;
                if (searchQuery) {
                    finalClients = mappedClients.filter(client => {
                        const query = searchQuery.toLowerCase();
                        return (
                            client.firstName?.toLowerCase().includes(query) ||
                            client.lastName?.toLowerCase().includes(query) ||
                            client.mobileNumber?.toLowerCase().includes(query) ||
                            client.email?.toLowerCase().includes(query) ||
                            `${client.firstName} ${client.lastName}`.toLowerCase().includes(query)
                        );
                    });
                    
                    // When searching, paginate filtered results client-side
                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    setClients(finalClients.slice(startIndex, endIndex));
                    setTotalPages(Math.ceil(finalClients.length / pageSize));
                    setTotal(finalClients.length);
                } else {
                    setClients(finalClients);
                    setTotalPages(response.pagination.totalPages);
                    setTotal(response.pagination.total);
                }
                
                // Update pagination from backend response
                setTotalPages(response.pagination.totalPages);
                setTotal(response.pagination.total);
                
                // Calculate all client stats from ALL clients (not just current page)
                // We need to fetch all clients for accurate stats
                const allClientsResponse = await clientService.fetchAdvisorClients(effectiveAdvisorId, {
                    page: 1,
                    limit: 10000, // Get all clients for stat calculation
                    appType: normalizedAppType,
                    timeframe: timeframeValue,
                    startDate: selectedOption === "custom" ? customDates.start : undefined,
                    endDate: selectedOption === "custom" ? customDates.end : undefined,
                });

                const allClients: ClientWithCalls[] = allClientsResponse.clients.map((client) => ({
                    id: client.id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    mobileNumber: client.mobileNumber,
                    networth: client.total_investment || 0,
                    onboardingDate: client.createdAt,
                    followUpDate: client.followUpDate || null,
                    previousCallDate: client.previousCallDate || null,
                    managerName: client.managerName || null,
                    notes: client.notes || null,
                }));

                // Calculate statistics
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                const overdueClients: ClientWithCalls[] = [];
                const completedClients: ClientWithCalls[] = [];
                const scheduledClients: ClientWithCalls[] = [];
                
                allClients.forEach(client => {
                    const hasFollowUp = !!client.followUpDate;
                    const hasPrevCall = !!client.previousCallDate;
                    
                    if (!hasFollowUp && !hasPrevCall) return;
                    
                    if (hasFollowUp) {
                        const followUp = new Date(client.followUpDate!);
                        followUp.setHours(0, 0, 0, 0);
                        const isInPast = followUp < now;
                        
                        if (hasPrevCall) {
                            const prev = new Date(client.previousCallDate!);
                            prev.setHours(0, 0, 0, 0);
                            
                            if (isInPast) {
                                if (prev >= followUp) {
                                    completedClients.push(client);
                                } else {
                                    overdueClients.push(client);
                                }
                            } else {
                                scheduledClients.push(client);
                            }
                        } else {
                            if (isInPast) {
                                overdueClients.push(client);
                            } else {
                                scheduledClients.push(client);
                            }
                        }
                    } else if (hasPrevCall) {
                        completedClients.push(client);
                    }
                });
                
                const scheduledCount = scheduledClients.length;
                const completedCount = completedClients.length;
                const overdueCount = overdueClients.length;
                
                // Update stats
                setStats({
                    totalClients: response.pagination.total,
                    scheduledCalls: scheduledCount,
                    completedCalls: completedCount,
                    missedCalls: 0, // Remove this card
                    overdueCalls: overdueCount,
                });
                
            } catch (err) {
                console.error('Error fetching clients:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch clients');
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch clients with pagination
        useEffect(() => {
            fetchClients();
        }, [user?.id, page, showAll, appType, selectedOption, customDates, followUpFilter, showOverdueOnly, searchQuery, investmentStatus]);

    // Reset to page 1 when search query or filters change (but skip when navigating back with URL params)
    useEffect(() => {
        if (skipFilterReset.current) {
            skipFilterReset.current = false;
            return;
        }
        updatePage(1);
    }, [searchQuery, followUpFilter, showOverdueOnly, showAll, appType, selectedOption, investmentStatus]);



    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "—";
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        }).format(date);
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "—";
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // View client profile
    const handleViewClient = (clientId: number) => {
        // Build the current URL with page number, showAll state, and investment status
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (showAll) {
            params.set('showAll', 'true');
        }
        if (investmentStatus && investmentStatus !== 'all') {
            params.set('investmentStatus', investmentStatus);
        }
        const fromUrl = `/advisor-crm?${params.toString()}`;
        
        if (typeof window !== "undefined") {
            sessionStorage.setItem("selectedClientId", clientId.toString());
            // Save the current page URL with all query params
            sessionStorage.setItem("previousPage", fromUrl);
        }
        
        // Navigate to profile with 'from' parameter in URL
        const profileUrl = `/clients/profile?from=${encodeURIComponent(fromUrl)}`;
        router.push(profileUrl);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Advisor CRM</h1>
                    <p className="text-gray-600 dark:text-gray-400">Client Call Tracking & Management</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="xl:flex items-stretch justify-between mt-5 sales-box-row gap-4">
                {/* Total Clients */}
                <div className="col-span-4">
                    <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                        <NewCustomerIcon />
                        <h2 className="numbers-sale text-gray-900">{stats.totalClients}</h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Total Clients
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Scheduled Calls */}
                <div className="col-span-4">
                    <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                        <SalesIcon />
                        <h2 className="numbers-sale text-gray-900">{stats.scheduledCalls}</h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Scheduled Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Completed Calls */}
                <div className="col-span-4">
                    <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                        <SalesIconGreen />
                        <h2 className="numbers-sale text-gray-900">{stats.completedCalls}</h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Completed Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Overdue Calls */}
                <div className="col-span-4">
                    <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                        <SalesIconOrange />
                        <h2 className="numbers-sale text-gray-900">{stats.overdueCalls}</h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Overdue Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>
            </div>

            {/* Client List Table */}
            <div className="bg-white border border-gray-200 rounded-xl dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
                <div className="p-6 border-b border-gray-200 dark:border-white/[0.05] flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client List</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {showAll 
                                ? "Showing all clients from both Fydaa and Savestment"
                                : `Showing ${appType || 'Fydaa'} clients`
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or mobile..."
                                className="w-64 h-11 px-4 pl-10 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Due Follow Ups Dropdown */}
                        <div className="relative">
                            <Select
                                options={[
                                    { value: "today", label: "Today" },
                                    { value: "week", label: "This Week" },
                                    { value: "month", label: "This Month" },
                                    { value: "year", label: "This Year" },
                                    { value: "till_date", label: "Till Date" }
                                ]}
                                placeholder="Due Follow Ups"
                                value={followUpFilter || null}
                                onChange={(option) => {
                                    setFollowUpFilter(option?.value || undefined);
                                    updatePage(1); // Reset to first page when filter changes
                                }}
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>

                        {/* Overdue Only Toggle */}
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={showOverdueOnly}
                                        onChange={(e) => {
                                            setShowOverdueOnly(e.target.checked);
                                            updatePage(1);
                                        }}
                                        className="sr-only"
                                    />
                                    <div className={`block h-8 w-14 rounded-full transition-all duration-300 border-2 ${showOverdueOnly ? 'bg-primary border-primary shadow-lg' : 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-all duration-300 shadow-md ${showOverdueOnly ? 'translate-x-6 shadow-lg' : ''}`}></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Overdue Only
                                </span>
                            </label>
                        </div>

                        {/* Investment Status Filter - Only for Fydaa users */}
                        {normalizedAppType === 'fydaa' && (
                            <div className="relative">
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
                                        url.searchParams.set('page', '1'); // Reset to page 1
                                        if (newStatus !== 'all') {
                                            url.searchParams.set('investmentStatus', newStatus);
                                        } else {
                                            url.searchParams.delete('investmentStatus');
                                        }
                                        // Preserve showAll
                                        if (showAll) {
                                            url.searchParams.set('showAll', 'true');
                                        } else {
                                            url.searchParams.delete('showAll');
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

                        {/* Show All Button */}
                        <button
                            onClick={() => {
                                const newShowAll = !showAll;
                                setShowAll(newShowAll);
                                // Update URL with new showAll state
                                const url = new URL(window.location.href);
                                url.searchParams.set('page', '1');
                                if (newShowAll) {
                                    url.searchParams.set('showAll', 'true');
                                } else {
                                    url.searchParams.delete('showAll');
                                }
                                window.history.pushState({}, '', url.toString());
                                setPage(1); // Reset to first page when toggling
                            }}
                            className={`h-11 px-4 rounded-lg text-sm font-medium transition-colors ${
                                showAll
                                    ? 'bg-brand-500 text-white hover:bg-brand-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {showAll ? 'Show All ✓' : 'Show All'}
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1200px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-500 dark:text-gray-400">Loading clients...</div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-red-500 dark:text-red-400">Error: {error}</div>
                                </div>
                            ) : clients.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-500 dark:text-gray-400">No clients found</div>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Onboarding Date</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Name</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Manager Name</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Email</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Mobile Number</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Networth</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Next Follow Up</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">Previous Call</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-center text-xs dark:text-gray-400">Actions</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {clients.map((client, i) => (
                                            <TableRow key={`${client.id}-${i}`}>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                                                        {formatDate(client.onboardingDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                                                        {`${client.firstName || ""} ${client.lastName || ""}`.trim() || "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{client.managerName || "—"}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{client.email || "—"}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{client.mobileNumber || "—"}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                                                    {formatCurrency(client.networth)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-start">
                                                    <span className={`block font-medium text-sm ${client.followUpDate
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-400 dark:text-gray-600'
                                                        }`}>
                                                        {formatDateTime(client.followUpDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-start">
                                                    <span className="block font-medium text-gray-600 text-sm dark:text-gray-400">
                                                        {formatDateTime(client.previousCallDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
                                                            title="View Client Profile"
                                                            onClick={() => handleViewClient(client.id)}
                                                        >
                                                            <svg 
                                                                className="w-6 h-6 text-gray-600 dark:text-gray-400" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path 
                                                                    strokeLinecap="round" 
                                                                    strokeLinejoin="round" 
                                                                    strokeWidth={2} 
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                                                />
                                                                <path 
                                                                    strokeLinecap="round" 
                                                                    strokeLinejoin="round" 
                                                                    strokeWidth={2} 
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                                                />
                                                            </svg>
                                                        </button>
                                                        <ClientCrmActions
                                                            client={client}
                                                            onFollowUpSaved={(clientId, dateTime) => {
                                                                setClients((prevClients) =>
                                                                    prevClients.map((c) =>
                                                                        c.id === clientId
                                                                            ? { ...c, followUpDate: dateTime }
                                                                            : c
                                                                    )
                                                                );
                                                            }}
                                                            onNotesSaved={(clientId, note) => {
                                                                setClients((prevClients) =>
                                                                    prevClients.map((c) =>
                                                                        c.id === clientId
                                                                            ? { ...c, notes: { note } }
                                                                            : c
                                                                    )
                                                                );
                                                            }}
                                                            onCallConnected={() => {
                                                                fetchClients();
                                                            }}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {!isLoading && !error && clients.length > 0 && totalPages > 1 && (
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 dark:border-white/[0.06]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        {/* Page information */}
                        <div className="text-center sm:text-left">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Showing{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    page {page}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {totalPages}
                                </span>
                                <span className="mx-2 text-gray-300 dark:text-gray-600">
                                    ·
                                </span>
                                {total} total clients
                            </span>
                        </div>

                        {/* Pagination controls */}
                        <div className="flex justify-center sm:justify-end">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={updatePage}
                                showGoToPage
                            />
                        </div>
                    </div>
                </div>
            )}
            </div>

        </div>
    );
}
