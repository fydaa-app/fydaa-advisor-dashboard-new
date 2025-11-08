"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { ClientProfileData } from "@/services";

interface Props {
  client: ClientProfileData | null;
  error: string | null;
}

export default function ClientAddressCard({ client, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const user = client?.userDetails;

  return (
    <ComponentCard title="Address Information">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Address
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.address?.addressLine1 || "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            City
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.city || "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            State
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.state || "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Country
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.country || "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Pincode
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.pincode || "Not Provided"}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
