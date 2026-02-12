
import React, { useState } from 'react';
import { RefreshCcw, Download, Search } from 'lucide-react';

const OrdersTable = ({ status, data, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = data.filter(order => {
    const matchesStatus = status === 'orders' ? true : order.status.toLowerCase() === status;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.customer.toLowerCase().includes(searchLower) ||
      order.payment.toLowerCase().includes(searchLower) ||
      order.items.some(item => item.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = "Order ID,Date,Customer,Menu Items,Payment,Amount,Status\n";
    const rows = filteredOrders.map(o => 
      `${o.id},${o.date},${o.customer},"${o.items.join('; ')}",${o.payment},${o.amount},${o.status}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${status}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {status === 'orders' ? 'All Orders' : `${status} Orders`}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={onRefresh}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu Items</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.items.join(', ')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.payment}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTable;
