"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { AdvisorData } from "@/services";

interface Props {
  advisor: AdvisorData | null;
  error: string | null;
}

export default function AdvisorStatsCard({ advisor, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <ComponentCard title="Statistics">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Assigned Count
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.assigned_count ? `${advisor.assigned_count}` : "0"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Status
          </p>
          <p
            className={`text-base font-medium ${
              advisor?.isActive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {advisor?.isActive ? "Active" : "Inactive"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Member Since
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.createdAt
              ? new Date(advisor.createdAt).toLocaleDateString()
              : "Not Provided"}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
