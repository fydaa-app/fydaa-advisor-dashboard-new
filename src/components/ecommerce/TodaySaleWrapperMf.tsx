"use client";
import React, { useState, useEffect } from "react";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { getCardsDataMf, type TodaySalesData } from "@/services";

const TodaySaleWrapperMf = () => {
  const [salesData, setSalesData] = useState<TodaySalesData>({
    totalRevenue: 0,
    totalNoOfTransactions: 0,
    noOfPayments: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalUsers: 0,
    assetsUnderManagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee } = useGlobalContext();

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      const data = await getCardsDataMf({
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

export default TodaySaleWrapperMf;
