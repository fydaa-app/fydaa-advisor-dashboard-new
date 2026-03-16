"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

export interface AdvisorClientRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  app?: string | null;
  networth: number;
  onboardingDate: string;
  hasSIP: boolean;
  managerName?: string | null;
}

interface Props {
  rows: AdvisorClientRow[];
  error: string | null;
}

// Simple Badge Component
const Badge = ({ variant, children }: { variant: 'success' | 'error'; children: React.ReactNode }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = variant === 'success' 
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  
  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {children}
    </span>
  );
};


export default function AdvisorClientsTable({ rows, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine if SIP column should be shown (any user with app 'fydaa')
  const showSIPColumn = rows.some((row) => row.app?.toLowerCase() === "fydaa");

  const handleViewClient = (clientId: number) => {
    // Build "from" URL that captures current clients list state (including pagination & search)
    const currentPath = pathname || "/clients";
    const currentQuery = searchParams.toString();
    const fromUrl = currentQuery ? `${currentPath}?${currentQuery}` : currentPath;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedClientId", clientId.toString());
      sessionStorage.setItem("clientsSkipNextPageReset", "true");
      // Save the full URL with page number to sessionStorage
      sessionStorage.setItem("previousPage", fromUrl);
    }

    const profileUrl = `/clients/profile?from=${encodeURIComponent(fromUrl)}`;
    router.push(profileUrl);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          {error && <div className="m-4"><p style={{ color: "red" }}>{error}</p></div>}
          {!error && rows.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Onboarding Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">First Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Last Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Manager Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Mobile Number</TableCell>

                  {/* Conditionally render SIP header cell */}
                  {showSIPColumn && (
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">SIP</TableCell>
                  )}

                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Networth</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {rows.map((r, i) => (
                  <TableRow key={`${r.id}-${i}`}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {formatDate(r.onboardingDate)}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{r.firstName || "—"}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.lastName || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.managerName || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.email || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{r.mobileNumber || "—"}</TableCell>

                    {/* Conditionally render SIP cell */}
                    {showSIPColumn && (
                      <TableCell className="px-4 py-3 text-start">
                        <Badge variant={r.hasSIP ? 'success' : 'error'}>
                          {r.hasSIP ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                    )}

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(r.networth)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <button
                        onClick={() => handleViewClient(r.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                        title="View Client Profile"
                      >
                        <svg 
                          className="w-5 h-5 text-gray-600 dark:text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                          />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && <div className="m-4"><p>No clients found.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
