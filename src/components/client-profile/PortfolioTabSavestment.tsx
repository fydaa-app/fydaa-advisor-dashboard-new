"use client";
import React from "react";
import { ClientProfileData, XIRRTableData } from "@/services";
import PortfolioSavestmentTable from "../tables/PortfolioSavestmentTable";

interface PortfolioTabSavestmentProps {
  clientData: ClientProfileData;
  downloading: string | null;
  sendingEmail: string | null;
  xirrData: XIRRTableData | null;
  loadingXIRR: boolean;
  xirrError: string | null;
  onDownloadReport: () => void;
  onSendEmail: () => void;
}

export default function PortfolioTabSavestment({
  clientData,
  downloading,
  sendingEmail,
  onDownloadReport,
  onSendEmail,
}: PortfolioTabSavestmentProps) {
  const portfolioDetails = clientData.portfolioDetails;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <>
      <div className="p-4">
        {portfolioDetails && portfolioDetails.length > 0 ? (
          <>
            {/* Portfolio Overview Section with Download/Email Buttons */}
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-gray-400">
                  Portfolio Overview
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={onDownloadReport}
                    disabled={downloading === "portfolioReport"}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                    title="Download Portfolio Report PDF"
                  >
                    {downloading === "portfolioReport" ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>

                  <button
                    onClick={onSendEmail}
                    disabled={sendingEmail === "portfolioEmail"}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                    title="Send Portfolio Report via Email"
                  >
                    {sendingEmail === "portfolioEmail" ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Portfolio Details */}
            <PortfolioSavestmentTable
              portfolioDetails={portfolioDetails}
              formatCurrency={formatCurrency}
            />
          </>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Portfolio Found
              </h3>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
