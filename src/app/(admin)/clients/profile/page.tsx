"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClientPersonalCard from "@/components/client-profile/ClientPersonalCard";
import ClientAddressCard from "@/components/client-profile/ClientAddressCard";
import ClientFinancialCard from "@/components/client-profile/ClientFinancialCard";
import ClientGoalCard from "@/components/client-profile/ClientGoalCard";
import ClientPortfolioCard from "@/components/client-profile/ClientPortfolioCard";
import ClientManagerCard from "@/components/client-profile/ClientManagerCard";
import { useClientProfile } from "@/hooks/useClientProfile";

export default function ClientProfilePage() {
  const router = useRouter();
  const { clientData, loading, error } = useClientProfile();

  useEffect(() => {
    // Redirect to clients page if no client ID is found
    if (!loading && error === 'No client selected') {
      router.push('/clients');
    }
  }, [loading, error, router]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Client Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading client profile...</div>
        </div>
      </div>
    );
  }

  if (error && error !== 'No client selected') {
    return (
      <div>
        <PageBreadcrumb pageTitle="Client Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  const clientName = clientData?.userDetails 
    ? `${clientData.userDetails.firstName} ${clientData.userDetails.lastName}`
    : "Client Profile";

  return (
    <div>
      <PageBreadcrumb pageTitle={clientName} />
      <div className="space-y-6">
        <ClientPersonalCard client={clientData} error={error} />
        <ClientAddressCard client={clientData} error={error} />
        <ClientFinancialCard client={clientData} error={error} />
        <ClientGoalCard client={clientData} error={error} />
        <ClientPortfolioCard client={clientData} error={error} />
        <ClientManagerCard client={clientData} error={error} />
      </div>
    </div>
  );
}
