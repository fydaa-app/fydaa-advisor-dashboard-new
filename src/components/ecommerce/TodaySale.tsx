"use client";
import React from "react";
import { SalesIcon, NewCustomerIcon, OrderIcon } from "@/icons";

interface DataProps {
  totalClients: number;
  totalAUM: number;
  activePortfoliosOrSips: number;
}

interface TodaySaleProps {
  data: DataProps | null;
  loading: boolean;
  appType: string; // "Fydaa" or "Savestment"
}

const TodaySale = ({ data, loading, appType }: TodaySaleProps) => {
  if (loading) {
    return (
      <div className="grid">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full">
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number): string =>
    new Intl.NumberFormat("en-IN").format(value);

  // Determine the label for third card based on app type
  const thirdCardLabel = appType === "Fydaa" ? "Active SIPs" : "Active Portfolios";

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Overview
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Key metrics
            </span>
          </div>
        </div>

        <div className="sales-box-row mt-5 flex flex-nowrap xl:flex-nowrap items-stretch gap-4 overflow-x-auto xl:overflow-visible">
          {/* Card 1: Total Active Clients */}
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <NewCustomerIcon />
              <h2 className="numbers-sale text-gray-900 dark:text-white">
                {formatNumber(data.totalClients)}
              </h2>
              <p className="total-sale-text">Total Active Clients</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 2: Total AUM */}
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900 dark:text-white">
                {formatCurrency(data.totalAUM)}
              </h2>
              <p className="total-sale-text">Total AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 3: Active Portfolios / Active SIPs */}
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <OrderIcon />
              <h2 className="numbers-sale text-gray-900 dark:text-white">
                {formatNumber(data.activePortfoliosOrSips)}
              </h2>
              <p className="total-sale-text">{thirdCardLabel}</p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySale;
