"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { ClientProfileData } from "@/services";

interface Props {
  client: ClientProfileData | null;
  error: string | null;
}

export default function ClientManagerCard({ client, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const manager = client?.relationshipManager;
  const advisor = client?.advisor;

  return (
    <ComponentCard title="Account Management">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Relationship Manager */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Relationship Manager
          </h4>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {manager?.name || "Not Assigned"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {manager?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                Mobile
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {manager?.mobileNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Advisor */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Advisor
          </h4>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {advisor?.name || "Not Assigned"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {advisor?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                Mobile
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {advisor?.mobile || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
