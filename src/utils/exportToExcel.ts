import * as XLSX from 'xlsx';
import { Sale, Product } from '../types';
import { formatCurrency } from './formatters';

export const exportSalesToExcel = (sales: Sale[]) => {
  const data = sales.map(sale => ({
    'Date': new Date(sale.createdAt).toLocaleDateString(),
    'Customer': sale.customerName || 'Anonymous',
    'Items': sale.items.length,
    'Subtotal': formatCurrency(sale.subtotal),
    'Tax': formatCurrency(sale.tax),
    'Total': formatCurrency(sale.total),
    'Payment Method': sale.paymentMethod,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
  XLSX.writeFile(wb, 'sales-report.xlsx');
};

export const exportInventoryToExcel = (products: Product[]) => {
  const data = products.map(product => ({
    'Name': product.name,
    'Category': product.category,
    'Price': formatCurrency(product.price),
    'Stock': product.stockQuantity,
    'Description': product.description,
    'Last Updated': new Date(product.updatedAt).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Report');
  XLSX.writeFile(wb, 'inventory-report.xlsx');
};