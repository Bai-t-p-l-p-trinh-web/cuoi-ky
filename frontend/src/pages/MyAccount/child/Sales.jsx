import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { toast } from "react-toastify";
import "../scss/Sales.scss";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function Sales() {
  const [revenueData, setRevenueData] = useState({
    labels: [""],
    datasets: [
      {
        label: "Doanh thu (Triệu - VNĐ)",
        data: [0],
        backgroundColor: "#4CAF50",
        borderRadius: 4,
      },
    ],
  });

  const options_revenue = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Doanh thu (Triệu - VNĐ)" },
      },
      x: {
        title: { display: true, text: "Thời gian" },
      },
    },
  };

  const getStatisticRevenue = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/statistic/revenues`,
        { withCredentials: true }
      );

      const { date, revenues } = res.data;

      setRevenueData({
        labels: date,
        datasets: [
          {
            label: "Doanh thu (Triệu - VNĐ)",
            data: revenues,
            backgroundColor: "#4CAF50",
            borderRadius: 4,
          },
        ],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lấy dữ liệu doanh thu");
    }
  };

  useEffect(() => {
    getStatisticRevenue();
  }, []);

  return (
    <div className="sales">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Biểu đồ doanh thu theo thời gian</h2>
        <Bar data={revenueData} options={options_revenue} />
      </div>
    </div>
  );
}

export default Sales;
