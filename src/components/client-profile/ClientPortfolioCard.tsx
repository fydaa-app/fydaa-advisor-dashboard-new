"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { ClientProfileData } from "@/services";

interface Props {
  client: ClientProfileData | null;
  error: string | null;
}

export default function ClientPortfolioCard({ client, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const portfolios = client?.portfolioDetails || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (portfolios.length === 0) {
    return (
      <ComponentCard title="Portfolios">
        <p className="text-gray-500 dark:text-gray-400">No portfolios found</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Portfolios">
      <div className="space-y-4">
        {portfolios.map((portfolio) => (
          <div 
            key={portfolio.portfolioId}
            className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]"
          >
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
              {portfolio.portfolioName}
            </h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Current Value
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatCurrency(portfolio.currentValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Invested
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatCurrency(portfolio.totalInvestedValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total Profit
                </p>
                <p className={`text-sm font-medium ${portfolio.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(portfolio.totalProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Returns
                </p>
                <p className={`text-sm font-medium ${portfolio.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {((portfolio.totalProfit / portfolio.totalInvestedValue) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}
