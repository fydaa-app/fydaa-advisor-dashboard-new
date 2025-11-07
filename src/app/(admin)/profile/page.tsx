"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useAuth } from "@/context/AuthContext";


interface AdvisorData {
  id: number;
  name: string;
  email: string;
  mobile: string;
  experienceInYears: number;
}


export default function ProfilePage() {
  const { user } = useAuth();
  const [advisorData, setAdvisorData] = useState<AdvisorData | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('advisorData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setAdvisorData(parsed);
        } catch (error) {
          console.error('Error parsing advisor data:', error);
          if (user) {
            setAdvisorData({
              id: user.id,
              name: user.name,
              email: user.email,
              mobile: '',
              experienceInYears: 0
            });
          }
        }
      } else if (user) {
        setAdvisorData({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: '',
          experienceInYears: 0
        });
      }
    }
  }, [user]);


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


  if (!advisorData) {
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
      <ComponentCard title="Advisor Information">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Name
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {advisorData.name || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Email Address
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {advisorData.email || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Mobile
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {advisorData.mobile || "Not Provided"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Experience 
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {advisorData.experienceInYears || 0} years
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
