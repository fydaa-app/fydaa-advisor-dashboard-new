"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGlobalContext } from "@/context/GlobalState";
import TodaySaleWrapper from "@/components/ecommerce/TodaySaleWrapper";
import TodaySaleWrapperMf from "@/components/ecommerce/TodaySaleWrapperMf";
// import TargetVsRealityChartMf from "@/components/ecommerce/TargetVsRealityChartMf";
// import MonthlyTargetMf from "@/components/ecommerce/MonthlyTargetMf";
// import DemographicCard from "@/components/ecommerce/DemographicCard";
// import TargetVsRealityChart from "@/components/ecommerce/TargetvsRealityChart";
// import TopGoals from "@/components/ecommerce/TopGoals";
// import TopPackages from "@/components/ecommerce/TopPackages";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Ecommerce() {
  const { appType } = useGlobalContext();

  // KPI rendering is handled by TodaySale wrappers

  const doughnutOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: appType === "Fydaa" ? ["Short Term Goals", "Medium Term Goals", "Long Term Goals"] : ["STOCK", "MUTUALFUND", "US-STOCK"],
    colors: appType === "Fydaa" ? ["#f59e0b", "#667eea", "#ec4899"] : ["#ec4899", "#f59e0b", "#667eea"],
    legend: { position: "bottom" },
    stroke: { width: 2 },
    dataLabels: { enabled: false },
  };

  const doughnutSeries = appType === "Fydaa" ? [25, 40, 35] : [35, 50, 15];

  const barDaily = {
    categories: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
    data: [26.5, 26.8, 27.2, 27.5, 27.9, 28.3, 28.7],
  };

  const barOptions: ApexOptions = {
    chart: { type: "bar", height: 300, toolbar: { show: false } },
    xaxis: { categories: barDaily.categories },
    plotOptions: { bar: { columnWidth: "39%", borderRadius: 6 } },
    colors: ["#667eea"],
    dataLabels: { enabled: false },
    legend: { position: "bottom" },
    grid: { yaxis: { lines: { show: true } } },
  };

  const lineOptions: ApexOptions = {
    chart: { type: "line", height: 300, toolbar: { show: false } },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
    stroke: { width: [3, 3], curve: "smooth" },
    colors: ["#667eea", "#f59e0b"],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
  };

  return (
    <div className="flex flex-col gap-6">
      {appType === "Fydaa" ? <TodaySaleWrapperMf /> : <TodaySaleWrapper />}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {appType === "Fydaa" ? "Investment Goals" : "Portfolio Type Distribution"}
              </h3>
            </div>
            <div className="max-w-full">
              <ReactApexChart options={doughnutOptions} series={doughnutSeries} type="donut" height={300} />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {appType === "Fydaa" ? "Daily AUM Trend" : "Performance vs Benchmark"}
              </h3>
            </div>
            <div className="max-w-full">
              {appType === "Fydaa" ? (
                <ReactApexChart options={barOptions} series={[{ name: "AUM", data: barDaily.data }]} type="bar" height={300} />
              ) : (
                <ReactApexChart options={lineOptions} series={[{ name: "Portfolio Performance", data: [98, 101, 104, 103, 107, 110] }, { name: "Benchmark", data: [100, 100, 102, 101, 103, 105] }]} type="line" height={300} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}