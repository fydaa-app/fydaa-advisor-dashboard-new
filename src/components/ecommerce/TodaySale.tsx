"use client";
import React from "react";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon } from "@/icons";

interface DataProps {
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalUsers?: number;
  assetsUnderManagement: number;
}

const TodaySale = ({ data, loading }: { data: DataProps | null; loading: boolean }) => {
  if (loading) {
    return <p>Loading sales data...</p>;
  }

  if (!data) {
    return <p>No sales data available.</p>;
  }
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

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
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <NewCustomerIcon />
              <h2 className="numbers-sale text-gray-900">{data.activeUsers ?? data.totalUsers ?? 0}</h2>
              <p className="total-sale-text">Total Active Clients</p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">{formatCurrency(data.assetsUnderManagement)}</h2>
              <p className="total-sale-text">Total AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <NewCustomerIcon /> 
              <h2 className="numbers-sale text-gray-900">{data.totalNoOfTransactions ?? 0}</h2>
              <p className="total-sale-text">Active Portfolios</p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <DiscIcon />
              <h2 className="numbers-sale text-gray-900">+6.8%</h2>
              <p className="total-sale-text">Average YTD Performance</p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <OrderIcon />
              <h2 className="numbers-sale text-gray-900">{formatCurrency(data.totalRevenue || 0)}</h2>
              <p className="total-sale-text">Total Transactions Value</p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
            <div className="box-total-sales h-full">
              <OrderIcon />
              <h2 className="numbers-sale text-gray-900">{data.noOfPayments ?? 0}</h2>
              <p className="total-sale-text">Active SIPs</p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySale;