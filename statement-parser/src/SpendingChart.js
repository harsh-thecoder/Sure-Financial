// src/SpendingChart.js

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingChart = ({ transactions }) => {
  // Process transactions to calculate spending per category
  const spendingByCategory = transactions
    .filter(tx => tx.amount < 0) // Only include expenses
    .reduce((acc, tx) => {
      const category = tx.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});

  const data = {
    labels: Object.keys(spendingByCategory),
    datasets: [
      {
        label: 'Spending',
        data: Object.values(spendingByCategory),
        backgroundColor: [
          '#3498db',
          '#e74c3c',
          '#2ecc71',
          '#f1c40f',
          '#9b59b6',
          '#1abc9c',
          '#e67e22',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: "'Poppins', sans-serif",
          },
          boxWidth: 20,
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default SpendingChart;
