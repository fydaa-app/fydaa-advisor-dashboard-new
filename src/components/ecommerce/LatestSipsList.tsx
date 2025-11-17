"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGlobalContext } from "@/context/GlobalState";
import { getLatestSips, LatestSipGroup } from "@/services";
import ComponentCard from "../common/ComponentCard";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'full success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'fully failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'partial failed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'partial success':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default function LatestSipsList() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedOption, customDates } = useGlobalContext();
  const [sips, setSips] = useState<LatestSipGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'full success', label: 'Full Success' },
    { value: 'partial success', label: 'Partial Success' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'partial failed', label: 'Partial Failed' },
    { value: 'fully failed', label: 'Fully Failed' },
  ];

  useEffect(() => {
    const fetchSips = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const response = await getLatestSips({
          advisorId: user.id,
          appType: 'fydaa',
          page: 1,
          timeframe: (selectedOption as "monthly" | "daily" | "weekly" | "till_date" | undefined) || "monthly",
          startDate: selectedOption === 'till_date' ? customDates.start : undefined,
          endDate: selectedOption === 'till_date' ? customDates.end : undefined,
          groupStatus: selectedStatus !== 'all' ? selectedStatus : undefined,
        });

        if (response?.success) {
          setSips(response.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching latest SIPs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSips();
  }, [user?.id, selectedOption, customDates, selectedStatus]);

  const handleTitleClick = () => {
    router.push('/sips');
  };

  // Handle change for Select expecting string value
  const handleStatusChange = (option: { value: string } | null) => {
    if (option && typeof option.value === 'string') {
      setSelectedStatus(option.value);
    } else {
      setSelectedStatus('all');
    }
  };

  // Custom title node with inline dropdown (not changing ComponentCard)
  const TitleWithDropdown = (
    <div className="flex items-center justify-between select-none pt-[1.25rem] pb-[0.625rem] px-6">
      <span
        className="text-base font-medium text-gray-800 dark:text-white/90 cursor-pointer"
        onClick={handleTitleClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleTitleClick();
          }
        }}
        aria-label="Latest SIPs"
      >
        Latest SIPs
      </span>
      <div className="relative w-48">
        <Select
          options={statusOptions}
          placeholder="Select Status"
          value={selectedStatus}
          onChange={handleStatusChange}
          className="dark:bg-dark-900"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );

  return (
    <ComponentCard title={TitleWithDropdown} className="h-full" desc="">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : sips.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No SIPs found</p>
        </div>
      ) : (
        <div className="overflow-hidden p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-900 dark:text-gray-400">Client Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-900 dark:text-gray-400">SIP Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-900 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {sips.map((sip, index) => (
                  <tr
                    key={`${sip.sipId}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {sip.userFullName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {sip.sipName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sip.groupStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
