"use client";
import React from "react";
import { ClientProfileData } from "@/services";
import StockFydaaTable from "../tables/StockFydaaTable";

interface StockTabFydaaProps {
  clientData: ClientProfileData;
}

export default function StockTabFydaa({ clientData }: StockTabFydaaProps) {
  const mutualFundDetails = clientData.mutualFundDetails || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  // Get all mutual funds from all portfolios for Fydaa users
  const getAllMutualFunds = () => {
    const allFunds: ClientProfileData["mutualFundDetails"][0]["mutualFunds"] =
      [];
    mutualFundDetails.forEach((portfolio) => {
      if (portfolio.mutualFunds && portfolio.mutualFunds.length > 0) {
        allFunds.push(...portfolio.mutualFunds);
      }
    });
    return allFunds;
  };

  const allMutualFunds = getAllMutualFunds();

  return (
    <>
      {allMutualFunds && allMutualFunds.length > 0 ? (
        <StockFydaaTable
          allMutualFunds={allMutualFunds}
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
              No Mutual Funds Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This client has no mutual funds in their portfolio.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
