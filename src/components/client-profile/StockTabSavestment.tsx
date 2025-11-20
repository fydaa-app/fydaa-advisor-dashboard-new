"use client";
import React from "react";
import { ClientProfileData } from "@/services";
import StockSavestmentTable from "../tables/StockSavestmentTable";

interface StockTabSavestmentProps {
  clientData: ClientProfileData;
}

export default function StockTabSavestment({
  clientData,
}: StockTabSavestmentProps) {
  const portfolioDetails = clientData.portfolioDetails;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  // Get all stocks from all portfolios
  const getAllStocks = () => {
    const allStocks: ClientProfileData["portfolioDetails"][0]["stocks"] = [];
    portfolioDetails.forEach((portfolio) => {
      if (portfolio.stocks && portfolio.stocks.length > 0) {
        allStocks.push(...portfolio.stocks);
      }
    });
    return allStocks;
  };

  const allStocks = getAllStocks();

  return (
    <>
      {allStocks && allStocks.length > 0 ? (
        <StockSavestmentTable
          allStocks={allStocks}
          formatCurrency={formatCurrency}
        />
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8v8a4 4 0 01-8 0V8a4 4 0 018 0zM8 20l4-4 4 4M8 4l4 4 4-4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Stocks Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This client has no stocks in their portfolio.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
