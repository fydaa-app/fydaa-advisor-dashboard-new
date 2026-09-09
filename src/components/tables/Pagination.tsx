"use client";
import React, { useState, useEffect } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showGoToPage?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showGoToPage = false,
}) => {
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 3;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  const visiblePages = getVisiblePages();
  const leftPages = visiblePages.filter((p) => p < currentPage);
  const rightPages = visiblePages.filter((p) => p > currentPage);
  const showLeftEllipsis = leftPages.length > 0 && leftPages[0] > 2;
  const showRightEllipsis = rightPages.length > 0 && rightPages[rightPages.length - 1] < totalPages - 1;

  const handleGo = () => {
    let page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setPageInput(String(page));
    onPageChange(page);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGo();
    }
  };

  const pageButtonClass = (page: number) =>
    `px-4 py-2 rounded ${
      currentPage === page
        ? "bg-brand-500 text-white"
        : "text-gray-700 dark:text-gray-400"
    } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`;

  if (showGoToPage && totalPages > 0) {
    return (
      <div className="flex items-center">
        <div className="flex-1 flex items-center justify-end gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
          >
            First
          </button>
          {leftPages.map((page) => (
            <button key={page} onClick={() => onPageChange(page)} className={pageButtonClass(page)}>
              {page}
            </button>
          ))}
          {showLeftEllipsis && <span className="px-2 text-gray-500">...</span>}
        </div>

        <div className="flex flex-col items-center mx-2">
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            min={1}
            max={totalPages}
            className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-center h-10 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          />
          <button
            onClick={handleGo}
            className="mt-1 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Go
          </button>
        </div>

        <div className="flex-1 flex items-center justify-start gap-2">
          {showRightEllipsis && <span className="px-2 text-gray-500">...</span>}
          {rightPages.map((page) => (
            <button key={page} onClick={() => onPageChange(page)} className={pageButtonClass(page)}>
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="ml-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Last
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
      >
        First
      </button>
      <div className="flex items-center gap-2">
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 dark:text-gray-400"
            } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
