"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ClientProfileData } from "@/services";

interface TransactionTableProps {
  transactions: ClientProfileData["userTransactionDetails"];
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Transaction ID
          </TableCell>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Date
          </TableCell>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Type
          </TableCell>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Amount
          </TableCell>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Quantity
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {transactions.map((transaction) => (
          <TableRow key={transaction.transactionId}>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {transaction.transactionId}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              <Badge
                color={transaction.orderType === "BUY" ? "success" : "error"}
              >
                {transaction.orderType}
              </Badge>
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {formatCurrency(transaction.totalAmount)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {transaction.totalTradeQty}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
