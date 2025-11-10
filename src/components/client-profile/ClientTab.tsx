"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ClientProfileData, clientDocumentService } from "@/services";

interface ClientTabProps {
  clientData: ClientProfileData;
}

export default function ClientTab({ clientData }: ClientTabProps) {
  const [activeTab, setActiveTab] = useState<string>('Portfolio');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  
  const userDetails = clientData.userDetails;
  const portfolioDetails = clientData.portfolioDetails;
  const transactions = clientData.userTransactionDetails;
  const advisor = clientData.advisor;
  const relationshipManager = clientData.relationshipManager;
  const referralDetails = clientData.referralDetails;

  // Format currency values
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);

  // Get all stocks from all portfolios
  const getAllStocks = () => {
    const allStocks: ClientProfileData['portfolioDetails'][0]['stocks'] = [];
    portfolioDetails.forEach(portfolio => {
      if (portfolio.stocks && portfolio.stocks.length > 0) {
        allStocks.push(...portfolio.stocks);
      }
    });
    return allStocks;
  };

  const allStocks = getAllStocks();

  // Download portfolio report PDF
  const downloadPortfolioReport = async () => {
    try {
      setDownloading('portfolioReport');
      await clientDocumentService.downloadPortfolioPdf(userDetails.id);
      alert('Portfolio report PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading portfolio report:', error);
      alert(`Failed to download portfolio report PDF: ${error}`);
    } finally {
      setDownloading(null);
    }
  };

  // Send portfolio report via email
  const sendPortfolioReportEmail = async () => {
    try {
      setSendingEmail('portfolioEmail');
      const result = await clientDocumentService.sendPortfolioEmail(userDetails.id, false);
      if (result.success) {
        alert('Portfolio report email sent successfully!');
      } else {
        throw new Error(result.message || 'Failed to send portfolio report email');
      }
    } catch (error) {
      console.error('Error sending portfolio report email:', error);
      alert(`Failed to send portfolio report email: ${error}`);
    } finally {
      setSendingEmail(null);
    }
  };

  // Download risk profile PDF
  const downloadRiskProfile = async () => {
    try {
      setDownloading('riskProfile');
      await clientDocumentService.downloadRiskProfilePdf(userDetails.id);
    } catch (error) {
      console.error('Error downloading risk profile:', error);
      alert('Failed to download Risk Profile PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // Download e-sign agreement PDF
  const downloadEsignAgreement = async () => {
    try {
      setDownloading('esignAgreement');
      await clientDocumentService.downloadEsignAgreement(userDetails.id);
    } catch (error) {
      console.error('Error downloading esign agreement:', error);
      alert('Failed to download Esign Agreement PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

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
                {[userDetails.firstName, userDetails.lastName].filter(Boolean).join(' ')}
              </h4>

              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails.fromApp || 'Client'}
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
              {referralDetails && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Referral Information</h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-400">Referred By</p>
                        <p className="text-theme-sm text-gray-500">{referralDetails.firstName} {referralDetails.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-400">Contact</p>
                        <p className="text-theme-sm text-gray-500">{referralDetails.callingCode} {referralDetails.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-400">Referral Code</p>
                        <p className="text-theme-sm text-gray-500">{userDetails.referralCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tabs Content */}
      <div className="col-span-12 xl:col-span-8 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {['Portfolio', 'Transaction', 'Stock', 'Profile', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  ${
                    activeTab === tab 
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            
            {/* Portfolio Tab */}
            {activeTab === 'Portfolio' && (
              <div className="p-4">
                {portfolioDetails && portfolioDetails.length > 0 ? (
                  <>
                    {/* Portfolio Overview Section with Download/Email Buttons */}
                    <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold dark:text-gray-400">Portfolio Overview</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={downloadPortfolioReport}
                            disabled={downloading === 'portfolioReport'}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                            title="Download Portfolio Report PDF"
                          >
                            {downloading === 'portfolioReport' ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                              </>
                            )}
                          </button>

                          <button
                            onClick={sendPortfolioReportEmail}
                            disabled={sendingEmail === 'portfolioEmail'}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                            title="Send Portfolio Report via Email"
                          >
                            {sendingEmail === 'portfolioEmail' ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Sending...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Report
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Details */}
                    {portfolioDetails.map((portfolio) => (
                      <div key={portfolio.portfolioId} className="mb-6">
                        <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                          <h4 className="text-md font-medium dark:text-gray-400">{portfolio.portfolioName}</h4>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                            <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalInvestedValue)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                            <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.currentValue)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Realised Profit</p>
                            <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.realizedReturn)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Profit</p>
                            <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.unrealizedReturn)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return</p>
                            <p className="font-medium dark:text-gray-400">
                              {portfolio.totalInvestedValue > 0 
                                ? (((portfolio.currentValue - portfolio.totalInvestedValue) / portfolio.totalInvestedValue) * 100).toFixed(2)
                                : '0.00'
                              }%
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                            <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalProfit)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Portfolio Found</h3>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction Tab */}
            {activeTab === 'Transaction' && (
              <>
                {transactions && transactions.length > 0 ? (
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Transaction ID</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Date</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Type</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Amount</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Quantity</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.transactionId}>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{transaction.transactionId}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <Badge color={transaction.orderType === 'BUY' ? 'success' : 'error'}>
                              {transaction.orderType}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(transaction.totalAmount)}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{transaction.totalTradeQty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Transactions Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">This client has not made any transactions yet.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Stock Tab */}
            {activeTab === 'Stock' && (
              <>
                {allStocks && allStocks.length > 0 ? (
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Stock Name</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Ticker</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Type</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Quantity</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Avg. Price</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Current Value</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Profit/Loss</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {allStocks.map((stock, index) => (
                        <TableRow key={`${stock.stockId}-${index}`}>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.stockName}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.ticker}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <Badge color="info">{stock.capType}</Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.balanceQty}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(stock.averagePrice)}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(stock.currentValue)}</TableCell>
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            <span className={stock.totalProfit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {formatCurrency(stock.totalProfit)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8a4 4 0 01-8 0V8a4 4 0 018 0zM8 20l4-4 4 4M8 4l4 4 4-4" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Stocks Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">This client has no stocks in their portfolio.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Profile Tab */}
            {activeTab === 'Profile' && (
              <div className="p-4 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-400">Date of Birth</p>
                      <p className="text-theme-sm text-gray-500">{new Date(userDetails.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-400">Gender</p>
                      <p className="text-theme-sm text-gray-500">{userDetails.gender}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-900 dark:text-gray-400">Address</p>
                      <p className="text-theme-sm text-gray-500">{userDetails.address?.addressLine1}</p>
                      {userDetails.address?.addressLine2 && (
                        <p className="text-theme-sm text-gray-500">{userDetails.address.addressLine2}</p>
                      )}
                      <p className="text-theme-sm text-gray-500">{userDetails.city}, {userDetails.state} - {userDetails.pincode}</p>
                      <p className="text-theme-sm text-gray-500">{userDetails.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-400">KYC Status</p>
                      <Badge color={userDetails.panStatus === 'KYC_SUCCESS' ? 'success' : 'error'}>
                        {userDetails.panStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Goal Information */}
                {userDetails.userGoal && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Investment Goals</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">SIP Amount</p>
                        <p className="font-medium dark:text-gray-400">{formatCurrency(userDetails.userGoal.sipAmount)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Goal Amount</p>
                        <p className="font-medium dark:text-gray-400">{formatCurrency(userDetails.userGoal.goalAmount)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Time Period</p>
                        <p className="font-medium dark:text-gray-400">{userDetails.userGoal.timePeriod} years</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expected Interest Rate</p>
                        <p className="font-medium dark:text-gray-400">{userDetails.userGoal.interestRate}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advisor Details */}
                {advisor && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Advisor Details</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-4 mb-4">
                        {advisor.photo ? (
                          <img 
                            src={advisor.photo} 
                            alt={advisor.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                              {advisor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{advisor.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{advisor.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Email</p>
                          <a href={`mailto:${advisor.email}`} className="text-theme-sm text-blue-600 hover:underline">
                            {advisor.email}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Mobile</p>
                          <a href={`tel:${advisor.mobile}`} className="text-theme-sm text-blue-600 hover:underline">
                            {advisor.mobile}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Age</p>
                          <p className="text-theme-sm text-gray-500">{advisor.age} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Experience</p>
                          <p className="text-theme-sm text-gray-500">{advisor.experienceInYears} years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Relationship Manager Details */}
                {relationshipManager && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Relationship Manager</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-4 mb-4">
                        {relationshipManager.photo ? (
                          <img 
                            src={relationshipManager.photo} 
                            alt={relationshipManager.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                              {relationshipManager.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{relationshipManager.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{relationshipManager.description}</p>
                          <div className="mt-2">
                            <Badge color="info">
                              {relationshipManager.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Email</p>
                          <a href={`mailto:${relationshipManager.email}`} className="text-theme-sm text-blue-600 hover:underline">
                            {relationshipManager.email}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Mobile</p>
                          <a href={`tel:${relationshipManager.mobileNumber}`} className="text-theme-sm text-blue-600 hover:underline">
                            {relationshipManager.mobileNumber}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'Reports' && (
              <div className="p-6">
                <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Download Reports</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Download user risk profile and esign agreement documents
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk Profile Card */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Risk Profile</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">User investment risk assessment</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadRiskProfile}
                      disabled={downloading === 'riskProfile'}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {downloading === 'riskProfile' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Risk Profile
                        </>
                      )}
                    </button>
                  </div>

                  {/* E-sign Agreement Card */}
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Esign Agreement</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Digital signature agreement document</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadEsignAgreement}
                      disabled={downloading === 'esignAgreement'}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {downloading === 'esignAgreement' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Esign Agreement
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
