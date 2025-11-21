"use client";
import React from "react";
import { ClientProfileData } from "@/services";
import Badge from "../ui/badge/Badge";

interface ProfileTabProps {
  clientData: ClientProfileData;
}

export default function ProfileTab({ clientData }: ProfileTabProps) {
  const userDetails = clientData.userDetails;
  const advisor = clientData.advisor;
  const relationshipManager = clientData.relationshipManager;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="p-4 space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">
              Date of Birth
            </p>
            <p className="text-theme-sm text-gray-500">
              {new Date(userDetails.dob).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">Gender</p>
            <p className="text-theme-sm text-gray-500">{userDetails.gender}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-900 dark:text-gray-400">Address</p>
            <p className="text-theme-sm text-gray-500">
              {userDetails.address?.addressLine1}
            </p>
            {userDetails.address?.addressLine2 && (
              <p className="text-theme-sm text-gray-500">
                {userDetails.address.addressLine2}
              </p>
            )}
            <p className="text-theme-sm text-gray-500">
              {userDetails.city}, {userDetails.state} - {userDetails.pincode}
            </p>
            <p className="text-theme-sm text-gray-500">{userDetails.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">
              KYC Status
            </p>
            <Badge
              color={
                userDetails.panStatus === "KYC_SUCCESS" ? "success" : "error"
              }
            >
              {userDetails.panStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Goal Information */}
      {userDetails.userGoal && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Investment Goals
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SIP Amount
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(userDetails.userGoal.sipAmount)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Goal Amount
              </p>
              <p className="font-medium dark:text-gray-400">
                {formatCurrency(userDetails.userGoal.goalAmount)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Time Period
              </p>
              <p className="font-medium dark:text-gray-400">
                {userDetails.userGoal.timePeriod} years
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expected Interest Rate
              </p>
              <p className="font-medium dark:text-gray-400">
                {userDetails.userGoal.interestRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advisor Details */}
      {advisor && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Advisor Details
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-4 mb-4">
              {advisor.photo ? (
                <img
                  src={advisor.photo}
                  alt={advisor.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    {advisor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {advisor.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {advisor.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  Email
                </p>
                <a
                  href={`mailto:${advisor.email}`}
                  className="text-theme-sm text-blue-600 hover:underline"
                >
                  {advisor.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  Mobile
                </p>
                <a
                  href={`tel:${advisor.mobile}`}
                  className="text-theme-sm text-blue-600 hover:underline"
                >
                  {advisor.mobile}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Age</p>
                <p className="text-theme-sm text-gray-500">
                  {advisor.age} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  Experience
                </p>
                <p className="text-theme-sm text-gray-500">
                  {advisor.experienceInYears} years
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relationship Manager Details */}
      {relationshipManager && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Relationship Manager
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-4 mb-4">
              {relationshipManager.photo ? (
                <img
                  src={relationshipManager.photo}
                  alt={relationshipManager.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    {relationshipManager.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {relationshipManager.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {relationshipManager.description}
                </p>
                <div className="mt-2">
                  <Badge color="info">{relationshipManager.type}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  Email
                </p>
                <a
                  href={`mailto:${relationshipManager.email}`}
                  className="text-theme-sm text-blue-600 hover:underline"
                >
                  {relationshipManager.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  Mobile
                </p>
                <a
                  href={`tel:${relationshipManager.mobileNumber}`}
                  className="text-theme-sm text-blue-600 hover:underline"
                >
                  {relationshipManager.mobileNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
