"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
    SalesIcon,
    SalesIconOrange,
    SalesIconGreen,
    SalesIconViolet,
    PhoneIcon,
    CalenderIcon,
    ChevronDownIcon
} from '@/icons';
import { useAuth } from "@/context/AuthContext";
import { clientService, advisorService, smartfloService } from "@/services";
import Pagination from "@/components/tables/Pagination";
import { useGlobalContext } from "@/context/GlobalState";
import { useSmartfloToken } from "@/context/SmartfloTokenContext";

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
    const { user } = useAuth();
    const { appType, selectedOption, customDates } = useGlobalContext();
    const { token: smartfloToken, isTokenValid, generateAndSetToken } = useSmartfloToken();
    const [clients, setClients] = useState<ClientWithCalls[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showAll, setShowAll] = useState(false); // Toggle for showing all clients
    const [followUpFilter, setFollowUpFilter] = useState<string | undefined>(undefined); // Follow-up timeframe filter
    const [searchQuery, setSearchQuery] = useState(''); // Search query for filtering clients
    const [investmentStatus, setInvestmentStatus] = useState<string>('all'); // Investment status filter (active/inactive/all)
    
    // Calendar modal states
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientWithCalls | null>(null);
    const [selectedFollowUpDate, setSelectedFollowUpDate] = useState<string>('');
    const [selectedFollowUpTime, setSelectedFollowUpTime] = useState<string>('10:00');
    const [showCalendarPicker, setShowCalendarPicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    // Call modal states
    const [showCallModal, setShowCallModal] = useState(false);
    const [callModalStep, setCallModalStep] = useState<'auth' | 'call' | 'success'>('auth');
    const [callEmail, setCallEmail] = useState('');
    const [callPassword, setCallPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [advisorAgentId, setAdvisorAgentId] = useState<string | null>(null);
    const [advisorSmartfloId, setAdvisorSmartfloId] = useState<string | null>(null);
    const [callSuccessMessage, setCallSuccessMessage] = useState('');
    const [callRefId, setCallRefId] = useState('');
    const [isUpdatingCallStatus, setIsUpdatingCallStatus] = useState(false);
    const [showConnectionQuestion, setShowConnectionQuestion] = useState(false);
    
    const pageSize = 10; // Number of items per page
    
    // Statistics - keeping as placeholder since call tracking is not in backend yet
    const [stats, setStats] = useState<CallStats>({
        totalClients: 0,
        scheduledCalls: 0,
        completedCalls: 0,
        missedCalls: 0,
        overdueCalls: 0
    });

    // Fetch advisor's agentId and email on mount
    useEffect(() => {
        const fetchAdvisorData = async () => {
            if (!user?.id) {
                console.warn('⚠️ No user ID available');
                return;
            }
            
            console.log('🔄 Fetching advisor data for user ID:', user.id);
            
            try {
                const advisorData = await advisorService.fetchAdvisor(user.id);
                console.log('📦 FULL Advisor data received:', JSON.stringify(advisorData, null, 2));
                console.log('📧 Email field:', advisorData?.email);
                
                if (advisorData?.agentId) {
                    setAdvisorAgentId(advisorData.agentId);
                    console.log('✅ Advisor agentId loaded:', advisorData.agentId);
                } else {
                    console.warn('⚠️ No agentId found for advisor');
                }

                if (advisorData?.smartfloId) {
                    setAdvisorSmartfloId(advisorData.smartfloId);
                    console.log('✅ Advisor smartfloId loaded:', advisorData.smartfloId);
                } else {
                    console.warn('⚠️ No smartfloId found for advisor');
                }

                // Extract username from email (everything before @)
                if (advisorData?.email) {
                    const emailUsername = advisorData.email.split('@')[0];
                    setCallEmail(emailUsername);
                    console.log('✅ Smartflo email ID set from advisor profile:', emailUsername);
                    console.log('✅ callEmail state updated to:', emailUsername);
                } else {
                    console.warn('⚠️ No email found in advisor data', advisorData);
                }
            } catch (error) {
                console.error('❌ Error fetching advisor data:', error);
            }
        };

        fetchAdvisorData();
    }, [user?.id]);

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

                // Fetch clients with backend pagination and filters
                const response = await clientService.fetchAdvisorClients(user.id, {
                    page: searchQuery ? 1 : page,
                    limit: searchQuery ? 1000 : pageSize,
                    appType: normalizedAppType,
                    timeframe: timeframeValue,
                    startDate: selectedOption === "custom" ? customDates.start : undefined,
                    endDate: selectedOption === "custom" ? customDates.end : undefined,
                    followUpTimeframe: followUpFilter,
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
                const allClientsResponse = await clientService.fetchAdvisorClients(user.id, {
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
        }, [user?.id, page, showAll, appType, selectedOption, customDates, followUpFilter, searchQuery, investmentStatus]);

    // Reset to page 1 when search query or filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, followUpFilter, showAll, appType, selectedOption, investmentStatus]);



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
        if (typeof window !== "undefined") {
            sessionStorage.setItem("selectedClientId", clientId.toString());
            sessionStorage.setItem("previousPage", "/advisor-crm");
        }
        router.push(`/clients/profile`);
    };

    // Calendar modal handlers
    const handleOpenCalendar = (client: ClientWithCalls) => {
        setSelectedClient(client);
        // Pre-fill with existing followUpDate if available
        if (client.followUpDate) {
            const date = new Date(client.followUpDate);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().slice(0, 5);
            setSelectedFollowUpDate(dateStr);
            setSelectedFollowUpTime(timeStr);
            // Sync calendar to the selected date
            setCalendarMonth(date.getMonth());
            setCalendarYear(date.getFullYear());
        } else {
            setSelectedFollowUpDate('');
            setSelectedFollowUpTime('10:00');
            // Set calendar to current month
            const now = new Date();
            setCalendarMonth(now.getMonth());
            setCalendarYear(now.getFullYear());
        }
        setShowCalendarPicker(false);
        setShowCalendarModal(true);
    };

    const handleCloseCalendar = () => {
        setShowCalendarModal(false);
        setShowCalendarPicker(false);
        setSelectedClient(null);
        setSelectedFollowUpDate('');
        setSelectedFollowUpTime('10:00');
    };

    const handleSaveFollowUpDate = async () => {
        if (!selectedClient || !selectedFollowUpDate) return;

        try {
            // Combine date and time into a single datetime string
            const dateTimeString = `${selectedFollowUpDate}T${selectedFollowUpTime}:00`;
            
            // Call API to update followUpDate
            await clientService.updateClientFollowUpDate(selectedClient.id, dateTimeString);
            
            // Update local state
            setClients(prevClients => 
                prevClients.map(client => 
                    client.id === selectedClient.id 
                        ? { ...client, followUpDate: dateTimeString }
                        : client
                )
            );

            handleCloseCalendar();
            alert('Follow-up date saved successfully!');
        } catch (error) {
            console.error('Error saving follow-up date:', error);
            alert(`Failed to save follow-up date: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSelectedFollowUpDate(e.target.value);
    // };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFollowUpTime(e.target.value);
    };

    // Calendar helper functions
    const handleDateSelect = (year: number, month: number, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedFollowUpDate(dateStr);
        setShowCalendarPicker(false);
    };

    const getCalendarDays = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days: ({ day: number; date: string } | null)[] = [];
        
        // Add empty slots for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({ day, date: dateStr });
        }
        
        return days;
    };

    const goToPreviousMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }
    };

    // Call modal handlers
    const handleOpenCallModal = (client: ClientWithCalls) => {
        setSelectedClient(client);
        // If we have a valid token, skip the auth step
        if (smartfloToken && isTokenValid) {
            setCallModalStep('call');
        } else {
            setCallModalStep('auth');
        }
        // Don't reset callEmail - it's auto-filled from advisor profile
        setCallPassword('');
        setAuthError('');
        setShowCallModal(true);
    };

    const handleCloseCallModal = () => {
        setShowCallModal(false);
        setSelectedClient(null);
        setCallModalStep('auth');
        // Don't reset callEmail - keep it for next time
        setCallPassword('');
        setAuthError('');
        setCallSuccessMessage('');
        setCallRefId('');
        setShowConnectionQuestion(false);
        setIsAuthenticating(false);
        setIsCalling(false);
        setIsUpdatingCallStatus(false);
    };

    const handleCallConnected = async (wasConnected: boolean) => {
        if (!selectedClient) return;

        if (wasConnected) {
            setIsUpdatingCallStatus(true);
            try {
                // Update the previous call date to current date time
                const currentDateTime = new Date().toISOString();
                
                // Call API to update the client's previous call date
                await clientService.updateClientPreviousCallDate(selectedClient.id, currentDateTime);

                console.log('✅ Call status updated successfully');
                
                // Refresh the clients list to show updated data
                await fetchClients();
            } catch (error) {
                console.error('Error updating call status:', error);
            } finally {
                setIsUpdatingCallStatus(false);
            }
        }

        // Close modal
        handleCloseCallModal();
    };

    const handleAuthenticateCall = async () => {
        if (!callEmail || !callPassword) {
            setAuthError('Please enter both email and password');
            return;
        }

        setIsAuthenticating(true);
        setAuthError('');

        try {
            // Use the shared token context to generate and store token
            await generateAndSetToken(callEmail, callPassword);
            
            setCallModalStep('call');
            setIsAuthenticating(false);
        } catch (error) {
            console.error('Authentication error:', error);
            setAuthError('Failed to authenticate. Please check your credentials.');
            setIsAuthenticating(false);
        }
    };

    const handleMakeCall = async (useSmartfloId: boolean = false) => {
        if (!selectedClient || !smartfloToken) return;

        // Determine which ID to use
        const idToUse = useSmartfloId ? advisorSmartfloId : advisorAgentId;
        const idType = useSmartfloId ? 'Smartflo ID' : 'Agent ID';

        // Validate advisor has the required ID
        if (!idToUse) {
            alert(`${idType} not configured for this advisor. Please contact administrator.`);
            return;
        }

        setIsCalling(true);

        try {
            // Step 1: Fetch available numbers to get caller_id
            const numbers = await smartfloService.fetchNumbers(smartfloToken);
            
            if (!numbers || numbers.length === 0) {
                throw new Error('No caller ID available. Please check Smartflo configuration.');
            }

            // Use the first available number's alias as caller_id
            const callerId = numbers[0].alias;

            // Step 2: Initiate the call
            const result = await smartfloService.initiateCall(
                smartfloToken,
                idToUse,
                selectedClient.mobileNumber,
                callerId
            );

            if (result.success) {
                // Store success message and move to success step
                const message = result.data?.message || 'Call initiated successfully';
                const refId = result.data?.ref_id || '';
                setCallSuccessMessage(message);
                setCallRefId(refId);
                setCallModalStep('success');
                setShowConnectionQuestion(false);
                
                // Show connection question after 10 seconds
                setTimeout(() => {
                    setShowConnectionQuestion(true);
                }, 10000);
            } else {
                throw new Error(result.message || 'Failed to initiate call');
            }

            setIsCalling(false);
        } catch (error) {
            console.error('Call error:', error);
            alert(`Failed to make call: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsCalling(false);
        }
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
                        <SalesIcon />
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
                        <SalesIconViolet />
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
                                className="w-64 px-4 py-2 pl-10 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Due Follow Ups Dropdown */}
                        <div className="relative">
                            <select
                                value={followUpFilter || ''}
                                onChange={(e) => {
                                    setFollowUpFilter(e.target.value || undefined);
                                    setPage(1); // Reset to first page when filter changes
                                }}
                                className="appearance-none px-4 py-2 pr-10 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Due Follow Ups</option>
                                <option value="overdue">Overdue</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="till_date">Till Date</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                <ChevronDownIcon className="w-4 h-4" />
                            </span>
                        </div>

                        {/* Investment Status Filter - Only for Fydaa users */}
                        {normalizedAppType === 'fydaa' && (
                            <div className="relative">
                                <select
                                    value={investmentStatus}
                                    onChange={(e) => setInvestmentStatus(e.target.value)}
                                    className="appearance-none px-4 py-2 pr-10 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Investment Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </span>
                            </div>
                        )}

                        {/* Show All Button */}
                        <button
                            onClick={() => {
                                setShowAll(!showAll);
                                setPage(1); // Reset to first page when toggling
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                                                        <button
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
                                                            title="Make a call"
                                                            onClick={() => handleOpenCallModal(client)}
                                                        >
                                                            <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
                                                            title="Schedule follow-up call"
                                                            onClick={() => handleOpenCalendar(client)}
                                                        >
                                                            <CalenderIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </button>
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
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-white/[0.05]">
                        <div className="text-sm text-gray-700 dark:text-gray-400">
                            Showing page <span className="font-medium">{page}</span> of{" "}
                            <span className="font-medium">{totalPages}</span> ({total} total clients)
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* Calendar Modal */}
            {showCalendarModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Schedule Call
                            </h2>
                            <button
                                onClick={handleCloseCalendar}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {selectedClient && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Client</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {`${selectedClient.firstName || ""} ${selectedClient.lastName || ""}`.trim()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedClient.email}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Date
                                </label>
                                <div className="relative calendar-container">
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 hover:text-blue-600 transition-colors"
                                    >
                                        <CalenderIcon className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                                    </button>
                                    <input
                                        type="text"
                                        value={selectedFollowUpDate ? new Date(selectedFollowUpDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                                        readOnly
                                        onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer"
                                        placeholder="Select a date"
                                    />

                                    {/* Calendar Dropdown */}
                                    {showCalendarPicker && (
                                        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 z-50 w-full">
                                            {/* Calendar Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <button
                                                    type="button"
                                                    onClick={goToPreviousMonth}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-900 dark:text-white"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={goToNextMonth}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-900 dark:text-white"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Day Labels */}
                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar Days */}
                                            <div className="grid grid-cols-7 gap-1">
                                                {getCalendarDays(calendarYear, calendarMonth).map((dayObj, index) => {
                                                    if (!dayObj) {
                                                        return <div key={`empty-${index}`} className="p-2"></div>;
                                                    }

                                                    const isSelected = dayObj.date === selectedFollowUpDate;
                                                    const todayStr = new Date().toISOString().split('T')[0];
                                                    const isToday = dayObj.date === todayStr;
                                                    const isPast = dayObj.date < todayStr;

                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => handleDateSelect(calendarYear, calendarMonth, dayObj.day)}
                                                            disabled={isPast}
                                                            className={`p-2 text-sm rounded-lg transition-colors ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white font-semibold'
                                                                    : isToday
                                                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-semibold'
                                                                    : isPast
                                                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                                            }`}
                                                        >
                                                            {dayObj.day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Time
                                </label>
                                <input
                                    type="time"
                                    value={selectedFollowUpTime}
                                    onChange={handleTimeChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCloseCalendar}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveFollowUpDate}
                                disabled={!selectedFollowUpDate}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Call Modal */}
            {showCallModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {callModalStep === 'auth' ? 'Authenticate to Call' : callModalStep === 'call' ? 'Make Call' : 'Call Status'}
                            </h2>
                            {callModalStep !== 'success' && (
                                <button
                                    onClick={handleCloseCallModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {selectedClient && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calling</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {`${selectedClient.firstName || ""} ${selectedClient.lastName || ""}`.trim()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedClient.mobileNumber}
                                </p>
                            </div>
                        )}

                        {callModalStep === 'auth' ? (
                            <>
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                                        Login ID (from your profile)
                                    </p>
                                    <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                                        {(() => {
                                            console.log('🔍 Modal rendering with callEmail:', callEmail);
                                            return callEmail || 'Loading...';
                                        })()}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={callPassword}
                                            onChange={(e) => setCallPassword(e.target.value)}
                                            placeholder="Enter Smartflo password"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            disabled={isAuthenticating}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAuthenticateCall()}
                                        />
                                    </div>

                                    {authError && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleCloseCallModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                        disabled={isAuthenticating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAuthenticateCall}
                                        disabled={isAuthenticating || !callEmail || !callPassword}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {isAuthenticating ? 'Authenticating...' : 'Next'}
                                    </button>
                                </div>
                            </>
                        ) : callModalStep === 'call' ? (
                            <>
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                                        <PhoneIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Ready to make call
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCloseCallModal}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                            disabled={isCalling}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleMakeCall(false)}
                                            disabled={isCalling || !advisorAgentId}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                            title={!advisorAgentId ? 'Agent ID not configured' : 'Call with Agent ID'}
                                        >
                                            <PhoneIcon className="w-5 h-5" />
                                            {isCalling ? 'Calling...' : 'Call Now'}
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleMakeCall(true)}
                                        disabled={isCalling || !advisorSmartfloId}
                                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                        title={!advisorSmartfloId ? 'Smartflo ID not configured' : 'Call with Smartflo ID'}
                                    >
                                        <PhoneIcon className="w-5 h-5" />
                                        {isCalling ? 'Calling...' : 'Call with Smartflo'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Success Step */}
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {callSuccessMessage}
                                    </h3>
                                    {callRefId && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                            Reference ID: <span className="font-mono">{callRefId}</span>
                                        </p>
                                    )}
                                    
                                    {!showConnectionQuestion ? (
                                        <div className="my-8 p-6 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Waiting for call to connect...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Was the call successfully connected?
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                                If yes, we&apos;ll update the &quot;Previous Call&quot; date to now.
                                            </p>
                                            
                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={() => handleCallConnected(false)}
                                                    disabled={isUpdatingCallStatus}
                                                    className="px-8 py-3 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    No
                                                </button>
                                                <button
                                                    onClick={() => handleCallConnected(true)}
                                                    disabled={isUpdatingCallStatus}
                                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                                >
                                                    {isUpdatingCallStatus ? 'Updating...' : 'Yes'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
