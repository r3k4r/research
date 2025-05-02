'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: 'Provider Analytics Report',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/provider/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        setAnalyticsData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error: {error}</p>
        <p>Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sales & Waste Analytics</h1>
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>
      
      <div className="text-gray-500 mb-6">
        <p>Period: {analyticsData?.timePeriod}</p>
        <p className="text-sm mt-1">This report helps you understand your sales patterns and reduce waste.</p>
      </div>
      
      <div ref={reportRef} className="print-container space-y-8">
        {/* Waste reduction highlights */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Waste Reduction Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Items Saved</p>
              <p className="text-2xl font-bold text-green-700">{analyticsData?.wasteReduction.totalItemsSaved}</p>
              <p className="text-xs text-gray-500">vs last month: {analyticsData?.wasteReduction.previousMonth.improvement}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Food Waste Prevented</p>
              <p className="text-2xl font-bold text-green-700">{analyticsData?.wasteReduction.totalWeightSaved}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">CO₂ Emissions Prevented</p>
              <p className="text-2xl font-bold text-green-700">{analyticsData?.wasteReduction.co2Prevented}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-gray-500 text-sm">Revenue Recovered</p>
              <p className="text-2xl font-bold text-green-700">{analyticsData?.wasteReduction.moneyRecovered}</p>
            </div>
          </div>
        </div>

        {/* Most sold items */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Selling Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.mostSoldItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.revenue.toFixed(2)} IQD </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unsold items */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Items with Low Sales</h2>
          <p className="text-sm text-gray-600 mb-4">These items might need promotion or menu adjustment to reduce waste.</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unsold Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Loss</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.unsoldItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.potential_loss.toFixed(2)} IQD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category performance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Unsold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.categoryPerformance.map((category, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.sold}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.unsold}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${category.salePercentage}%` }}></div>
                        </div>
                        <span className="ml-2">{category.salePercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Recommendations</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Consider reducing production of <strong>Seafood Platter</strong> which has the highest unsold rate.</li>
            <li>Your <strong>Salads</strong> category has excellent performance with 90% sale rate.</li>
            <li>Try bundling <strong>Kale Chips</strong> with popular items to reduce waste.</li>
            <li>Consider offering end-of-day promotions for <strong>Desserts</strong> categories with higher unsold rates.</li>
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Analytics;