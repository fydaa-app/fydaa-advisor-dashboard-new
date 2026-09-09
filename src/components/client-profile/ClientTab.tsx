"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Badge from "../ui/badge/Badge";
import { ClientProfileData, clientDocumentService } from "@/services";
import { xirrService, XIRRTableData } from "@/services";
import PortfolioTabFydaa from "./PortfolioTabFydaa";
import PortfolioTabSavestment from "./PortfolioTabSavestment";
import StockTabFydaa from "./StockTabFydaa";
import StockTabSavestment from "./StockTabSavestment";
import TransactionTab from "./TransactionTab";
import ProfileTab from "./ProfileTab";
import ReportsTab from "./ReportsTab";
import PerformanceXIRRTable from "../tables/PerformanceXIRRTable";
import AccountsTab from "./AccountsTab";

interface ClientTabProps {
  clientData: ClientProfileData;
}

export default function ClientTab({ clientData }: ClientTabProps) {
  const [activeTab, setActiveTab] = useState<string>("Portfolio");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const [xirrData, setXirrData] = useState<XIRRTableData | null>(null);
  const [loadingXIRR, setLoadingXIRR] = useState(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

  const userDetails = clientData.userDetails;
  const referralDetails = clientData.referralDetails;

  const isSavestment =
    clientData.userDetails.fromApp?.toLowerCase() === "savestment";

  // Download portfolio report PDF
  const downloadPortfolioReport = async () => {
    try {
      setDownloading("portfolioReport");
      await clientDocumentService.downloadPortfolioPdf(userDetails.id);
      alert("Portfolio report PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading portfolio report:", error);
      alert(`Failed to download portfolio report PDF: ${error}`);
    } finally {
      setDownloading(null);
    }
  };

  // Send portfolio report via email
  const sendPortfolioReportEmail = async () => {
    try {
      setSendingEmail("portfolioEmail");
      const result = await clientDocumentService.sendPortfolioEmail(
        userDetails.id,
        false
      );
      if (result.success) {
        alert("Portfolio report email sent successfully!");
      } else {
        throw new Error(
          result.message || "Failed to send portfolio report email"
        );
      }
    } catch (error) {
      console.error("Error sending portfolio report email:", error);
      alert(`Failed to send portfolio report email: ${error}`);
    } finally {
      setSendingEmail(null);
    }
  };

  // Download risk profile PDF
  const downloadRiskProfile = async () => {
    try {
      setDownloading("riskProfile");
      await clientDocumentService.downloadRiskProfilePdf(userDetails.id);
    } catch (error) {
      console.error("Error downloading risk profile:", error);
      alert("Failed to download Risk Profile PDF. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  // Download e-sign agreement PDF
  const downloadEsignAgreement = async () => {
    try {
      setDownloading("esignAgreement");
      await clientDocumentService.downloadEsignAgreement(userDetails.id);
    } catch (error) {
      console.error("Error downloading esign agreement:", error);
      alert("Failed to download Esign Agreement PDF. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  // Fetch XIRR data for Savestment users
  const fetchXIRRData = async () => {
    // Only fetch for Savestment users
    if (!isSavestment) {
      return;
    }

    try {
      setLoadingXIRR(true);
      setXirrError(null);
      const data = await xirrService.getUserXIRR(clientData.userDetails.id);
      if (data) {
        setXirrData(data);
      } else {
        setXirrError("Failed to load XIRR data");
      }
    } catch (error) {
      console.error("Error fetching XIRR data:", error);
      setXirrError("Failed to load XIRR data");
    } finally {
      setLoadingXIRR(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Fetch XIRR data when Portfolio tab is opened for Savestment users
    if (tab === "Portfolio" && isSavestment && !xirrData) {
      fetchXIRRData();
    }
  };

  useEffect(() => {
    if (
      activeTab === "Portfolio" &&
      clientData?.userDetails?.id &&
      isSavestment &&
      !xirrData
    ) {
      fetchXIRRData();
    }
  }, [activeTab, clientData?.userDetails?.id, isSavestment]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left Column - Client Profile */}
      <div className="col-span-12 xl:col-span-4 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="items-center w-full">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 mb-4">
              <Image
                width={80}
                height={80}
                src="/images/user/user-image.png"
                alt="client"
              />
            </div>
            <div className="order-3 xl:order-2 mb-4">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {[userDetails.firstName, userDetails.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </h4>

              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails.fromApp || "Client"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails.city}, {userDetails.country}
                </p>
              </div>

              {/* Additional Client Details */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Email: {userDetails.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Phone: {userDetails.callingCode} {userDetails.mobileNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  PAN Status: {userDetails.panStatus}
                </p>
              </div>

              {/* Referral Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Referral Information
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {referralDetails ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-400">
                          Referred By
                        </p>
                        <p className="text-theme-sm text-gray-500">
                          {referralDetails.firstName} {referralDetails.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-400">
                          Contact
                        </p>
                        <p className="text-theme-sm text-gray-500">
                          {referralDetails.callingCode}{" "}
                          {referralDetails.mobileNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-400">
                          Referral Code
                        </p>
                        <p className="text-theme-sm text-gray-500">
                          {userDetails.referralCode}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <Badge color="error">Not Mapped</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tabs Content */}
      <div className="col-span-12 xl:col-span-8 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {["Portfolio", "Transaction", isSavestment ? "Stock" : "Mutual Funds", ...(isSavestment ? ["Account Ledger"] : []), "Profile", "Reports"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  ${
                    activeTab === tab
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Tabs Content */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Portfolio Tab */}
            {activeTab === "Portfolio" &&
              (isSavestment ? (
                <PortfolioTabSavestment
                  clientData={clientData}
                  downloading={downloading}
                  sendingEmail={sendingEmail}
                  xirrData={xirrData}
                  loadingXIRR={loadingXIRR}
                  xirrError={xirrError}
                  onDownloadReport={downloadPortfolioReport}
                  onSendEmail={sendPortfolioReportEmail}
                />
              ) : (
                <PortfolioTabFydaa clientData={clientData} />
              ))}

            {/* Transaction Tab */}
            {activeTab === "Transaction" && (
              <TransactionTab clientData={clientData} />
            )}

            {/* Stock Tab */}
            {(activeTab === "Stock" || activeTab === "Mutual Funds") &&
              (isSavestment ? (
                <StockTabSavestment clientData={clientData} />
              ) : (
                <StockTabFydaa clientData={clientData} />
              ))}

            {/* Accounts Tab */}
            {activeTab === "Account Ledger" && (
              <AccountsTab userId={userDetails.id} />
            )}

            {/* Profile Tab */}
            {activeTab === "Profile" && <ProfileTab clientData={clientData} />}

            {/* Reports Tab */}
            {activeTab === "Reports" && (
              <ReportsTab
                downloading={downloading}
                onDownloadRiskProfile={downloadRiskProfile}
                onDownloadEsignAgreement={downloadEsignAgreement}
              />
            )}
          </div>
        </div>
      </div>

      {/* XIRR Table - Full width below all content - Only visible when Portfolio tab is active for Savestment users */}
      {activeTab === "Portfolio" &&
        isSavestment &&
        xirrData &&
        xirrService.hasValidData(xirrData) && (
          <div className="col-span-12 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
              <h3 className="text-lg font-semibold dark:text-gray-400">
                Performance Metrics (XIRR)
              </h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <PerformanceXIRRTable
                portfolioXIRR={xirrData.portfolioXIRR}
                benchmarkXIRR={xirrData.benchmarkXIRR}
                loading={loadingXIRR}
                error={xirrError}
              />
            </div>
          </div>
        )}

      {/* Show "No Data" for Savestment users when Portfolio tab is active but no valid XIRR */}
      {activeTab === "Portfolio" &&
        isSavestment &&
        xirrData &&
        !xirrService.hasValidData(xirrData) &&
        !loadingXIRR && (
          <div className="col-span-12 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
              <h3 className="text-lg font-semibold dark:text-gray-400">
                Performance Metrics
              </h3>
            </div>
            <div className="flex justify-center items-center py-8">
              <Badge color="warning">No XIRR Data Available</Badge>
            </div>
          </div>
        )}
    </div>
  );
}
