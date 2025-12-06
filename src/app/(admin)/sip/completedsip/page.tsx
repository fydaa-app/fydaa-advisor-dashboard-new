"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ActiveSipTable from "@/components/tables/ActiveSipTable";
import { useGlobalContext } from "@/context/GlobalState";
import Pagination from "@/components/tables/Pagination";

interface Sip {
  sipId: number;
  userId: number;
  userName: string;
  userMobileNumber: string;
  userOnboardingDate: Date;
  sipName: string;
  userSipName: string;
  sipAmount: number;
  sipDate: Date;
  sipTenure: number;
  status: string;
  goalAmount: number;
  startDate: Date;
  endDate: Date;
  portfolioId: number;
  goalId?: number;
  totalPlans: number;
  goalName?: string;
  nextInstallmentDate?: Date | null;
}

async function fetchActiveSips(
    page: number, 
    selectedOption: string, 
    selectedEmployee: string = "",
    customDates: { start: string; end: string },
    searchQuery: string = ""
): Promise<{ sips: Sip[]; error: string | null; totalItems?: number; itemsPerPage?: number; totalPages?: number; }> {
    try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/completed-sip-list-mf?page=${page}`;
    
        if (selectedOption === 'custom') {
          url += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `&timeframe=${selectedOption || "yearly"}`;
        }

        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        if (selectedEmployee) {
            url += `&advisorId=${selectedEmployee}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
            }
        });
  
        if (response.status === 401) {
            if (selectedEmployee) {
                console.warn("Backend doesn't support advisorId parameter yet, trying without advisorId");
                let fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/referrals/completed-sip-list-mf?page=${page}`;
                if (selectedOption === 'custom') {
                    fallbackUrl += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
                } else {
                    fallbackUrl += `&timeframe=${selectedOption || "yearly"}`;
                }
                if (searchQuery) {
                    fallbackUrl += `&search=${encodeURIComponent(searchQuery)}`;
                }
                
                const fallbackResponse = await fetch(fallbackUrl, {
                    headers: {
                        Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
                    }
                });
                
                if (fallbackResponse.ok) {
                    const fallbackResult = await fallbackResponse.json();
                    console.log('✅ Got real completed SIP list data without advisorId parameter');
                    return { 
                        sips: Array.isArray(fallbackResult.data) ? fallbackResult.data : [], 
                        error: null,
                        totalItems: fallbackResult.pagination?.totalItems,
                        itemsPerPage: fallbackResult.pagination?.itemsPerPage,
                        totalPages: fallbackResult.pagination?.totalPages
                    };
                } else {
                    return { sips: [], error: "Error fetching data" };
                }
            } else {
                // Don't automatically sign out on 401 - could be backend issue
                console.warn("401 error without advisorId - returning empty data instead of signing out");
                return { sips: [], error: "Authentication issue - please try again" };
            }
        }

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const result = await response.json();
        
        return { 
            sips: Array.isArray(result.data) ? result.data : [], 
            error: null,
            totalItems: result.pagination?.totalItems,
            itemsPerPage: result.pagination?.itemsPerPage,
            totalPages: result.pagination?.totalPages
        };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { sips: [], error: "Error fetching data" };
    }
}

export default function CompletedSipListPage() {
    const [sips, setSips] = useState<Sip[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { selectedOption, customDates, selectedEmployee } = useGlobalContext();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            const { sips, error, totalItems: apiTotalItems, totalPages: apiTotalPages } = await fetchActiveSips(
                page, selectedOption, selectedEmployee, customDates, ""
            );
            setSips(sips);
            setError(error);
            
            if (apiTotalPages) setTotalPages(apiTotalPages);
            if (apiTotalItems) setTotalItems(apiTotalItems);
        } catch {
            setError("Failed to load data");
        }
    }, [page, selectedOption, customDates, selectedEmployee]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [selectedOption, customDates]);

    const handlePageChange = (newPage: number) => setPage(newPage);

    return (
        <div>
            <PageBreadcrumb pageTitle="Completed SIP List" />
            <div className="space-y-6">
                <ComponentCard title="Completed SIP List">
                    <ActiveSipTable sips={sips} error={error} />
                    {totalItems > 0 && (
                        <Pagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            onPageChange={handlePageChange} 
                        />
                    )}                
                </ComponentCard>
            </div>
        </div>
    );
}