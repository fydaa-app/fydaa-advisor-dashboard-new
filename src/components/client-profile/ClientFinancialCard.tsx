"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { ClientProfileData } from "@/services";
import Badge from "@/components/ui/badge/Badge";

interface Props {
  client: ClientProfileData | null;
  error: string | null;
}

export default function ClientFinancialCard({ client, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const user = client?.userDetails;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const kycStatus = user?.panStatus === 'KYC_SUCCESS' ? 'Approved' : 
                   user?.panStatus === 'PENDING' ? 'Pending' : 
                   user?.panStatus === 'REJECTED' ? 'Rejected' : 'Unknown';

  return (
    <ComponentCard title="Financial Information">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Total Investment
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user ? formatCurrency(user.total_investment) : "₹0.00"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Current Balance
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user ? formatCurrency(user.current_balance) : "₹0.00"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            KYC Status
          </p>
          <Badge color={kycStatus === "Approved" ? "success" : kycStatus === "Pending" ? "warning" : "error"}>
            {kycStatus}
          </Badge>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Account Status
          </p>
          <Badge color={user?.main_subscription_status === 1 ? 'success' : 'error'}>
            {user?.main_subscription_status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Subscription Date
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.subscription_date ? new Date(user.subscription_date).toLocaleDateString('en-IN') : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Member Since
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "Not Provided"}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
