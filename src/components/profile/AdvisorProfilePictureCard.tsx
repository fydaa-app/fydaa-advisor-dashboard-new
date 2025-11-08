"use client";
import React from "react";
import { AdvisorData } from "@/services";

interface Props {
  advisor: AdvisorData | null;
  error: string | null;
}

export default function AdvisorProfilePictureCard({ advisor, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {advisor?.photo && (
            <img
              src={advisor.photo}
              alt={advisor.name}
              className="w-20 h-20 overflow-hidden rounded-full object-cover border border-gray-200 dark:border-gray-800"
            />
          )}

          <div>
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left uppercase">
              {advisor?.name ? `${advisor.name}` : "Not Provided"}
            </h4>

            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                Advisor ({advisor?.type ? `${advisor.type}` : "Not Provided"})
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {advisor?.experienceInYears ? `${advisor.experienceInYears} years experience` : "Experience not available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
