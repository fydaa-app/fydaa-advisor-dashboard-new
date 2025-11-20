"use client";
import React from "react";
import { ClientProfileData } from "@/services";

interface PortfolioSavestmentTableProps {
  portfolioDetails: ClientProfileData["portfolioDetails"];
  formatCurrency: (value: number) => string;
}

export default function PortfolioSavestmentTable({
  portfolioDetails,
  formatCurrency,
}: PortfolioSavestmentTableProps) {
  return (
    <>
      {portfolioDetails.map((portfolio) => (
        <div key={portfolio.portfolioId} className="mb-6">
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
            <h4 className="text-md font-medium dark:text-gray-400">
              {portfolio.portfolioName}
            </h4>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invested Amount
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(portfolio.totalInvestedValue)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Value
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(portfolio.currentValue)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Realised Profit
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(portfolio.realizedReturn)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Unrealised Profit
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(portfolio.unrealizedReturn)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Absolute Return
              </p>
              <p className="font-medium dark:text-gray-400">
                {portfolio.totalInvestedValue > 0
                  ? (
                      ((portfolio.currentValue - portfolio.totalInvestedValue) /
                        portfolio.totalInvestedValue) *
                      100
                    ).toFixed(2)
                  : "0.00"}
                %
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Profit
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(portfolio.totalProfit)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
