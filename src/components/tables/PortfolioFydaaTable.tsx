"use client";
import React from "react";
import { MutualFundDetail } from "@/services";

interface PortfolioFydaaTableProps {
  mutualFundDetails: MutualFundDetail[];
  formatCurrency: (value: number) => string;
}

export default function PortfolioFydaaTable({
  mutualFundDetails,
  formatCurrency,
}: PortfolioFydaaTableProps) {
  // Calculate invested amount for a portfolio
  const calculateInvestedAmount = (portfolio: MutualFundDetail): number => {
    if (!portfolio.mutualFunds || portfolio.mutualFunds.length === 0) {
      return 0;
    }
    return portfolio.mutualFunds.reduce(
      (sum, fund) => sum + fund.investedValue,
      0
    );
  };

  // Calculate absolute return percentage
  const calculateAbsoluteReturn = (
    currentValue: number,
    investedAmount: number
  ): string => {
    if (investedAmount === 0) return "0.00";
    const returnPercentage =
      ((currentValue - investedAmount) / investedAmount) * 100;
    return returnPercentage.toFixed(2);
  };

  // Get portfolio title
  const getPortfolioTitle = (
    portfolio: MutualFundDetail,
    index: number
  ): string => {
    // Check if goal exists and has a name
    if (portfolio.goal && portfolio.goal.length > 0 && portfolio.goal[0]) {
      return portfolio.goal[0].name;
    }
    
    // Check if SIP exists and has a name
    if (portfolio.sip && portfolio.sip.length > 0 && portfolio.sip[0]) {
      if (portfolio.sip[0].sipName) {
        return portfolio.sip[0].sipName;
      }
      if (portfolio.sip[0].userSipName) {
        return portfolio.sip[0].userSipName;
      }
    }

    // Default to numbered portfolio
    return `Mutual Fund Portfolio ${index + 1}`;
  };

  return (
    <>
      {mutualFundDetails.map((portfolio, index) => {
        const investedAmount = calculateInvestedAmount(portfolio);
        const absoluteReturn = calculateAbsoluteReturn(
          portfolio.currentValue,
          investedAmount
        );

        return (
          <div key={`${portfolio.sipId}-${index}`} className="mb-8">
            {/* Portfolio Name */}
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
              <h4 className="text-md font-medium dark:text-gray-400">
                {getPortfolioTitle(portfolio, index)}
              </h4>
            </div>

            {/* Portfolio Metrics - Row 1 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Invested Amount
                </p>
                <p className="font-medium dark:text-gray-400">
                  {formatCurrency(investedAmount)}
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

            {/* Portfolio Metrics - Row 2 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Realised Return
                </p>
                <p
                  className={`font-medium ${
                    portfolio.realizedReturn >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(portfolio.realizedReturn)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unrealised Return
                </p>
                <p
                  className={`font-medium ${
                    portfolio.unrealizedReturn >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(portfolio.unrealizedReturn)}
                </p>
              </div>
            </div>

            {/* Portfolio Metrics - Row 3 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Absolute Return
                </p>
                <p
                  className={`font-medium ${
                    parseFloat(absoluteReturn) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {absoluteReturn}%
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Profit
                </p>
                <p
                  className={`font-medium ${
                    portfolio.totalProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(portfolio.totalProfit)}
                </p>
              </div>
            </div>

            {/* SIP Details */}
            {portfolio.sip && portfolio.sip.length > 0 && portfolio.sip[0] && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  SIP Details
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SIP Amount
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(portfolio.sip[0].sipAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Goal Amount
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(portfolio.sip[0].goalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        portfolio.sip[0].status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : portfolio.sip[0].status === "CANCELLED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {portfolio.sip[0].status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tenure
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {portfolio.sip[0].sipTenure} months
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
