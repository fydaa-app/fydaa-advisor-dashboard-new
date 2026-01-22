"use client";
import React, { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ClientTab from "@/components/client-profile/ClientTab";
import { useClientProfile } from "@/hooks/useClientProfile";

export default function ClientProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clientData, loading, error } = useClientProfile();

  const fromUrl = useMemo(() => {
    // Check sessionStorage first for previous page
    if (typeof window !== "undefined") {
      const previousPage = sessionStorage.getItem("previousPage");
      if (previousPage) {
        return previousPage;
      }
    }
    
    // Fallback to query param
    const from = searchParams.get("from");
    return from && from.startsWith("/") ? from : "/clients";
  }, [searchParams]);

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

  if (!clientData) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Client Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">No client data available</div>
        </div>
      </div>
    );
  }

  const clientName =
    clientData.userDetails
      ? [clientData.userDetails.firstName, clientData.userDetails.lastName].filter(Boolean).join(" ") ||
        "Client Profile"
      : "Client Profile";

  return (
    <div>
      <PageBreadcrumb pageTitle={clientName} />
      <div className="space-y-6">
        <div className="mb-4">
          <button 
            onClick={() => {
              // Clear the previousPage from sessionStorage after navigation
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("previousPage");
              }
              router.push(fromUrl);
            }}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to {fromUrl.startsWith("/advisor-crm") ? "Advisor CRM" : "Clients"}
          </button>
        </div>
        <ComponentCard title="Client Details">
          <ClientTab clientData={clientData} />
        </ComponentCard>
      </div>
    </div>
  );
}
