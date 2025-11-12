"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DistributionChartProps {
  title: string;
  labels: string[];
  series: number[];
  colors: string[];
}

export default function DistributionChart({ title, labels, series, colors }: DistributionChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
    },
    labels: labels,
    colors: colors,
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontWeight: 500,
      labels: {
        colors: "#6B7280",
      },
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    dataLabels: {
      enabled: false,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              offsetY: 5,
              formatter: (val) => `${val}%`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => {
                return `${series.reduce((a, b) => a + b, 0)}%`;
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      </div>
      <div className="max-w-full">
        <ReactApexChart options={options} series={series} type="donut" height={350} />
      </div>
    </div>
  );
}
