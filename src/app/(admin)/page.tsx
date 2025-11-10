"use client";

import React from "react";
import { useGlobalContext } from "@/context/GlobalState";
import TodaySaleWrapper from "@/components/ecommerce/TodaySaleWrapper";
import TodaySaleWrapperMf from "@/components/ecommerce/TodaySaleWrapperMf";
import InvestmentGoalsDistribution from "@/components/ecommerce/InvestmentGoalsDistribution";
import PortfolioDistribution from "@/components/ecommerce/PortfolioDistribution";
import AumTrendChart from "@/components/ecommerce/AumTrendChart";

export default function Ecommerce() {
  const { appType } = useGlobalContext();

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards Section */}
      {appType === "Fydaa" ? <TodaySaleWrapperMf /> : <TodaySaleWrapper />}

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Left Chart - Distribution (Goals or Portfolio) */}
        <div className="col-span-12 xl:col-span-6">
          {appType === "Fydaa" ? <InvestmentGoalsDistribution /> : <PortfolioDistribution />}
        </div>

        {/* Right Chart - AUM Trend (Universal for both app types) */}
        <div className="col-span-12 xl:col-span-6">
          <AumTrendChart />
        </div>
      </div>
    </div>
  );
}
