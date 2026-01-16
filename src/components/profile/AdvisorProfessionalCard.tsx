"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { AdvisorData } from "@/services";

interface Props {
  advisor: AdvisorData | null;
  error: string | null;
}

export default function AdvisorProfessionalCard({ advisor, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  const hasAttachments = advisor?.attachment1 || advisor?.attachment2;

  return (
    <ComponentCard title="Professional Information">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Experience
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.experienceInYears
              ? `${advisor.experienceInYears} years`
              : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Advisor Type
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.type ? `${advisor.type}` : "Not Provided"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Agent ID
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.agentId ? `${advisor.agentId}` : "Not Provided"}
          </p>
        </div>

        <div className="lg:col-span-2">
          <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
            Description
          </p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">
            {advisor?.description ? `${advisor.description}` : "Not Provided"}
          </p>
        </div>

        {hasAttachments && (
          <div className="lg:col-span-2">
            <p className="mb-4 text-sm leading-normal text-gray-500 dark:text-gray-400">
              Documents
            </p>
            <div className="flex flex-wrap gap-3">
              {advisor?.attachment1 && (
                <a
                  href={advisor.attachment1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                >
                  <span className="text-blue-600 dark:text-blue-400">📄</span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Document 1
                  </span>
                </a>
              )}
              {advisor?.attachment2 && (
                <a
                  href={advisor.attachment2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition"
                >
                  <span className="text-green-600 dark:text-green-400">📄</span>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Document 2
                  </span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
