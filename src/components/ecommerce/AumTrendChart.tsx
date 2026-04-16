"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
import TrendChart from "./TrendChart";
import { getAumTrendData, AumTrendDataPoint } from "@/services/aumTrendService";

export default function AumTrendChart() {
  const { appType, selectedOption, customDates, selectedEmployee } = useGlobalContext();
  const { user } = useAuth(); // Get logged-in user
  
  const [chartData, setChartData] = useState<{
    categories: string[];
    data: number[];
  }>({
    categories: [],
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate dynamic chart title based on timeframe
  const chartTitle = useMemo(() => {
    if (!selectedOption) return "AUM Trend";

    switch (selectedOption) {
      case "daily":
        return "Daily AUM Trend";
      case "weekly":
        return "Weekly AUM Trend";
      case "monthly":
        return "Monthly AUM Trend";
      case "yearly":
        return "Yearly AUM Trend";
      case "till_date":
        return "AUM Trend";
      case "custom":
        if (customDates.start && customDates.end) {
          // Format dates for display (e.g., "01 Jan 2024 - 31 Dec 2024")
          const startDate = new Date(customDates.start);
          const endDate = new Date(customDates.end);
          
          const formatDate = (date: Date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
          };

          return `${formatDate(startDate)} - ${formatDate(endDate)} AUM Trend`;
        }
        return "Custom AUM Trend";
      default:
        return "AUM Trend";
    }
  }, [selectedOption, customDates]);

  useEffect(() => {
    const fetchAumTrend = async () => {
      // Check if we have required data
      if (!appType || !selectedOption) {
        setLoading(false);
        return;
      }

      // Use selectedAdvisor from localStorage (admin selection) ONLY if user is admin
      const selectedAdvisorId = user?.isAdmin ? localStorage.getItem("selectedAdvisorId") : null;
      const advisorId = selectedAdvisorId || selectedEmployee || (user?.id ? String(user.id) : undefined);

      // Backend requires advisorId
      if (!advisorId) {
        console.warn('No advisor ID available');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const trendData = await getAumTrendData({
          selectedOption,
          customDates,
          selectedEmployee: advisorId,
          appType,
        });

        if (trendData && trendData.length > 0) {
          // Transform API data to chart format
          const categories = trendData.map((item: AumTrendDataPoint) => item.date);
          const data = trendData.map((item: AumTrendDataPoint) => item.aum);
          
          setChartData({ categories, data });
        } else {
          // Set empty data if no results
          setChartData({ categories: [], data: [] });
        }
      } catch (err) {
        console.error("Error fetching AUM trend:", err);
        setError("Failed to load AUM trend data");
      } finally {
        setLoading(false);
      }
    };

    fetchAumTrend();
  }, [appType, selectedOption, customDates, selectedEmployee, user?.id]);

  const seriesData = [
    {
      name: "AUM",
      data: chartData.data,
    },
  ];

  // Color changes based on app type
  const colors = appType === "Fydaa" ? ["#667eea"] : ["#3b82f6"];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-gray-500 dark:text-gray-400">Loading AUM trend data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (chartData.categories.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{chartTitle}</h3>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-gray-500 dark:text-gray-400">No data available for the selected period</div>
        </div>
      </div>
    );
  }

  return (
    <TrendChart
      title={chartTitle}
      categories={chartData.categories}
      seriesData={seriesData}
      colors={colors}
      yAxisTitle="Amount (₹)"
      chartType="bar"
    />
  );
}
