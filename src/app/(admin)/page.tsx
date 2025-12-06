"use client";

import React from "react";
import { useGlobalContext } from "@/context/GlobalState";
import TodaySaleWrapper from "@/components/ecommerce/TodaySaleWrapper";
import TodaySaleWrapperMf from "@/components/ecommerce/TodaySaleWrapperMf";
import PortfolioDistribution from "@/components/ecommerce/PortfolioDistribution";
import LatestSipsList from "@/components/ecommerce/LatestSipsList";
import AumTrendChart from "@/components/ecommerce/AumTrendChart";
import SipWrapper from "@/components/ecommerce/SipWrapper";

export default function Ecommerce() {
  const { appType } = useGlobalContext();

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards Section */}
      {appType === "Fydaa" ? <TodaySaleWrapperMf /> : <TodaySaleWrapper />}

      {/* SIP Summary Section - Only for Fydaa app type */}
      {appType === "Fydaa" && (
        <div className="w-full">
          <SipWrapper />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 auto-rows-fr">
        {/* Left Chart - Distribution (Goals/Portfolio) or Latest SIPs List */}
        <div className="col-span-12 xl:col-span-6 [&>*]:h-full">
          {appType === "Fydaa" ? <LatestSipsList /> : <PortfolioDistribution />}
        </div>

        {/* Right Chart - AUM Trend (Universal for both app types) */}
        <div className="col-span-12 xl:col-span-6 [&>*]:h-full">
          <AumTrendChart />
        </div>
      </div>
    </div>
  );
}
