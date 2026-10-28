"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PhoneIcon, CalenderIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { clientService, advisorService, smartfloService } from "@/services";
import { useSmartfloToken } from "@/context/SmartfloTokenContext";

export interface CrmClient {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobileNumber: string;
  followUpDate?: string | null;
  notes?: { note: string } | null;
}

interface ClientCrmActionsProps {
  client: CrmClient;
  onFollowUpSaved?: (clientId: number, dateTime: string) => void;
  onNotesSaved?: (clientId: number, note: string) => void;
  onCallConnected?: (clientId: number) => void;
  className?: string;
}

export default function ClientCrmActions({
  client,
  onFollowUpSaved,
  onNotesSaved,
  onCallConnected,
  className = "",
}: ClientCrmActionsProps) {
  const { user } = useAuth();
  const { token: smartfloToken, isTokenValid, generateAndSetToken } = useSmartfloToken();

  // Local CRM fields so profile page can show saved values after edit without a refetch
  const [localFollowUpDate, setLocalFollowUpDate] = useState<string | null>(client.followUpDate ?? null);
  const [localNotes, setLocalNotes] = useState<{ note: string } | null>(client.notes ?? null);

  useEffect(() => {
    setLocalFollowUpDate(client.followUpDate ?? null);
    setLocalNotes(client.notes ?? null);
  }, [client.id, client.followUpDate, client.notes]);

  // Calendar modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedFollowUpDate, setSelectedFollowUpDate] = useState<string>("");
  const [selectedFollowUpTime, setSelectedFollowUpTime] = useState<string>("10:00");
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Call modal states
  const [showCallModal, setShowCallModal] = useState(false);
  const [callModalStep, setCallModalStep] = useState<"auth" | "call" | "success">("auth");
  const [callEmail, setCallEmail] = useState("");
  const [callPassword, setCallPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [advisorAgentId, setAdvisorAgentId] = useState<string | null>(null);
  const [advisorSmartfloId, setAdvisorSmartfloId] = useState<string | null>(null);
  const [callSuccessMessage, setCallSuccessMessage] = useState("");
  const [callRefId, setCallRefId] = useState("");
  const [isUpdatingCallStatus, setIsUpdatingCallStatus] = useState(false);
  const [showConnectionQuestion, setShowConnectionQuestion] = useState(false);
  const [advisorDataLoaded, setAdvisorDataLoaded] = useState(false);

  // Notes modal states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const ensureAdvisorData = async () => {
    if (advisorDataLoaded || !user?.id) return;

    try {
      const advisorData = await advisorService.fetchAdvisor(user.id);

      if (advisorData?.agentId) {
        setAdvisorAgentId(advisorData.agentId);
      }
      if (advisorData?.smartfloId) {
        setAdvisorSmartfloId(advisorData.smartfloId);
      }
      if (advisorData?.email) {
        setCallEmail(advisorData.email.split("@")[0]);
      }
      setAdvisorDataLoaded(true);
    } catch (error) {
      console.error("Error fetching advisor data:", error);
    }
  };

  // Calendar modal handlers
  const handleOpenCalendar = () => {
    if (localFollowUpDate) {
      const date = new Date(localFollowUpDate);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().slice(0, 5);
      setSelectedFollowUpDate(dateStr);
      setSelectedFollowUpTime(timeStr);
      setCalendarMonth(date.getMonth());
      setCalendarYear(date.getFullYear());
    } else {
      setSelectedFollowUpDate("");
      setSelectedFollowUpTime("10:00");
      const now = new Date();
      setCalendarMonth(now.getMonth());
      setCalendarYear(now.getFullYear());
    }
    setShowCalendarPicker(false);
    setShowCalendarModal(true);
  };

  const handleCloseCalendar = () => {
    setShowCalendarModal(false);
    setShowCalendarPicker(false);
    setSelectedFollowUpDate("");
    setSelectedFollowUpTime("10:00");
  };

  const handleSaveFollowUpDate = async () => {
    if (!selectedFollowUpDate) return;

    try {
      const dateTimeString = `${selectedFollowUpDate}T${selectedFollowUpTime}:00`;
      await clientService.updateClientFollowUpDate(client.id, dateTimeString);
      setLocalFollowUpDate(dateTimeString);
      onFollowUpSaved?.(client.id, dateTimeString);
      handleCloseCalendar();
    } catch (error) {
      console.error("Error saving follow-up date:", error);
      alert(`Failed to save follow-up date: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFollowUpTime(e.target.value);
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedFollowUpDate(dateStr);
    setShowCalendarPicker(false);
  };

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: ({ day: number; date: string } | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({ day, date: dateStr });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Call modal handlers
  const handleOpenCallModal = async () => {
    await ensureAdvisorData();
    if (smartfloToken && isTokenValid) {
      setCallModalStep("call");
    } else {
      setCallModalStep("auth");
    }
    setCallPassword("");
    setAuthError("");
    setShowCallModal(true);
  };

  const handleCloseCallModal = () => {
    setShowCallModal(false);
    setCallModalStep("auth");
    setCallPassword("");
    setAuthError("");
    setCallSuccessMessage("");
    setCallRefId("");
    setShowConnectionQuestion(false);
    setIsAuthenticating(false);
    setIsCalling(false);
    setIsUpdatingCallStatus(false);
  };

  const handleOpenNotesModal = () => {
    setNoteInput(localNotes?.note || "");
    setShowNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
    setNoteInput("");
  };

  const handleSaveNotes = async () => {
    if (!noteInput.trim()) return;

    setIsSavingNotes(true);
    try {
      const trimmed = noteInput.trim();
      await clientService.updateClientNotes(client.id, trimmed);
      setLocalNotes({ note: trimmed });
      onNotesSaved?.(client.id, trimmed);
      handleCloseNotesModal();
    } catch (error) {
      console.error("Error saving notes:", error);
      alert(`Failed to save notes: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCallConnected = async (wasConnected: boolean) => {
    if (wasConnected) {
      setIsUpdatingCallStatus(true);
      try {
        const currentDateTime = new Date().toISOString();
        await clientService.updateClientPreviousCallDate(client.id, currentDateTime);
        onCallConnected?.(client.id);
      } catch (error) {
        console.error("Error updating call status:", error);
      } finally {
        setIsUpdatingCallStatus(false);
      }
    }

    handleCloseCallModal();
  };

  const handleAuthenticateCall = async () => {
    if (!callEmail || !callPassword) {
      setAuthError("Please enter both email and password");
      return;
    }

    setIsAuthenticating(true);
    setAuthError("");

    try {
      await generateAndSetToken(callEmail, callPassword);
      setCallModalStep("call");
      setIsAuthenticating(false);
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError("Failed to authenticate. Please check your credentials.");
      setIsAuthenticating(false);
    }
  };

  const handleMakeCall = async (useSmartfloId: boolean = false) => {
    if (!smartfloToken) return;

    const idToUse = useSmartfloId ? advisorSmartfloId : advisorAgentId;
    const idType = useSmartfloId ? "Smartflo ID" : "Agent ID";

    if (!idToUse) {
      alert(`${idType} not configured for this advisor. Please contact administrator.`);
      return;
    }

    setIsCalling(true);

    try {
      const numbers = await smartfloService.fetchNumbers(smartfloToken);

      if (!numbers || numbers.length === 0) {
        throw new Error("No caller ID available. Please check Smartflo configuration.");
      }

      const callerId = numbers[0].alias;

      const result = await smartfloService.initiateCall(
        smartfloToken,
        idToUse,
        client.mobileNumber,
        callerId
      );

      if (result.success) {
        const message = result.data?.message || "Call initiated successfully";
        const refId = result.data?.ref_id || "";
        setCallSuccessMessage(message);
        setCallRefId(refId);
        setCallModalStep("success");
        setShowConnectionQuestion(false);

        setTimeout(() => {
          setShowConnectionQuestion(true);
        }, 10000);
      } else {
        throw new Error(result.message || "Failed to initiate call");
      }

      setIsCalling(false);
    } catch (error) {
      console.error("Call error:", error);
      alert(`Failed to make call: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsCalling(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-4 ${className}`}>
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
          title="Make a call"
          onClick={handleOpenCallModal}
        >
          <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
          title="Schedule follow-up call"
          onClick={handleOpenCalendar}
        >
          <CalenderIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors rounded-full"
          title="Add notes"
          onClick={handleOpenNotesModal}
        >
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Schedule Call
              </h2>
              <button
                onClick={handleCloseCalendar}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Client</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {`${client.firstName || ""} ${client.lastName || ""}`.trim()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {client.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date
                </label>
                <div className="relative calendar-container">
                  <button
                    type="button"
                    onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 hover:text-blue-600 transition-colors"
                  >
                    <CalenderIcon className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                  </button>
                  <input
                    type="text"
                    value={selectedFollowUpDate ? new Date(selectedFollowUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select a date"}
                    readOnly
                    onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer"
                    placeholder="Select a date"
                  />

                  {showCalendarPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 z-50 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={goToPreviousMonth}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-900 dark:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {new Date(calendarYear, calendarMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </div>
                        <button
                          type="button"
                          onClick={goToNextMonth}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-900 dark:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {getCalendarDays(calendarYear, calendarMonth).map((dayObj, index) => {
                          if (!dayObj) {
                            return <div key={`empty-${index}`} className="p-2"></div>;
                          }

                          const isSelected = dayObj.date === selectedFollowUpDate;
                          const todayStr = new Date().toISOString().split("T")[0];
                          const isToday = dayObj.date === todayStr;
                          const isPast = dayObj.date < todayStr;

                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleDateSelect(calendarYear, calendarMonth, dayObj.day)}
                              disabled={isPast}
                              className={`p-2 text-sm rounded-lg transition-colors ${
                                isSelected
                                  ? "bg-blue-600 text-white font-semibold"
                                  : isToday
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-semibold"
                                  : isPast
                                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              }`}
                            >
                              {dayObj.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Time
                </label>
                <input
                  type="time"
                  value={selectedFollowUpTime}
                  onChange={handleTimeChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseCalendar}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFollowUpDate}
                disabled={!selectedFollowUpDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Call Modal */}
      {showCallModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {callModalStep === "auth" ? "Authenticate to Call" : callModalStep === "call" ? "Make Call" : "Call Status"}
              </h2>
              {callModalStep !== "success" && (
                <button
                  onClick={handleCloseCallModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calling</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {`${client.firstName || ""} ${client.lastName || ""}`.trim()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {client.mobileNumber}
              </p>
            </div>

            {callModalStep === "auth" ? (
              <>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Login ID (from your profile)
                  </p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {callEmail || "Loading..."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={callPassword}
                      onChange={(e) => setCallPassword(e.target.value)}
                      placeholder="Enter Smartflo password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={isAuthenticating}
                      onKeyPress={(e) => e.key === "Enter" && handleAuthenticateCall()}
                    />
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCloseCallModal}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    disabled={isAuthenticating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAuthenticateCall}
                    disabled={isAuthenticating || !callEmail || !callPassword}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isAuthenticating ? "Authenticating..." : "Next"}
                  </button>
                </div>
              </>
            ) : callModalStep === "call" ? (
              <>
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                    <PhoneIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ready to make call
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseCallModal}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                      disabled={isCalling}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMakeCall(false)}
                      disabled={isCalling || !advisorAgentId}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      title={!advisorAgentId ? "Agent ID not configured" : "Call with Agent ID"}
                    >
                      <PhoneIcon className="w-5 h-5" />
                      {isCalling ? "Calling..." : "Call Now"}
                    </button>
                  </div>

                  <button
                    onClick={() => handleMakeCall(true)}
                    disabled={isCalling || !advisorSmartfloId}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    title={!advisorSmartfloId ? "Smartflo ID not configured" : "Call with Smartflo ID"}
                  >
                    <PhoneIcon className="w-5 h-5" />
                    {isCalling ? "Calling..." : "Call with Smartflo"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {callSuccessMessage}
                  </h3>
                  {callRefId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Reference ID: <span className="font-mono">{callRefId}</span>
                    </p>
                  )}

                  {!showConnectionQuestion ? (
                    <div className="my-8 p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Waiting for call to connect...
                      </p>
                    </div>
                  ) : (
                    <div className="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Was the call successfully connected?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        If yes, we&apos;ll update the &quot;Previous Call&quot; date to now.
                      </p>

                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleCallConnected(false)}
                          disabled={isUpdatingCallStatus}
                          className="px-8 py-3 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleCallConnected(true)}
                          disabled={isUpdatingCallStatus}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          {isUpdatingCallStatus ? "Updating..." : "Yes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Notes Modal */}
      {showNotesModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notes
              </h2>
              <button
                onClick={handleCloseNotesModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Client</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {`${client.firstName || ""} ${client.lastName || ""}`.trim()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {client.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Enter notes about this client..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseNotesModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes || !noteInput.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSavingNotes ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
