"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdvisorPersonalCard from "@/components/profile/AdvisorPersonalCard";
import AdvisorProfessionalCard from "@/components/profile/AdvisorProfessionalCard";
import AdvisorStatsCard from "@/components/profile/AdvisorStatsCard";
import { useAuth } from "@/context/AuthContext";
import { useAdvisor } from "@/hooks/useAdvisor";
import AdvisorProfilePictureCard from "@/components/profile/AdvisorProfilePictureCard";

export default function ProfilePage() {
  const { user } = useAuth();
  const { advisorData, loading, error } = useAdvisor(user?.id || null);

  if (!user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Please log in to view your profile</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <div className="space-y-6">
        <AdvisorProfilePictureCard advisor={advisorData} error={error} />
        <AdvisorPersonalCard advisor={advisorData} error={error} />
        <AdvisorProfessionalCard advisor={advisorData} error={error} />
        <AdvisorStatsCard advisor={advisorData} error={error} />
      </div>
    </div>
  );
}
