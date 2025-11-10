"use client";

import React from "react";
import DistributionChart from "./DistributionChart";

export default function InvestmentGoalsDistribution() {
  // TODO: Replace with actual API data based on timeframe
  const labels = ["Short Term Goals", "Medium Term Goals", "Long Term Goals"];
  const series = [25, 40, 35]; // Percentages
  const colors = ["#f59e0b", "#667eea", "#ec4899"]; // Amber, Indigo, Pink

  return (
    <DistributionChart
      title="Investment Goals Distribution"
      labels={labels}
      series={series}
      colors={colors}
    />
  );
}
