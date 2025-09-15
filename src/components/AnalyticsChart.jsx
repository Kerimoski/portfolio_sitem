/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useState, useEffect } from 'react';

const AnalyticsChart = ({ data, type, title, color = 'sky' }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const processedData = processChartData(data, type);
      setChartData(processedData);
    }
  }, [data, type]);

  const processChartData = (data, type) => {
    switch (type) {
      case 'daily-visitors':
        return (data || []).slice(-7).map((item, index) => ({
          label: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
          value: item.count,
          index
        }));
      
      case 'page-views':
        return Object.entries(data || {}).map(([page, views], index) => ({
          label: page === '/' ? 'Ana Sayfa' : page,
          value: views,
          index
        })).slice(0, 5);
      
      case 'device-distribution':
        const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
        return Object.entries(data || {}).map(([device, count], index) => ({
          label: device.charAt(0).toUpperCase() + device.slice(1),
          value: count,
          percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
          index
        }));
      
      case 'project-clicks':
        return Object.entries(data || {})
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([project, clicks], index) => ({
            label: project.length > 15 ? project.substring(0, 15) + '...' : project,
            value: clicks,
            index
          }));
      
      default:
        return [];
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Gerçek analitik verilerini yenile
    setTimeout(() => {
      const updatedData = window.getAnalyticsData ? window.getAnalyticsData() : {};
      const processedData = processChartData(
        type === 'daily-visitors' ? updatedData.visitors?.daily :
        type === 'page-views' ? updatedData.pageViews :
        type === 'device-distribution' ? updatedData.devices :
        type === 'project-clicks' ? updatedData.projectClicks : {},
        type
      );
      setChartData(processedData);
      setRefreshing(false);
    }, 500);
  };

  const getColorClasses = (color) => {
    const colors = {
      sky: { bg: 'bg-sky-500', bgLight: 'bg-sky-400', text: 'text-sky-400' },
      green: { bg: 'bg-green-500', bgLight: 'bg-green-400', text: 'text-green-400' },
      purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-400', text: 'text-purple-400' },
      orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-400', text: 'text-orange-400' },
      blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-400', text: 'text-blue-400' }
    };
    return colors[color] || colors.sky;
  };

  const colorClasses = getColorClasses(color);
  const maxValue = Math.max(...chartData.map(item => item.value), 1);

  if (chartData.length === 0) {
    return (
      <div className="analytics-chart">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-medium">{title}</h4>
          <button
            onClick={handleRefresh}
            className={`p-1 rounded hover:bg-zinc-700 transition-colors ${refreshing ? 'refresh-animation' : ''}`}
            disabled={refreshing}
          >
            <span className="material-symbols-rounded text-zinc-400 text-sm">refresh</span>
          </button>
        </div>
        <div className="flex items-center justify-center h-16">
          <span className="text-zinc-500 text-sm">Veri bulunamadı</span>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-chart">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-medium">{title}</h4>
        <div className="flex items-center gap-2">
          <div className="pulse-dot"></div>
          <span className="text-xs text-zinc-400">Canlı</span>
          <button
            onClick={handleRefresh}
            className={`p-1 rounded hover:bg-zinc-700 transition-colors ml-2 ${refreshing ? 'refresh-animation' : ''}`}
            disabled={refreshing}
          >
            <span className="material-symbols-rounded text-zinc-400 text-sm">refresh</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {type === 'daily-visitors' && (
          <div className="flex items-end justify-between h-16 gap-1">
            {chartData.map((item) => {
              const height = (item.value / maxValue) * 100;
              return (
                <div key={item.index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full ${colorClasses.bg} rounded-t transition-all duration-500 hover:${colorClasses.bgLight}`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${item.label}: ${item.value} ziyaretçi`}
                  ></div>
                  <span className="text-xs text-zinc-400 mt-1 rotate-45 origin-left">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {(type === 'page-views' || type === 'project-clicks') && (
          <div className="space-y-2">
            {chartData.map((item) => {
              const percentage = (item.value / maxValue) * 100;
              return (
                <div key={item.index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm text-white truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="progress-bar w-20">
                      <div 
                        className={`progress-fill ${colorClasses.bg}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${colorClasses.text} w-8 text-right`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {type === 'device-distribution' && (
          <div className="space-y-2">
            {chartData.map((item) => (
              <div key={item.index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-zinc-400 text-sm">
                    {item.label.toLowerCase() === 'mobile' ? 'smartphone' : 
                     item.label.toLowerCase() === 'tablet' ? 'tablet' : 'computer'}
                  </span>
                  <span className="text-sm text-white">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="progress-bar w-20">
                    <div 
                      className={`progress-fill ${colorClasses.bg}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-zinc-400 w-8 text-right">{item.percentage}%</span>
                  <span className={`text-sm font-medium ${colorClasses.text} w-6 text-right`}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart; 