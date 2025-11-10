"use client";

import React from "react";
import TrendChart from "./TrendChart";

export default function SipTrendChart() {
  // TODO: Replace with actual API data based on timeframe from header
  // This is sample data - categories will change based on timeframe (Daily/Weekly/Monthly/Yearly)
  const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const seriesData = [
    {
      name: "SIP Amount",
      data: [150000, 165000, 180000, 195000, 210000, 225000, 240000, 255000, 270000, 285000, 300000, 315000],
    },
  ];

  const colors = ["#10b981"]; // Green

  return (
    <TrendChart
      title="SIP Trend"
      categories={categories}
      seriesData={seriesData}
      colors={colors}
      yAxisTitle="SIP Amount (₹)"
      chartType="area"
    />
  );
}
