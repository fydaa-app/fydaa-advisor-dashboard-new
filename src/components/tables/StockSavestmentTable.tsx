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

interface StockSavestmentTableProps {
  allStocks: ClientProfileData["portfolioDetails"][0]["stocks"];
  formatCurrency: (value: number) => string;
}

export default function StockSavestmentTable({
  allStocks,
  formatCurrency,
}: StockSavestmentTableProps) {
  return (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Stock Name
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
            Quantity
          </TableCell>
          <TableCell
            isHeader
            className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
          >
            Avg. Price
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
        {allStocks.slice().sort((a, b) => a.stockName.localeCompare(b.stockName)).map((stock, index) => (
          <TableRow key={`${stock.stockId}-${index}`}>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {stock.stockName}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {stock.ticker}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              <Badge color="info">{stock.capType}</Badge>
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {stock.balanceQty}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {formatCurrency(stock.averagePrice)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {formatCurrency(stock.currentValue)}
            </TableCell>
            <TableCell className="px-4 py-3 text-start text-theme-sm">
              <span
                className={
                  stock.totalProfit >= 0
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {formatCurrency(stock.totalProfit)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
