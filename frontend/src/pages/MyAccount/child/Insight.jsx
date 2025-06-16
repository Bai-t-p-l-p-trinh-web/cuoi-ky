import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import apiClient from "../../../utils/axiosConfig";
import { toast } from "react-toastify";

import "../scss/Insight.scss";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

function Insight() {
  const [viewData, setViewData] = useState({
    labels: [""],
    datasets: [
      {
        label: "Lượt xem",
        data: [0],
        borderColor: "#56DFCF",
        backgroundColor: "#0ABAB5",
        tension: 0,
        fill: true,
        pointBackgroundColor: "#ADEED9",
      },
    ],
  });

  const [contactData, setContactData] = useState({
    labels: [""],
    datasets: [
      {
        label: "Số lượng kết nối",
        data: [0],
        borderColor: "#A8F1FF",
        backgroundColor: "#4ED7F1",
        tension: 0,
        fill: true,
        pointBackgroundColor: "#6FE6FC",
      },
    ],
  });

  const options_views = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Số lượt xem" },
      },
      x: {
        title: { display: true, text: "Thời gian" },
      },
    },
  };

  const options_contacts = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Số lượng" },
      },
      x: {
        title: { display: true, text: "Thời gian" },
      },
    },
  };

  useEffect(() => {
    const getStatisticView = async () => {
      try {
        const responseViews = await apiClient.get("/statistic/views");

        const { date, views } = responseViews.data;

        setViewData({
          labels: date,
          datasets: [
            {
              label: "Lượt xem",
              data: views,
              borderColor: "#56DFCF",
              backgroundColor: "#0ABAB5",
              tension: 0,
              fill: true,
              pointBackgroundColor: "#ADEED9",
            },
          ],
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi lấy dữ liệu lượt xem"
        );
      }
    };

    const getStatisticContact = async () => {
      try {
        const responseViews = await apiClient.get("/statistic/contacts");

        const { date, contacts } = responseViews.data;

        setContactData({
          labels: date,
          datasets: [
            {
              label: "Số lượng kết nối",
              data: contacts,
              borderColor: "#A8F1FF",
              backgroundColor: "#4ED7F1",
              tension: 0,
              fill: true,
              pointBackgroundColor: "#6FE6FC",
            },
          ],
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi lấy dữ liệu tương tác!"
        );
      }
    };
    getStatisticView();
    getStatisticContact();
  }, []);

  return (
    <>
      <div className="insight">
        <div className="insight__header"></div>
        <div className="insight__views">
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>
              Biểu đồ lượt xem xe theo thời gian
            </h2>
            <Line data={viewData} options={options_views} />
          </div>
        </div>

        <div className="insight__contact">
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>
              Biểu đồ lượt tương tác theo thời gian
            </h2>
            <Line data={contactData} options={options_contacts} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Insight;
