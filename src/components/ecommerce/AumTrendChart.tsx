"use client";

import React from "react";
import { useGlobalContext } from "@/context/GlobalState";
import TrendChart from "./TrendChart";

export default function AumTrendChart() {
  const { appType } = useGlobalContext();

  // TODO: Replace with actual API data
  // Timeframe will be handled when API integration is done
  // For now, using static monthly data
  const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = [2500000, 2650000, 2800000, 2900000, 3100000, 3250000, 3400000, 3550000, 3700000, 3850000, 4000000, 4200000];

  const seriesData = [
    {
      name: "AUM",
      data: data,
    },
  ];

  // Color changes based on app type
  const colors = appType === "Fydaa" ? ["#667eea"] : ["#3b82f6"]; // Indigo for Fydaa, Blue for Savestment

  return (
    <TrendChart
      title="AUM Trend"
      categories={categories}
      seriesData={seriesData}
      colors={colors}
      yAxisTitle="Amount (₹)"
      chartType="bar"
    />
  );
}
