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
import { MutualFund } from "@/services";


interface StockFydaaTableProps {
  allMutualFunds: MutualFund[];
  formatCurrency: (value: number) => string;
}


export default function StockFydaaTable({
  allMutualFunds,
  formatCurrency,
}: StockFydaaTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              Fund Name
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              Ticker
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
              Units
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              Avg. NAV
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              Current NAV
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              Current Value
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              Profit/Loss
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {allMutualFunds.map((fund, index) => {
            return (
              <TableRow key={`${fund.stockId}-${index}`}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="min-w-[250px]">
                    <p className="font-medium text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                      {fund.stockName}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {fund.ticker}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge color="info">{fund.capType}</Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {fund.balanceQty.toFixed(3)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  ₹{fund.averagePrice.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  ₹{fund.ltp}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatCurrency(fund.currentValue)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-theme-sm">
                  <span
                    className={
                      fund.totalProfit >= 0
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {formatCurrency(fund.totalProfit)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
