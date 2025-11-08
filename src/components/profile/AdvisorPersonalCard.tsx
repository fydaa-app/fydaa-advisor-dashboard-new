"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { AdvisorData } from "@/services";

interface Props {
  advisor: AdvisorData | null;
  error: string | null;
}

export default function AdvisorPersonalCard({ advisor, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <ComponentCard title="Personal Information">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Full Name
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.name ? `${advisor.name}` : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Email Address
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.email ? `${advisor.email}` : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Mobile
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.mobile ? `${advisor.mobile}` : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Age
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.age ? `${advisor.age} years` : "Not Provided"}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
