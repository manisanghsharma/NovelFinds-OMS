import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaBook, FaShoppingCart, FaMoneyBillWave, FaSync } from 'react-icons/fa';
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
      icon: <FaBook className="text-blue-500 text-xl md:text-2xl" />,
      color: 'bg-blue-100'
    },
    {
      title: 'Sold Books',
      value: inventorySummary?.soldCount || 0,
      icon: <FaShoppingCart className="text-green-500 text-xl md:text-2xl" />,
      color: 'bg-green-100'
    },
    {
      title: 'Inventory Value',
      value: `₹${inventorySummary?.inventoryValue?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave className="text-yellow-500 text-xl md:text-2xl" />,
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
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={() => fetchAnalyticsData()}
          className="p-2 text-indigo-600 cursor-pointer hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors"
          aria-label="Refresh data"
        >
          <FaSync className={`text-lg ${loadingAnalytics ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {loadingAnalytics ? (
        <div className="flex justify-center py-8 md:py-10">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-700"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {statsCards.map((card, index) => (
              <div 
                key={index}
                className={`${card.color} p-4 md:p-6 rounded-lg shadow-sm flex items-center space-x-3 md:space-x-4`}
              >
                <div>{card.icon}</div>
                <div>
                  <p className="text-gray-600 text-xs md:text-sm">{card.title}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Monthly Sales Chart */}
            <div className="lg:col-span-2 bg-white p-3 md:p-6 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Monthly Sales & Profits</h2>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border rounded px-2 py-1.5 text-sm w-full sm:w-auto"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div className="h-56 md:h-64">
                <Bar 
                  data={monthlySalesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Genre Breakdown Chart */}
            <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Genre Breakdown</h2>
              <div className="h-56 md:h-64 flex justify-center items-center">
                {genreBreakdown?.length > 0 ? (
                  <Pie 
                    data={genreChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 10
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">No genre data available</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Top Customers */}
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Top Customers</h2>
            {customerBreakdown?.length > 0 ? (
              <>
                {/* Desktop view - Table */}
                <div className="hidden md:block overflow-x-auto">
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
                
                {/* Mobile view - Cards */}
                <div className="md:hidden space-y-3">
                  {customerBreakdown
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded shadow-sm">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="grid grid-cols-3 mt-2 text-xs">
                          <div>
                            <span className="text-gray-500 block">Orders</span>
                            <span className="font-medium">{customer.ordersCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Books</span>
                            <span className="font-medium">{customer.booksCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Total</span>
                            <span className="font-medium">₹{customer.totalSpent.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No customer data available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 