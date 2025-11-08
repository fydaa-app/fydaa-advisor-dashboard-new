"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { ClientProfileData } from "@/services";

interface Props {
  client: ClientProfileData | null;
  error: string | null;
}

export default function ClientGoalCard({ client, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const userGoal = client?.userDetails?.userGoal;

  if (!userGoal) {
    return (
      <ComponentCard title="Investment Goals">
        <p className="text-gray-500 dark:text-gray-400">No investment goals set</p>
      </ComponentCard>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <ComponentCard title="Investment Goals">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Goal Amount
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {formatCurrency(userGoal.goalAmount)}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            SIP Amount
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {formatCurrency(userGoal.sipAmount)}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Time Period
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {userGoal.timePeriod} years
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Expected Interest Rate
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {userGoal.interestRate}% per annum
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
