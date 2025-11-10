"use client";
import React, { useState, useEffect } from "react";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { getAdvisorCardsData, type TodaySalesData } from "@/services";

const TodaySaleWrapper = () => {
  const [salesData, setSalesData] = useState<TodaySalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee } = useGlobalContext();

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const data = await getAdvisorCardsData({
          selectedOption,
          customDates,
          selectedEmployee,
          appType: "Savestment",
        });

        if (data) {
          setSalesData(data);
        } else {
          setSalesData(null);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setSalesData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedOption, customDates, selectedEmployee]);

  return <TodaySale data={salesData} loading={loading} appType="Savestment" />;
};

export default TodaySaleWrapper;
