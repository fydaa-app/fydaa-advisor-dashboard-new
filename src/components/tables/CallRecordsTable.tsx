"use client";

import React, { useState, useEffect } from 'react';
import { smartfloService } from "@/services";
import Pagination from "./Pagination";

interface CallRecord {
  id?: string;
  date?: string;
  time?: string;
  end_stamp?: string;
  caller_id_num?: string;
  client_number?: string;
  status?: string;
  direction?: string;
  recording_url?: string;
  [key: string]: unknown;
}

interface CallRecordsTableProps {
  token: string | null;
  filter?: string;
  fromDate?: string;
  toDate?: string;
}

const CallRecordsTable: React.FC<CallRecordsTableProps> = ({ token, filter = 'all', fromDate, toDate }) => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;

  // Reset to page 1 when filter or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, fromDate, toDate]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!token) {
        setError('No authentication token available. Please generate a token first.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let callType: string | undefined;
        let direction: string | undefined;

        // Map filter to API parameters
        switch (filter) {
          case 'all':
            // No filters - fetch all calls
            break;
          case 'unanswered':
            callType = 'm'; // missed/unanswered
            direction = 'outbound';
            break;
          case 'connected':
            callType = 'c'; // connected
            direction = 'outbound';
            break;
          case 'incoming':
            callType = 'c'; // connected
            direction = 'inbound';
            break;
          case 'missed':
            callType = 'm'; // missed
            direction = 'inbound';
            break;
        }

        const data = await smartfloService.fetchCallRecords(token, currentPage, recordsPerPage, callType, direction, fromDate, toDate);
        setCallRecords(data.results || []);
        setTotalRecords(data.count || 0);
      } catch (err) {
        console.error('Error fetching call records:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch call records');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [token, currentPage, filter, fromDate, toDate]);

  const formatValue = (value: string | undefined) => {
    return value || "—";
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Authentication Token</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please generate a token to view call records.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading call records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Data</h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (callRecords.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Call Records</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No call records found for this account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                End Stamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                Caller ID Num
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">
                Recording
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {callRecords.map((record, index) => (
              <tr key={record.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {formatValue(record.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-400">
                  {formatValue(record.time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-400">
                  {formatValue(record.end_stamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-400">
                  {formatValue(
                    record.direction === 'outbound' 
                      ? record.client_number 
                      : record.caller_id_num
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.direction === 'inbound' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : record.direction === 'outbound'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {formatValue(record.direction)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'answered' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : record.status === 'missed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : record.status === 'busy'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {formatValue(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-400">
                  {record.recording_url ? (
                    <audio 
                      controls 
                      preload="none"
                      className="h-8 max-w-[200px]"
                      style={{ 
                        filter: 'brightness(0.9)',
                      }}
                    >
                      <source src={record.recording_url} type="audio/mpeg" />
                      <source src={record.recording_url} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600 text-xs">No recording</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CallRecordsTable;
