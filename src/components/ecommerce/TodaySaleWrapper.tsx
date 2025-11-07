"use client";
import React, { useState, useEffect } from "react";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { getCardsData, type TodaySalesData } from "@/services";

const TodaySaleWrapper = () => {
  const [salesData, setSalesData] = useState<TodaySalesData>({
    totalRevenue: 0,
    totalNoOfTransactions: 0,
    noOfPayments: 0,
    activeUsers: 0,
    newUsers: 0,
    totalUsers: 0,
    assetsUnderManagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee } = useGlobalContext();

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      const data = await getCardsData({
        selectedOption,
        customDates,
        selectedEmployee,
      });

      if (data) {
        setSalesData(data);
      }
      setLoading(false);
    };

    fetchSalesData();
  }, [selectedOption, customDates, selectedEmployee]);

  return <TodaySale data={salesData} loading={loading} />;
};

export default TodaySaleWrapper;
