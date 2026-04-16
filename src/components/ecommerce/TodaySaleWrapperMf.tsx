"use client";
import React, { useState, useEffect } from "react";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import { getAdvisorCardsData, type TodaySalesData, clientService } from "@/services";
import { isAuthenticated, delayForAppSwitch } from "@/utils/authUtils";

const TodaySaleWrapperMf = () => {
  const [salesData, setSalesData] = useState<TodaySalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeInactiveCounts, setActiveInactiveCounts] = useState<{ active: number; inactive: number } | null>(null);
  const { selectedOption, customDates, selectedEmployee } = useGlobalContext();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSalesData = async () => {
      // Check if user is authenticated before making API calls
      if (!isAuthenticated()) {
        console.warn("User not authenticated, skipping API call");
        setLoading(false);
        return;
      }

      // Add delay to prevent race conditions during app switching
      await delayForAppSwitch(150);

      // Use selectedAdvisor from localStorage (admin selection) ONLY if user is admin
      const selectedAdvisorId = user?.isAdmin ? localStorage.getItem("selectedAdvisorId") : null;
      const advisorId = selectedAdvisorId || selectedEmployee || user?.id?.toString();

      if (!advisorId) {
        console.error("No advisor ID available");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getAdvisorCardsData({
          selectedOption,
          customDates,
          selectedEmployee: advisorId,
          appType: "Fydaa",
        });

        if (data) {
          setSalesData(data);
          console.log('✅ Successfully fetched real advisor cards data');
        } else {
          // If data is null, try to get real data without advisorId
          console.warn("API returned null, trying to get real data without advisorId");
          const fallbackData = await getAdvisorCardsData({
            selectedOption,
            customDates,
            selectedEmployee: "", // Remove advisorId
            appType: "Fydaa",
          });
          
          if (fallbackData) {
            setSalesData(fallbackData);
            console.log('✅ Got real data without advisorId parameter');
          } else {
            setSalesData(null);
            console.warn("Could not get real data, showing empty state");
          }
        }
      } catch (error) {
        console.error("Error fetching advisor cards data:", error);
        
        // If error occurred with advisorId, try without it to get real data
        if (advisorId) {
          try {
            console.warn("Trying to get real data without advisorId due to error");
            const fallbackData = await getAdvisorCardsData({
              selectedOption,
              customDates,
              selectedEmployee: "", // Remove advisorId
              appType: "Fydaa",
            });
            
            if (fallbackData) {
              setSalesData(fallbackData);
              console.log('✅ Got real data without advisorId parameter after error');
            } else {
              setSalesData(null);
            }
          } catch (fallbackError) {
            console.error("Fallback API call also failed:", fallbackError);
            setSalesData(null);
          }
        } else {
          setSalesData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedOption, customDates, selectedEmployee, user?.id]);

  // Fetch active/inactive client counts
  useEffect(() => {
    const fetchActiveInactiveCounts = async () => {
      if (!isAuthenticated()) {
        return;
      }

      const advisorId = selectedEmployee || user?.id?.toString();
      if (!advisorId) {
        return;
      }

      // Validate and cast selectedOption to the expected type
      const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly', 'till_date', 'custom'] as const;
      type Timeframe = typeof validTimeframes[number];
      const timeframe = validTimeframes.includes(selectedOption as Timeframe) 
        ? (selectedOption as Timeframe) 
        : undefined;

      try {
        // Fetch active clients count
        const activeData = await clientService.fetchAdvisorClients(
          parseInt(advisorId),
          {
            appType: 'fydaa',
            page: 1,
            limit: 1, // Just need count, so fetch 1 record
            timeframe: timeframe,
            startDate: customDates?.start,
            endDate: customDates?.end,
            investmentStatus: 'active'
          }
        );

        // Fetch inactive clients count
        const inactiveData = await clientService.fetchAdvisorClients(
          parseInt(advisorId),
          {
            appType: 'fydaa',
            page: 1,
            limit: 1, // Just need count, so fetch 1 record
            timeframe: timeframe,
            startDate: customDates?.start,
            endDate: customDates?.end,
            investmentStatus: 'inactive'
          }
        );

        setActiveInactiveCounts({
          active: activeData.pagination.total,
          inactive: inactiveData.pagination.total,
        });
      } catch (error) {
        console.error('Error fetching active/inactive counts:', error);
      }
    };

    fetchActiveInactiveCounts();
  }, [selectedOption, customDates, selectedEmployee, user?.id]);

  // Combine salesData with active/inactive counts
  const enhancedSalesData = salesData && activeInactiveCounts ? {
    ...salesData,
    activeClients: activeInactiveCounts.active,
    inactiveClients: activeInactiveCounts.inactive,
  } : salesData;

  return <TodaySale data={enhancedSalesData} loading={loading} appType="Fydaa" />;
};

export default TodaySaleWrapperMf;
