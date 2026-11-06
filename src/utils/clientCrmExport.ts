/**
 * CSV and XLSX Export Utility for Advisor CRM clients
 */

import * as XLSX from '@e965/xlsx';

export interface ExportableClient {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobileNumber: string;
  networth: number;
  onboardingDate: string;
  followUpDate: string | null;
  previousCallDate: string | null;
  managerName?: string | null;
  notes?: { note: string } | null;
}

/**
 * Format date with time for export
 */
export const formatDateTimeForCSV = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

/**
 * Format date only (without time) for export
 */
export const formatDateOnlyForCSV = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Format currency for CSV export
 */
const formatCurrencyForCSV = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
};

/**
 * Format currency for XLSX (as number)
 */
const formatCurrencyForXLSX = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || isNaN(Number(value))) return 0;
  return Number(value);
};

const getClientName = (client: ExportableClient): string => {
  const name = `${client.firstName || ''} ${client.lastName || ''}`.trim();
  return name || '';
};

const getNotesText = (client: ExportableClient): string => {
  return client.notes?.note || '';
};

/**
 * Escape CSV field value
 */
const escapeCSVField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Convert clients data to CSV format
 */
export const convertClientsToCSV = (clients: ExportableClient[]): string => {
  const headers = [
    'Onboarding Date',
    'Name',
    'Manager Name',
    'Email',
    'Mobile Number',
    'Networth',
    'Next Follow Up',
    'Previous Call',
    'Notes',
  ];

  const rows = clients.map((client) => [
    escapeCSVField(formatDateTimeForCSV(client.onboardingDate)),
    escapeCSVField(getClientName(client)),
    escapeCSVField(client.managerName || ''),
    escapeCSVField(client.email || ''),
    escapeCSVField(client.mobileNumber),
    escapeCSVField(formatCurrencyForCSV(client.networth)),
    escapeCSVField(formatDateOnlyForCSV(client.followUpDate)),
    escapeCSVField(formatDateOnlyForCSV(client.previousCallDate)),
    escapeCSVField(getNotesText(client)),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string = 'clients-export.csv'): void => {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export clients to CSV and trigger download
 */
export const exportClientsToCSV = (clients: ExportableClient[], filename?: string): void => {
  const csvContent = convertClientsToCSV(clients);
  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultFilename = `advisor-crm-clients-${timestamp}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
};

/**
 * Export clients to XLSX and trigger download
 */
export const exportClientsToXLSX = (clients: ExportableClient[], filename?: string): void => {
  const data = clients.map((client) => ({
    'Onboarding Date': formatDateTimeForCSV(client.onboardingDate),
    Name: getClientName(client),
    'Manager Name': client.managerName || '',
    Email: client.email || '',
    'Mobile Number': client.mobileNumber || '',
    Networth: formatCurrencyForXLSX(client.networth),
    'Next Follow Up': formatDateOnlyForCSV(client.followUpDate),
    'Previous Call': formatDateOnlyForCSV(client.previousCallDate),
    Notes: getNotesText(client),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 20 }, // Onboarding Date
    { wch: 20 }, // Name
    { wch: 20 }, // Manager Name
    { wch: 25 }, // Email
    { wch: 15 }, // Mobile Number
    { wch: 18 }, // Networth
    { wch: 15 }, // Next Follow Up
    { wch: 15 }, // Previous Call
    { wch: 30 }, // Notes
  ];

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E0E0E0' } },
    };
  }

  const currencyFormat = '₹#,##0.00';
  for (let row = 1; row <= range.e.r; row++) {
    // Networth (column F - index 5)
    const networthCell = XLSX.utils.encode_cell({ r: row, c: 5 });
    if (worksheet[networthCell]) {
      worksheet[networthCell].z = currencyFormat;
      worksheet[networthCell].t = 'n';
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Advisor CRM Clients');

  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultFilename = `advisor-crm-clients-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, filename || defaultFilename);
};
