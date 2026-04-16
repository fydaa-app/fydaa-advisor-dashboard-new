"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {  useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
    SalesIcon,
    SalesIconOrange,
    SalesIconGreen,
    PhoneIcon,
    CalenderIcon,
    ChevronDownIcon,
    NewCustomerIcon
} from '@/icons';
import { useAuth } from "@/context/AuthContext";
import { leadService, advisorService, smartfloService } from "@/services";
import Select from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { useGlobalContext } from "@/context/GlobalState";
import { useSmartfloToken } from "@/context/SmartfloTokenContext";

interface LeadWithCalls {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    followUpDate: string | null;
    previousCallDate: string | null;
    createdAt: string;
    notes?: { note: string } | null;
}

interface CallStats {
    totalLeads: number;
    scheduledCalls: number;
    completedCalls: number;
    overdueCalls: number;
}

export default function Leads() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { selectedOption, customDates } = useGlobalContext();
    const { token: smartfloToken, isTokenValid, generateAndSetToken } = useSmartfloToken();
    const [leads, setLeads] = useState<LeadWithCalls[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? parseInt(pageParam, 10) : 1;
    });
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [showAll, setShowAll] = useState(() => {
        const showAllParam = searchParams.get('showAll');
        return showAllParam === 'true';
    });

    useEffect(() => {
        const pageParam = searchParams.get('page');
        const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
        const showAllParam = searchParams.get('showAll');
        const showAllFromUrl = showAllParam === 'true';
        
        if (pageParam) {
            skipFilterReset.current = true;
        }
        
        if (pageFromUrl !== page) {
            setPage(pageFromUrl);
        }
        
        if (showAllFromUrl !== showAll) {
            setShowAll(showAllFromUrl);
        }
    }, [searchParams, page, showAll]);

    const updatePage = (newPage: number) => {
        setPage(newPage);
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage.toString());
        if (showAll) {
            url.searchParams.set('showAll', 'true');
        } else {
            url.searchParams.delete('showAll');
        }
        window.history.pushState({}, '', url.toString());
    };

    const [followUpFilter, setFollowUpFilter] = useState<string | undefined>(undefined);
    const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadWithCalls | null>(null);
    const [selectedFollowUpDate, setSelectedFollowUpDate] = useState<string>('');
    const [selectedFollowUpTime, setSelectedFollowUpTime] = useState<string>('10:00');
    const [showCalendarPicker, setShowCalendarPicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

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

    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedLeadForNotes, setSelectedLeadForNotes] = useState<LeadWithCalls | null>(null);
    const [noteInput, setNoteInput] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    
    const skipFilterReset = useRef(false);
    
    const pageSize = 10;
    
    const [stats, setStats] = useState<CallStats>({
        totalLeads: 0,
        scheduledCalls: 0,
        completedCalls: 0,
        overdueCalls: 0
    });

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'createdAt',
        direction: 'desc'
    });

    // Listen for advisor changes and refresh
    useEffect(() => {
        const handleAdvisorChange = () => {
            window.location.reload();
        };
        window.addEventListener('advisor-changed', handleAdvisorChange);
        return () => window.removeEventListener('advisor-changed', handleAdvisorChange);
    }, []);

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

                if (advisorData?.email) {
                    const emailUsername = advisorData.email.split('@')[0];
                    setCallEmail(emailUsername);
                    console.log('✅ Smartflo email ID set from advisor profile:', emailUsername);
                } else {
                    console.warn('⚠️ No email found in advisor data', advisorData);
                }
            } catch (error) {
                console.error('❌ Error fetching advisor data:', error);
            }
        };

        fetchAdvisorData();
    }, [user?.id]);

    const fetchLeads = async () => {
        if (!user?.id) {
            setLeads([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
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

            const response = await leadService.fetchAdvisorLeads(effectiveAdvisorId, {
                page: searchQuery ? 1 : page,
                limit: searchQuery ? 1000 : pageSize,
                timeframe: timeframeValue,
                startDate: selectedOption === "custom" ? customDates.start : undefined,
                endDate: selectedOption === "custom" ? customDates.end : undefined,
                followUpTimeframe: followUpFilter,
                showOverdueOnly: showOverdueOnly,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            });

            console.log('Fetched leads:', response);

            const mappedLeads: LeadWithCalls[] = response.leads.map((lead) => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                mobileNumber: lead.mobileNumber,
                followUpDate: lead.followUpDate || null,
                previousCallDate: lead.previousCallDate || null,
                createdAt: lead.createdAt,
                notes: lead.notes || null,
            }));

            let finalLeads = mappedLeads;
            if (searchQuery) {
                finalLeads = mappedLeads.filter(lead => {
                    const query = searchQuery.toLowerCase();
                    return (
                        lead.name?.toLowerCase().includes(query) ||
                        lead.email?.toLowerCase().includes(query) ||
                        lead.mobileNumber?.toLowerCase().includes(query)
                    );
                });
                
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                setLeads(finalLeads.slice(startIndex, endIndex));
                setTotalPages(Math.ceil(finalLeads.length / pageSize));
                setTotal(finalLeads.length);
            } else {
                setLeads(finalLeads);
                setTotalPages(response.pagination.totalPages);
                setTotal(response.pagination.total);
            }
            
            setTotalPages(response.pagination.totalPages);
            setTotal(response.pagination.total);

            const allLeadsResponse = await leadService.fetchAdvisorLeads(effectiveAdvisorId, {
                page: 1,
                limit: 10000,
                timeframe: timeframeValue,
                startDate: selectedOption === "custom" ? customDates.start : undefined,
                endDate: selectedOption === "custom" ? customDates.end : undefined,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            });

            const allLeads: LeadWithCalls[] = allLeadsResponse.leads.map((lead) => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                mobileNumber: lead.mobileNumber,
                followUpDate: lead.followUpDate || null,
                previousCallDate: lead.previousCallDate || null,
                createdAt: lead.createdAt,
                notes: lead.notes || null,
            }));

            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            const overdueLeads: LeadWithCalls[] = [];
            const completedLeads: LeadWithCalls[] = [];
            const scheduledLeads: LeadWithCalls[] = [];
            
            allLeads.forEach(lead => {
                const hasFollowUp = !!lead.followUpDate;
                const hasPrevCall = !!lead.previousCallDate;
                
                if (!hasFollowUp && !hasPrevCall) return;
                
                if (hasFollowUp) {
                    const followUp = new Date(lead.followUpDate!);
                    followUp.setHours(0, 0, 0, 0);
                    const isInPast = followUp < now;
                    
                    if (hasPrevCall) {
                        const prev = new Date(lead.previousCallDate!);
                        prev.setHours(0, 0, 0, 0);
                        
                        if (isInPast) {
                            if (prev >= followUp) {
                                completedLeads.push(lead);
                            } else {
                                overdueLeads.push(lead);
                            }
                        } else {
                            scheduledLeads.push(lead);
                        }
                    } else {
                        if (isInPast) {
                            overdueLeads.push(lead);
                        } else {
                            scheduledLeads.push(lead);
                        }
                    }
                } else if (hasPrevCall) {
                    completedLeads.push(lead);
                }
            });
            
            setStats({
                totalLeads: response.pagination.total,
                scheduledCalls: scheduledLeads.length,
                completedCalls: completedLeads.length,
                overdueCalls: overdueLeads.length,
            });
            
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch leads');
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchLeads();
    }, [user?.id, page, showAll, selectedOption, customDates, followUpFilter, showOverdueOnly, searchQuery, sortConfig]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (skipFilterReset.current) {
            skipFilterReset.current = false;
            return;
        }
        updatePage(1);
    }, [searchQuery, followUpFilter, showOverdueOnly, showAll, selectedOption]);

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

    const handleOpenCalendar = (lead: LeadWithCalls) => {
        setSelectedLead(lead);
        if (lead.followUpDate) {
            const date = new Date(lead.followUpDate);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().slice(0, 5);
            setSelectedFollowUpDate(dateStr);
            setSelectedFollowUpTime(timeStr);
            setCalendarMonth(date.getMonth());
            setCalendarYear(date.getFullYear());
        } else {
            setSelectedFollowUpDate('');
            setSelectedFollowUpTime('10:00');
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
        setSelectedLead(null);
        setSelectedFollowUpDate('');
        setSelectedFollowUpTime('10:00');
    };

    const handleSaveFollowUpDate = async () => {
        if (!selectedLead || !selectedFollowUpDate) return;

        try {
            const dateTimeString = `${selectedFollowUpDate}T${selectedFollowUpTime}:00`;
            
            await leadService.updateLeadFollowUpDate(selectedLead.id, dateTimeString);
            
            setLeads(prevLeads => 
                prevLeads.map(lead => 
                    lead.id === selectedLead.id 
                        ? { ...lead, followUpDate: dateTimeString }
                        : lead
                )
            );

            handleCloseCalendar();
            //alert('Follow-up date saved successfully!');
        } catch (error) {
            console.error('Error saving follow-up date:', error);
            alert(`Failed to save follow-up date: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFollowUpTime(e.target.value);
    };

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
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
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

    const handleOpenCallModal = (lead: LeadWithCalls) => {
        setSelectedLead(lead);
        if (smartfloToken && isTokenValid) {
            setCallModalStep('call');
        } else {
            setCallModalStep('auth');
        }
        setCallPassword('');
        setAuthError('');
        setShowCallModal(true);
    };

    const handleCloseCallModal = () => {
        setShowCallModal(false);
        setSelectedLead(null);
        setCallModalStep('auth');
        setCallPassword('');
        setAuthError('');
        setCallSuccessMessage('');
        setCallRefId('');
        setShowConnectionQuestion(false);
        setIsAuthenticating(false);
        setIsCalling(false);
        setIsUpdatingCallStatus(false);
    };

    const handleOpenNotesModal = (lead: LeadWithCalls) => {
        setSelectedLeadForNotes(lead);
        setNoteInput(lead.notes?.note || '');
        setShowNotesModal(true);
    };

    const handleCloseNotesModal = () => {
        setShowNotesModal(false);
        setSelectedLeadForNotes(null);
        setNoteInput('');
    };

    const handleSaveNotes = async () => {
        if (!selectedLeadForNotes || !noteInput.trim()) return;

        setIsSavingNotes(true);
        try {
            await leadService.updateLeadNotes(selectedLeadForNotes.id, noteInput.trim());
            
            setLeads(prevLeads => 
                prevLeads.map(lead => 
                    lead.id === selectedLeadForNotes.id 
                        ? { ...lead, notes: { note: noteInput.trim() } }
                        : lead
                )
            );

            handleCloseNotesModal();
            //alert('Notes saved successfully!');
        } catch (error) {
            console.error('Error saving notes:', error);
            alert(`Failed to save notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleCallConnected = async (wasConnected: boolean) => {
        if (!selectedLead) return;

        if (wasConnected) {
            setIsUpdatingCallStatus(true);
            try {
                const currentDateTime = new Date().toISOString();
                
                await leadService.updateLeadPreviousCallDate(selectedLead.id, currentDateTime);

                console.log('✅ Call status updated successfully');
                
                await fetchLeads();
            } catch (error) {
                console.error('Error updating call status:', error);
            } finally {
                setIsUpdatingCallStatus(false);
            }
        }

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
        if (!selectedLead || !smartfloToken) return;

        const idToUse = useSmartfloId ? advisorSmartfloId : advisorAgentId;
        const idType = useSmartfloId ? 'Smartflo ID' : 'Agent ID';

        if (!idToUse) {
            alert(`${idType} not configured for this advisor. Please contact administrator.`);
            return;
        }

        setIsCalling(true);

        try {
            const numbers = await smartfloService.fetchNumbers(smartfloToken);
            
            if (!numbers || numbers.length === 0) {
                throw new Error('No caller ID available. Please check Smartflo configuration.');
            }

            const callerId = numbers[0].alias;

            const result = await smartfloService.initiateCall(
                smartfloToken,
                idToUse,
                selectedLead.mobileNumber,
                callerId
            );

            if (result.success) {
                const message = result.data?.message || 'Call initiated successfully';
                const refId = result.data?.ref_id || '';
                setCallSuccessMessage(message);
                setCallRefId(refId);
                setCallModalStep('success');
                setShowConnectionQuestion(false);
                
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Leads</h1>
                    <p className="text-gray-600 dark:text-gray-400">Lead Call Tracking & Management</p>
                </div>
            </div>

            <div className="xl:flex items-stretch justify-between mt-5 sales-box-row gap-4">
                <div className="col-span-4">
                    <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                        <NewCustomerIcon />
                        <h2 className="numbers-sale text-gray-900">{stats.totalLeads}</h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Total Leads
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

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

            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-theme-xs dark:border-white/[0.05] dark:bg-white/[0.03] w-full">
                <div className="flex flex-col md:flex-row gap-4 md:items-end">
                    {/* Search Bar */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Search
                        </label>
                        <div className="relative w-full">
                            <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, phone, or email..."
                                className="w-full h-11 pl-10 pr-4 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Due Follow Ups Filter */}
                    <div className="w-56 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Due Follow Ups
                        </label>
                        <div className="relative">
                            <Select
                                options={[
                                    { value: "today", label: "Today" },
                                    { value: "week", label: "This Week" },
                                    { value: "month", label: "This Month" },
                                    { value: "year", label: "This Year" },
                                    { value: "till_date", label: "Till Date" }
                                ]}
                                placeholder="Follow-up Due"
                                value={followUpFilter || null}
                                onChange={(option) => {
                                    setFollowUpFilter(option?.value || undefined);
                                    updatePage(1);
                                }}
                                className="dark:bg-gray-800"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>

                    {/* Overdue Only Toggle */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Overdue Only
                        </label>
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
                        </label>
                    </div>

                    {/* Show All Toggle */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Show All
                        </label>
                        <button
                            onClick={() => setShowAll(!showAll)}
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
            </div>

            {/* Lead List Table */}
            <div className="bg-white border border-gray-200 rounded-xl dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
                <div className="overflow-hidden">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1200px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-500 dark:text-gray-400">Loading leads...</div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-red-500 dark:text-red-400">Error: {error}</div>
                                </div>
                            ) : leads.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-gray-500 dark:text-gray-400">No leads found</div>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell 
                                                isHeader 
                                                className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => setSortConfig({ key: 'createdAt', direction: sortConfig.key === 'createdAt' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Created Date
                                                    {sortConfig.key === 'createdAt' && (
                                                        <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell 
                                                isHeader 
                                                className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Name
                                                    {sortConfig.key === 'name' && (
                                                        <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell 
                                                isHeader 
                                                className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => setSortConfig({ key: 'email', direction: sortConfig.key === 'email' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Email
                                                    {sortConfig.key === 'email' && (
                                                        <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell 
                                                isHeader 
                                                className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => setSortConfig({ key: 'mobileNumber', direction: sortConfig.key === 'mobileNumber' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Mobile Number
                                                    {sortConfig.key === 'mobileNumber' && (
                                                        <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell 
                                                isHeader 
                                                className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => setSortConfig({ key: 'followUpDate', direction: sortConfig.key === 'followUpDate' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Next Follow Up
                                                    {sortConfig.key === 'followUpDate' && (
                                                        <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell 
                                                isHeader 
                                                className="px-5 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => setSortConfig({ key: 'previousCallDate', direction: sortConfig.key === 'previousCallDate' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Previous Call
                                                    {sortConfig.key === 'previousCallDate' && (
                                                        <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-center text-xs dark:text-gray-400">Actions</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {leads.map((lead, i) => (
                                            <TableRow key={`${lead.id}-${i}`}>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                                                        {formatDate(lead.createdAt)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                                                        {lead.name || "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{lead.email || "—"}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{lead.mobileNumber || "—"}</TableCell>
                                                <TableCell className="px-4 py-3 text-start">
                                                    <span className={`block font-medium text-sm ${lead.followUpDate
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-400 dark:text-gray-600'
                                                        }`}>
                                                        {formatDateTime(lead.followUpDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-start">
                                                    <span className="block font-medium text-gray-600 text-sm dark:text-gray-400">
                                                        {formatDateTime(lead.previousCallDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
                                                            title="Make a call"
                                                            onClick={() => handleOpenCallModal(lead)}
                                                        >
                                                            <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
                                                            title="Schedule follow-up call"
                                                            onClick={() => handleOpenCalendar(lead)}
                                                        >
                                                            <CalenderIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
                                                            title="Add notes"
                                                            onClick={() => handleOpenNotesModal(lead)}
                                                        >
                                                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
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

                {!isLoading && !error && leads.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-white/[0.05]">
                        <div className="text-sm text-gray-700 dark:text-gray-400">
                            Showing page <span className="font-medium">{page}</span> of{" "}
                            <span className="font-medium">{totalPages}</span> ({total} total leads)
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={updatePage}
                        />
                    </div>
                )}
            </div>

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

                        {selectedLead && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lead</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedLead.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedLead.email}
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

                                    {showCalendarPicker && (
                                        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 z-50 w-full">
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

                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

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

                        {selectedLead && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calling</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedLead.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedLead.mobileNumber}
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
                                        {callEmail || 'Loading...'}
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

            {showNotesModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Notes
                            </h2>
                            <button
                                onClick={handleCloseNotesModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {selectedLeadForNotes && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lead</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedLeadForNotes.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedLeadForNotes.mobileNumber}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Enter notes about this lead..."
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCloseNotesModal}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes || !noteInput.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isSavingNotes ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
