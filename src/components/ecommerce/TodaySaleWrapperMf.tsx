"use client";
import React, { useState, useEffect } from "react";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import { getAdvisorCardsData, type TodaySalesData } from "@/services";
import { isAuthenticated, delayForAppSwitch } from "@/utils/authUtils";

const TodaySaleWrapperMf = () => {
  const [salesData, setSalesData] = useState<TodaySalesData | null>(null);
  const [loading, setLoading] = useState(true);
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

      // Use selectedEmployee if available, otherwise fallback to logged-in user's ID
      const advisorId = selectedEmployee || user?.id?.toString();

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

  return <TodaySale data={salesData} loading={loading} appType="Fydaa" />;
};

export default TodaySaleWrapperMf;
