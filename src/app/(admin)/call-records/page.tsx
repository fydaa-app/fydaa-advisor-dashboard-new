"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CallRecordsTable from "@/components/tables/CallRecordsTable";
import { smartfloService, advisorService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { useSmartfloToken } from "@/context/SmartfloTokenContext";

interface CallStats {
    totalCalls: number;
    connectedCalls: number;
    unansweredCalls: number;
    incomingCalls: number;
    missedCalls: number;
}

export default function CallRecordsPage() {
    const { user } = useAuth();
    const { token: generatedToken, isTokenValid, generateAndSetToken } = useSmartfloToken();
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [tokenEmail, setTokenEmail] = useState('');
    const [tokenPassword, setTokenPassword] = useState('');
    const [isGeneratingToken, setIsGeneratingToken] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [tokenExpired, setTokenExpired] = useState(false);

    // Fetch advisor's email on mount to pre-populate login
    useEffect(() => {
        const fetchAdvisorData = async () => {
            if (!user?.id) return;
            
            try {
                const advisorData = await advisorService.fetchAdvisor(user.id);
                
                // Extract username from email (everything before @)
                if (advisorData?.email) {
                    const emailUsername = advisorData.email.split('@')[0];
                    setTokenEmail(emailUsername);
                }
            } catch (error) {
                console.error('Error fetching advisor data:', error);
            }
        };

        fetchAdvisorData();
    }, [user?.id]);
    
    // Statistics state
    const [stats, setStats] = useState<CallStats>({
        totalCalls: 0,
        connectedCalls: 0,
        unansweredCalls: 0,
        incomingCalls: 0,
        missedCalls: 0,
    });
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Filter state for card clicks
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    // Get page title based on selected filter
    const getPageTitle = () => {
        switch (selectedFilter) {
            case 'all':
                return 'Call Records';
            case 'unanswered':
                return 'Call Records - Unanswered Calls';
            case 'connected':
                return 'Call Records - Total Connected Calls';
            case 'incoming':
                return 'Call Records - Incoming Calls';
            case 'missed':
                return 'Call Records - Missed Calls';
            default:
                return 'Call Records';
        }
    };

    // Validate token and fetch statistics when token is available
    useEffect(() => {
        const validateAndFetchStats = async () => {
            if (!generatedToken) {
                setStats({
                    totalCalls: 0,
                    connectedCalls: 0,
                    unansweredCalls: 0,
                    incomingCalls: 0,
                    missedCalls: 0,
                });
                setTokenExpired(false);
                return;
            }

            setIsLoadingStats(true);
            setTokenExpired(false);
            
            try {
                const [total, connected, unanswered, incoming, missed] = await Promise.all([
                    smartfloService.fetchTotalCalls(generatedToken),
                    smartfloService.fetchConnectedCalls(generatedToken),
                    smartfloService.fetchUnansweredCalls(generatedToken),
                    smartfloService.fetchIncomingCalls(generatedToken),
                    smartfloService.fetchMissedCalls(generatedToken),
                ]);

                setStats({
                    totalCalls: total,
                    connectedCalls: connected,
                    unansweredCalls: unanswered,
                    incomingCalls: incoming,
                    missedCalls: missed,
                });
            } catch (error) {
                console.error('Error fetching call statistics:', error);
                
                // Check if error is due to invalid/expired token
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('Invalid token') || 
                    errorMessage.includes('401') ||
                    errorMessage.includes('Unauthorized')) {
                    console.log('Token expired or invalid');
                    setTokenExpired(true);
                }
            } finally {
                setIsLoadingStats(false);
            }
        };

        validateAndFetchStats();
    }, [generatedToken, isTokenValid]);

    const handleGenerateToken = async () => {
        if (!tokenEmail || !tokenPassword) {
            setTokenError('Please enter both email and password');
            return;
        }

        setIsGeneratingToken(true);
        setTokenError('');

        try {
            await generateAndSetToken(tokenEmail, tokenPassword);
            setTokenError('');
            setTokenExpired(false);
            alert('Token generated successfully!');
            setShowTokenModal(false);
        } catch (error) {
            console.error('Token generation error:', error);
            setTokenError(error instanceof Error ? error.message : 'Failed to generate token');
        } finally {
            setIsGeneratingToken(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{getPageTitle()}</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage all SmartFlo call records</p>
                </div>
            </div>

            {/* Token Status Info */}
            {!generatedToken || tokenExpired || !isTokenValid ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                Smartflo Inactive - {tokenExpired ? 'Token expired, please login' : 'Please login'} to view call records
                            </span>
                        </div>
                        <button
                            onClick={() => setShowTokenModal(true)}
                            className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                        >
                            Smartflo Login 
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-800 dark:text-green-400">
                            Token Active - Call records are now visible
                        </span>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="xl:flex items-stretch justify-between sales-box-row gap-4">
                {/* Total Calls */}
                <div className="col-span-4">
                    <div 
                        className={`box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] cursor-pointer transition-transform duration-200 hover:scale-105 ${selectedFilter === 'all' ? 'ring-2 ring-violet-500 dark:ring-violet-400' : ''}`}
                        onClick={() => setSelectedFilter('all')}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#8B5CF6"/>
                        <path d="M26.9 25.1C25.7 25.1 24.6 24.9 23.5 24.5C23.2 24.4 22.8 24.5 22.6 24.7L20.8 26.5C18 25.1 15.9 23 14.5 20.2L16.3 18.4C16.6 18.1 16.7 17.7 16.6 17.4C16.2 16.3 16 15.2 16 14C16 13.5 15.6 13 15.1 13H13C12.4 13 12 13.4 12 14C12 22.3 18.7 29 27 29C27.6 29 28 28.6 28 28V25.9C28 25.4 27.5 25.1 26.9 25.1Z" fill="white"/>
                        </svg>
                        <h2 className="numbers-sale text-gray-900">
                            {isLoadingStats ? '...' : stats.totalCalls}
                        </h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Total Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Missed Calls */}
                <div className="col-span-4">
                    <div 
                        className={`box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] cursor-pointer transition-transform duration-200 hover:scale-105 ${selectedFilter === 'missed' ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}
                        onClick={() => setSelectedFilter('missed')}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#FA5A7D"/>
                        <path d="M26.9 25.1C25.7 25.1 24.6 24.9 23.5 24.5C23.2 24.4 22.8 24.5 22.6 24.7L20.8 26.5C18 25.1 15.9 23 14.5 20.2L16.3 18.4C16.6 18.1 16.7 17.7 16.6 17.4C16.2 16.3 16 15.2 16 14C16 13.5 15.6 13 15.1 13H13C12.4 13 12 13.4 12 14C12 22.3 18.7 29 27 29C27.6 29 28 28.6 28 28V25.9C28 25.4 27.5 25.1 26.9 25.1Z" fill="white"/>
                        </svg>
                        <h2 className="numbers-sale text-gray-900">
                            {isLoadingStats ? '...' : stats.missedCalls}
                        </h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Missed Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Total Connected Calls */}
                <div className="col-span-4">
                    <div 
                        className={`box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] cursor-pointer transition-transform duration-200 hover:scale-105 ${selectedFilter === 'connected' ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}
                        onClick={() => setSelectedFilter('connected')}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#22C55E"/>
                        <path d="M26.9 25.1C25.7 25.1 24.6 24.9 23.5 24.5C23.2 24.4 22.8 24.5 22.6 24.7L20.8 26.5C18 25.1 15.9 23 14.5 20.2L16.3 18.4C16.6 18.1 16.7 17.7 16.6 17.4C16.2 16.3 16 15.2 16 14C16 13.5 15.6 13 15.1 13H13C12.4 13 12 13.4 12 14C12 22.3 18.7 29 27 29C27.6 29 28 28.6 28 28V25.9C28 25.4 27.5 25.1 26.9 25.1Z" fill="white"/>
                        </svg>
                        <h2 className="numbers-sale text-gray-900">
                            {isLoadingStats ? '...' : stats.connectedCalls}
                        </h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Total Connected Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Unanswered Calls */}
                <div className="col-span-4">
                    <div 
                        className={`box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] cursor-pointer transition-transform duration-200 hover:scale-105 ${selectedFilter === 'unanswered' ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''}`}
                        onClick={() => setSelectedFilter('unanswered')}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#FB923C"/>
                        <path d="M26.9 25.1C25.7 25.1 24.6 24.9 23.5 24.5C23.2 24.4 22.8 24.5 22.6 24.7L20.8 26.5C18 25.1 15.9 23 14.5 20.2L16.3 18.4C16.6 18.1 16.7 17.7 16.6 17.4C16.2 16.3 16 15.2 16 14C16 13.5 15.6 13 15.1 13H13C12.4 13 12 13.4 12 14C12 22.3 18.7 29 27 29C27.6 29 28 28.6 28 28V25.9C28 25.4 27.5 25.1 26.9 25.1Z" fill="white"/>
                        </svg>
                        <h2 className="numbers-sale text-gray-900">
                            {isLoadingStats ? '...' : stats.unansweredCalls}
                        </h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Unanswered Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>

                {/* Incoming Calls */}
                <div className="col-span-4">
                    <div 
                        className={`box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] cursor-pointer transition-transform duration-200 hover:scale-105 ${selectedFilter === 'incoming' ? 'ring-2 ring-violet-500 dark:ring-violet-400' : ''}`}
                        onClick={() => setSelectedFilter('incoming')}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#8B5CF6"/>
                        <path d="M26.9 25.1C25.7 25.1 24.6 24.9 23.5 24.5C23.2 24.4 22.8 24.5 22.6 24.7L20.8 26.5C18 25.1 15.9 23 14.5 20.2L16.3 18.4C16.6 18.1 16.7 17.7 16.6 17.4C16.2 16.3 16 15.2 16 14C16 13.5 15.6 13 15.1 13H13C12.4 13 12 13.4 12 14C12 22.3 18.7 29 27 29C27.6 29 28 28.6 28 28V25.9C28 25.4 27.5 25.1 26.9 25.1Z" fill="white"/>
                        </svg>
                        <h2 className="numbers-sale text-gray-900">
                            {isLoadingStats ? '...' : stats.incomingCalls}
                        </h2>
                        <p className="total-sale-text">
                            <span className="flex items-center gap-2">
                                Incoming Calls
                            </span>
                        </p>
                        <span className="total-yes"></span>
                    </div>
                </div>
            </div>

            {/* Call Records Table */}
            <div className="bg-white border border-gray-200 rounded-xl dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
                <div className="p-6">
                    <CallRecordsTable token={generatedToken} filter={selectedFilter} />
                </div>
            </div>

            {/* Token Generation Modal */}
            {showTokenModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                SmartFlo Authentication
                            </h2>
                            <button
                                onClick={() => {
                                    setShowTokenModal(false);
                                    setTokenError('');
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Login ID
                                </label>
                                <input
                                    type="text"
                                    value={tokenEmail}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-filled from your profile</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={tokenPassword}
                                    onChange={(e) => setTokenPassword(e.target.value)}
                                    placeholder="Enter SmartFlo password"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {tokenError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{tokenError}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowTokenModal(false);
                                        setTokenError('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateToken}
                                    disabled={isGeneratingToken}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isGeneratingToken ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
