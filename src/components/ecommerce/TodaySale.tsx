"use client";
import React from "react";
import { SalesIcon, NewCustomerIcon, DiscIcon } from "@/icons";
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface DataProps {
  totalClients: number;
  totalAUM: number;
  activePortfoliosOrSips: number;
  activeClients?: number;
  inactiveClients?: number;
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
  const thirdCardLabel = appType === "Fydaa" ? "Invested SIPs" : "Invested Portfolios";

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
          {/* Card 1: Total Clients */}
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <NewCustomerIcon />
              <h2 className="numbers-sale text-gray-900 ">
                {formatNumber(data.totalClients)}
              </h2>
              <p className="total-sale-text">
                <a href="/clients" className="flex items-center gap-2 hover:italic transition-all duration-300 group">
                  Total Clients
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                    <ArrowRightIcon className="w-3 h-3 inline-block" />
                  </span>
                </a>
              </p>
              {/* Show active/inactive breakdown for Fydaa */}
              {appType === "Fydaa" && (data.activeClients !== undefined || data.inactiveClients !== undefined) && (
                <div className="mt-2 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <a href="/clients?investmentStatus=active" className="hover:italic transition-all duration-300 group flex items-center gap-1">
                      <span>Active:</span>
                      <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRightIcon className="w-2 h-2 inline-block" />
                      </span>
                    </a>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatNumber(data.activeClients || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <a href="/clients?investmentStatus=inactive" className="hover:italic transition-all duration-300 group flex items-center gap-1">
                      <span>Inactive:</span>
                      <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRightIcon className="w-2 h-2 inline-block" />
                      </span>
                    </a>
                    <span className="font-semibold text-gray-500 dark:text-gray-500">
                      {formatNumber(data.inactiveClients || 0)}
                    </span>
                  </div>
                </div>
              )}
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 2: Total AUM */}
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900 ">
                {formatCurrency(data.totalAUM)}
              </h2>
              <p className="total-sale-text">Total AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 3: Active Portfolios / Active SIPs */}
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <DiscIcon />
              <h2 className="numbers-sale text-gray-900 ">
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
