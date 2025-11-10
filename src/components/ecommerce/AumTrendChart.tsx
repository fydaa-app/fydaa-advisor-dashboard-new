"use client";

import React from "react";
import TrendChart from "./TrendChart";

export default function AumTrendChart() {
  // TODO: Replace with actual API data based on timeframe from header
  // This is sample data - categories will change based on timeframe (Daily/Weekly/Monthly/Yearly)
  const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const seriesData = [
    {
      name: "AUM",
      data: [2500000, 2650000, 2800000, 2900000, 3100000, 3250000, 3400000, 3550000, 3700000, 3850000, 4000000, 4200000],
    },
  ];

  const colors = ["#3b82f6"]; // Blue

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
