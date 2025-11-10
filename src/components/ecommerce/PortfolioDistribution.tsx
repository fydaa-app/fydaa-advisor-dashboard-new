"use client";

import React from "react";
import DistributionChart from "./DistributionChart";

export default function PortfolioDistribution() {
  // TODO: Replace with actual API data based on timeframe
  const labels = [
    "Fixed Income Bonds",
    "Indian Stock",
    "Gold",
    "Real Estate",
    "Global Stock",
    "US Stock",
  ];
  const series = [20, 25, 10, 15, 20, 10]; // Percentages
  const colors = ["#10b981", "#3b82f6", "#fbbf24", "#8b5cf6", "#ef4444", "#06b6d4"]; 
  // Green, Blue, Yellow, Purple, Red, Cyan

  return (
    <DistributionChart
      title="Portfolio Type Distribution"
      labels={labels}
      series={series}
      colors={colors}
    />
  );
}
