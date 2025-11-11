"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TrendChartProps {
  title: string;
  categories: string[];
  seriesData: {
    name: string;
    data: number[];
  }[];
  colors: string[];
  yAxisTitle?: string;
  chartType?: "line" | "bar" | "area";
}

export default function TrendChart({
  title,
  categories,
  seriesData,
  colors,
  yAxisTitle = "",
  chartType = "bar",
}: TrendChartProps) {
  const options: ApexOptions = {
    chart: {
      type: chartType,
      height: 300,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        style: {
          color: "#6B7280",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (val) => {
          if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
          return `₹${val.toFixed(0)}`;
        },
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 6,
      },
    },
    colors: colors,
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontWeight: 500,
      labels: {
        colors: "#6B7280",
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    stroke: {
      width: chartType === "line" || chartType === "area" ? 3 : 0,
      curve: "smooth",
    },
    fill: {
      opacity: chartType === "area" ? 0.3 : 1,
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => {
          if (val >= 1000000) return `₹${(val / 1000000).toFixed(2)}M`;
          if (val >= 1000) return `₹${(val / 1000).toFixed(2)}K`;
          return `₹${val.toFixed(2)}`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      </div>
      <div className="max-w-full">
        <ReactApexChart options={options} series={seriesData} type={chartType} height={400} />
      </div>
    </div>
  );
}
