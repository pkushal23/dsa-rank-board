import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { auth } from './firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProgressGraph() {
  const [dataPoints, setDataPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('day'); // 'day', 'week', 'month'

  useEffect(() => {
    fetchData();
  }, [groupBy]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/score-history/${user.uid}?groupBy=${groupBy}`);
      setDataPoints(res.data || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
      
      if (err.response?.status === 404) {
        // New user - no history yet
        setDataPoints([]);
        setError('No progress data yet. Start solving problems to see your progress!');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load progress data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate colorful background colors for each bar
  const generateBarColors = (length) => {
    const colors = [
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(245, 158, 11, 0.8)',  // Orange
      'rgba(234, 179, 8, 0.8)',   // Yellow
      'rgba(34, 197, 94, 0.8)',   // Green
      'rgba(6, 182, 212, 0.8)',   // Cyan
      'rgba(59, 130, 246, 0.8)',  // Blue
      'rgba(147, 51, 234, 0.8)',  // Purple
      'rgba(236, 72, 153, 0.8)',  // Pink
    ];
    
    return Array.from({ length }, (_, i) => colors[i % colors.length]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (groupBy === 'week') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      }) + ' (Week)';
    } else if (groupBy === 'month') {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    }
  };

  const chartData = {
    labels: dataPoints.map(point => formatDate(point.snapshot_time)),
    datasets: [{
      label: 'Total Score',
      data: dataPoints.map(point => point.total_score),
      backgroundColor: generateBarColors(dataPoints.length),
      borderColor: generateBarColors(dataPoints.length).map(color => 
        color.replace('0.8', '1')
      ),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: generateBarColors(dataPoints.length).map(color => 
        color.replace('0.8', '0.9')
      ),
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 3,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
            weight: 'bold'
          },
          padding: window.innerWidth < 768 ? 15 : 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Performance Progress Over Time (${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}ly)`,
        color: '#ffffff',
        font: {
          size: window.innerWidth < 768 ? 14 : 18,
          weight: 'bold'
        },
        padding: {
          top: window.innerWidth < 768 ? 5 : 10,
          bottom: window.innerWidth < 768 ? 15 : 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: window.innerWidth < 768 ? 12 : 14
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 11 : 13
        },
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y.toLocaleString()}`;
          },
          afterLabel: function(context) {
            if (context.dataIndex > 0) {
              const prevScore = context.dataset.data[context.dataIndex - 1];
              const change = context.parsed.y - prevScore;
              if (change > 0) {
                return `↗ +${change.toLocaleString()} from previous`;
              } else if (change < 0) {
                return `↘ ${change.toLocaleString()} from previous`;
              }
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Total Score',
          color: '#ffffff',
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          maxRotation: window.innerWidth < 768 ? 45 : 45,
          minRotation: window.innerWidth < 768 ? 45 : 0
        },
        title: {
          display: true,
          text: 'Date',
          color: '#ffffff',
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
            weight: 'bold'
          }
        }
      }
    },
    categoryPercentage: dataPoints.length === 1 ? 0.3 : 0.8,
    barPercentage: dataPoints.length === 1 ? 0.5 : 0.8,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    hover: {
      animationDuration: 200
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 sm:p-6 rounded-xl mt-4 sm:mt-6 border border-gray-700 mx-2 sm:mx-0">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading progress data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 sm:p-6 rounded-xl mt-4 sm:mt-6 border border-gray-700 mx-2 sm:mx-0">
        <h4 className="text-white mb-4 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📈 Performance Progress
        </h4>
        
        {error && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-yellow-400">ℹ️</div>
              <p className="text-yellow-200 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-4">📊</div>
            <p className="text-base sm:text-lg">No performance data available yet</p>
            <p className="text-sm mt-2">Link your platforms and start solving problems to see your progress!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 sm:p-6 rounded-xl mt-4 sm:mt-6 border border-gray-700 shadow-2xl mx-2 sm:mx-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
        <h4 className="text-white text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📈 Performance Progress
        </h4>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Group By Selector */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 sm:py-1 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Total: {dataPoints.length} records</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Latest: {dataPoints[dataPoints.length - 1]?.total_score?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-64 sm:h-80 bg-gray-900/50 rounded-lg p-2 sm:p-4 backdrop-blur-sm">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Stats summary */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 p-3 sm:p-4 rounded-lg border border-green-500/30">
          <div className="text-green-400 text-xs sm:text-sm font-semibold">Highest Score</div>
          <div className="text-white text-xl sm:text-2xl font-bold">
            {dataPoints.length > 0 ? Math.max(...dataPoints.map(p => p.total_score)).toLocaleString() : '0'}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-3 sm:p-4 rounded-lg border border-blue-500/30">
          <div className="text-blue-400 text-xs sm:text-sm font-semibold">Average Score</div>
          <div className="text-white text-xl sm:text-2xl font-bold">
            {dataPoints.length > 0 ? 
              Math.round(dataPoints.reduce((sum, p) => sum + p.total_score, 0) / dataPoints.length).toLocaleString() : 
              '0'
            }
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-3 sm:p-4 rounded-lg border border-purple-500/30">
          <div className="text-purple-400 text-xs sm:text-sm font-semibold">Growth Rate</div>
          <div className="text-white text-xl sm:text-2xl font-bold">
            {dataPoints.length > 1 ? (
              ((dataPoints[dataPoints.length - 1].total_score - dataPoints[0].total_score) / dataPoints[0].total_score * 100).toFixed(1) + '%'
            ) : '0%'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressGraph;