import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaBook, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { 
    inventorySummary, 
    monthlySalesData, 
    genreBreakdown, 
    customerBreakdown,
    loadingAnalytics,
    fetchAnalyticsData
  } = useAppContext();
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);
  
  // Stats cards data
  const statsCards = [
    {
      title: 'Available Books',
      value: inventorySummary?.availableCount || 0,
      icon: <FaBook className="text-blue-500" />,
      color: 'bg-blue-100'
    },
    {
      title: 'Sold Books',
      value: inventorySummary?.soldCount || 0,
      icon: <FaShoppingCart className="text-green-500" />,
      color: 'bg-green-100'
    },
    {
      title: 'Inventory Value',
      value: `₹${inventorySummary?.inventoryValue?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave className="text-yellow-500" />,
      color: 'bg-yellow-100'
    }
  ];
  
  // Monthly sales chart data
  const monthlySalesChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales',
        data: monthlySalesData?.monthlyData.map(data => data.sales) || Array(12).fill(0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Profits',
        data: monthlySalesData?.monthlyData.map(data => data.profits) || Array(12).fill(0),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  };
  
  // Genre breakdown chart data
  const genreChartData = {
    labels: genreBreakdown?.map(genre => genre.name) || [],
    datasets: [
      {
        data: genreBreakdown?.map(genre => genre.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={() => fetchAnalyticsData()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Refresh Data
        </button>
      </div>
      
      {loadingAnalytics ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsCards.map((card, index) => (
              <div 
                key={index}
                className={`${card.color} p-6 rounded-lg shadow-sm flex items-center space-x-4`}
              >
                <div className="text-2xl">{card.icon}</div>
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Sales Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Sales & Profits</h2>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div className="h-64">
                <Bar 
                  data={monthlySalesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Genre Breakdown Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Genre Breakdown</h2>
              <div className="h-64 flex justify-center items-center">
                {genreBreakdown?.length > 0 ? (
                  <Pie 
                    data={genreChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No genre data available</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Top Customers */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Customers</h2>
            {customerBreakdown?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerBreakdown
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 5)
                      .map((customer, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.ordersCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.booksCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{customer.totalSpent.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No customer data available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 