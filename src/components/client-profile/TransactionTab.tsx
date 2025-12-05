// components/client-profile/TransactionTab.tsx (updated)
import React from "react";
import { ClientProfileData } from "@/services";
import TransactionTable from "../tables/TransactionTable";
import ClientSipMfTransactionsTable from "../tables/ClientSipMfTransactionsTable";

interface TransactionTabProps {
  clientData: ClientProfileData;
}

export default function TransactionTab({ clientData }: TransactionTabProps) {
  // Determine which table to show based on user app type
  const isSavestment = clientData.userDetails.fromApp?.toLowerCase() === "savestment";
  
  // For Savestment users, show the existing transaction table
  if (isSavestment) {
    const transactions = clientData.userTransactionDetails;
    
    return (
      <>
        {transactions && transactions.length > 0 ? (
          <TransactionTable transactions={transactions} />
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                This client has not made any transactions yet.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }
  
  // For Fydaa users, show the new SIP MF transaction table
  const sipMfTransactions = clientData.transactionsMF || [];
  
  return (
    <>
      {sipMfTransactions.length > 0 ? (
        <ClientSipMfTransactionsTable transactions={sipMfTransactions} error={null} />
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No SIP MF Transactions Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This client has not made any SIP MF transactions yet.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
