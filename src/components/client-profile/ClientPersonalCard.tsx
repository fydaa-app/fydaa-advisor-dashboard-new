"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { ClientProfileData } from "@/services";

interface Props {
  client: ClientProfileData | null;
  error: string | null;
}

export default function ClientPersonalCard({ client, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const user = client?.userDetails;

  return (
    <ComponentCard title="Personal Information">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Full Name
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user ? `${user.firstName} ${user.lastName}` : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Email Address
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.email || "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Mobile
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user ? `${user.callingCode} ${user.mobileNumber}` : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Date of Birth
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Gender
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.gender || "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            App Source
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {user?.fromApp || "Not Provided"}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
