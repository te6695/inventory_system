import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productService, categoryService, transactionService } from '../../services/endpoints';
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('products');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Helper to normalize data from different response formats
  const getNormalizedData = (data) => {
    if (!data) return [];
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }
    
    if (data.categories && Array.isArray(data.categories)) {
      return data.categories;
    }
    
    if (data.transactions && Array.isArray(data.transactions)) {
      return data.transactions;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, categoriesRes, transactionsRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        transactionService.getAll({})
      ]);
      
      setProducts(getNormalizedData(productsRes));
      setCategories(getNormalizedData(categoriesRes));
      setTransactions(getNormalizedData(transactionsRes));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    setLoading(true);
    
    let data = [];
    let fileName = '';
    
    const normalizedProducts = getNormalizedData(products);
    const normalizedCategories = getNormalizedData(categories);
    const normalizedTransactions = getNormalizedData(transactions);
    
    switch(reportType) {
      case 'products':
        data = normalizedProducts.map(p => ({
          ID: p.id,
          SKU: p.sku,
          Name: p.name,
          Category: p.category?.name || 'N/A',
          'Purchase Price': `$${p.purchase_price || 0}`,
          'Selling Price': `$${p.selling_price || 0}`,
          Quantity: p.stock?.quantity || 0,
          'Available Stock': p.stock?.available_quantity || 0,
          'Reorder Level': p.reorder_level || 5,
          Status: (p.stock?.quantity || 0) <= (p.reorder_level || 5) ? 'Low Stock' : 'In Stock',
          'Created At': new Date(p.created_at).toLocaleDateString()
        }));
        fileName = 'products_report';
        break;
        
      case 'categories':
        data = normalizedCategories.map(c => ({
          ID: c.id,
          Name: c.name,
          Description: c.description || '',
          'Product Count': normalizedProducts.filter(p => p.category_id === c.id).length
        }));
        fileName = 'categories_report';
        break;
        
      case 'transactions':
        data = normalizedTransactions.map(t => ({
          ID: t.id,
          Date: new Date(t.created_at).toLocaleDateString(),
          Time: new Date(t.created_at).toLocaleTimeString(),
          Product: t.product?.name || 'N/A',
          SKU: t.product?.sku || 'N/A',
          Type: t.type === 'purchase' ? 'Purchase' : 
                t.type === 'sale' ? 'Sale' : 
                t.type || 'N/A',
          Quantity: t.quantity,
          'Unit Price': `$${t.unit_price || 0}`,
          'Total Amount': `$${t.total_amount || 0}`,
          User: t.user?.name || 'N/A',
          Notes: t.notes || ''
        }));
        fileName = 'transactions_report';
        break;
        
      case 'inventory':
        data = normalizedProducts.map(p => ({
          ID: p.id,
          SKU: p.sku,
          Name: p.name,
          Category: p.category?.name || 'N/A',
          'Current Stock': p.stock?.quantity || 0,
          'Available Stock': p.stock?.available_quantity || 0,
          'Reorder Level': p.reorder_level || 5,
          'Stock Status': (p.stock?.quantity || 0) <= (p.reorder_level || 5) ? 'Low - Needs Reorder' : 'Adequate',
          'Total Value': `$${((p.purchase_price || 0) * (p.stock?.quantity || 0)).toFixed(2)}`
        }));
        fileName = 'inventory_summary';
        break;
    }
    
    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    
    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${dateStr}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, fullFileName);
    setLoading(false);
  };

  const exportToCSV = () => {
    setLoading(true);
    
    let data = [];
    let fileName = '';
    
    const normalizedProducts = getNormalizedData(products);
    const normalizedCategories = getNormalizedData(categories);
    const normalizedTransactions = getNormalizedData(transactions);
    
    switch(reportType) {
      case 'products':
        data = normalizedProducts;
        fileName = 'products';
        break;
      case 'categories':
        data = normalizedCategories;
        fileName = 'categories';
        break;
      case 'transactions':
        data = normalizedTransactions;
        fileName = 'transactions';
        break;
    }
    
    // Convert to CSV
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setLoading(false);
  };

  const convertToCSV = (objArray) => {
    if (objArray.length === 0) return '';
    
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = Object.keys(array[0]).join(',') + '\r\n';
    
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') line += ',';
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    
    return str;
  };

  const exportToPDF = () => {
    setLoading(true);
    
    // Create PDF content
    let content = `
      <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      <hr>
    `;
    
    const normalizedProducts = getNormalizedData(products);
    
    switch(reportType) {
      case 'products':
        content += `
          <table border="1" style="width:100%; border-collapse:collapse;">
            <tr>
              <th>ID</th><th>Name</th><th>SKU</th><th>Category</th><th>Purchase Price</th><th>Selling Price</th><th>Stock</th>
            </tr>
            ${normalizedProducts.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.sku}</td>
                <td>${p.category?.name || 'N/A'}</td>
                <td>$${p.purchase_price || 0}</td>
                <td>$${p.selling_price || 0}</td>
                <td>${p.stock?.quantity || 0}</td>
              </tr>
            `).join('')}
          </table>
        `;
        break;
    }
    
    // Create PDF using browser print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportType} Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setLoading(false);
  };

  const generateSummary = () => {
    const normalizedProducts = getNormalizedData(products);
    const normalizedTransactions = getNormalizedData(transactions);
    
    switch(reportType) {
      case 'products':
        return {
          total: normalizedProducts.length,
          lowStock: normalizedProducts.filter(p => 
            (p.stock?.quantity || 0) <= (p.reorder_level || 5)
          ).length,
          totalValue: normalizedProducts.reduce((sum, p) => 
            sum + ((p.purchase_price || 0) * (p.stock?.quantity || 0)), 0
          )
        };
        
      case 'transactions':
        const filtered = normalizedTransactions.filter(t => {
          if (!startDate || !endDate) return true;
          const date = new Date(t.created_at);
          return date >= new Date(startDate) && date <= new Date(endDate);
        });
        
        return {
          total: filtered.length,
          stockIn: filtered.filter(t => t.type === 'purchase').reduce((sum, t) => sum + (t.quantity || 0), 0),
          stockOut: filtered.filter(t => t.type === 'sale').reduce((sum, t) => sum + (t.quantity || 0), 0),
          totalAmount: filtered.reduce((sum, t) => sum + (t.total_amount || 0), 0)
        };
        
      default:
        return {};
    }
  };

  const summary = generateSummary();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>
        <p className="text-gray-600">Generate and export system reports</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="products">Products Report</option>
              <option value="categories">Categories Report</option>
              <option value="transactions">Transactions Report</option>
              <option value="inventory">Inventory Summary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Report Summary</h2>
        
        {reportType === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800 font-medium">Total Products</div>
              <div className="text-2xl font-bold text-blue-900">{summary.total}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-800 font-medium">Low Stock Items</div>
              <div className="text-2xl font-bold text-red-900">{summary.lowStock}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-800 font-medium">Total Inventory Value</div>
              <div className="text-2xl font-bold text-green-900">${summary.totalValue?.toFixed(2)}</div>
            </div>
          </div>
        )}

        {reportType === 'transactions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800 font-medium">Total Transactions</div>
              <div className="text-2xl font-bold text-blue-900">{summary.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-800 font-medium">Total Stock In</div>
              <div className="text-2xl font-bold text-green-900">{summary.stockIn}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-800 font-medium">Total Stock Out</div>
              <div className="text-2xl font-bold text-red-900">{summary.stockOut}</div>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Export Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportToExcel}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <TableCellsIcon className="w-12 h-12 text-green-600 mb-3" />
            <div className="font-medium text-gray-900">Export to Excel</div>
            <div className="text-sm text-gray-500">.xlsx format</div>
          </button>

          <button
            onClick={exportToCSV}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <DocumentArrowDownIcon className="w-12 h-12 text-blue-600 mb-3" />
            <div className="font-medium text-gray-900">Export to CSV</div>
            <div className="text-sm text-gray-500">.csv format</div>
          </button>

          <button
            onClick={exportToPDF}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 border-2 border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <DocumentTextIcon className="w-12 h-12 text-red-600 mb-3" />
            <div className="font-medium text-gray-900">Export to PDF</div>
            <div className="text-sm text-gray-500">Printable format</div>
          </button>
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 inline-block"></div>
            <p className="mt-2 text-gray-600">Generating report...</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-xl font-bold">{getNormalizedData(products).length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Categories</div>
          <div className="text-xl font-bold">{getNormalizedData(categories).length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Transactions</div>
          <div className="text-xl font-bold">{getNormalizedData(transactions).length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Low Stock Items</div>
          <div className="text-xl font-bold text-red-600">
            {getNormalizedData(products).filter(p => 
              (p.stock?.quantity || 0) <= (p.reorder_level || 5)
            ).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;