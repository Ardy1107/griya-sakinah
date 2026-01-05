/**
 * Export Utilities - PDF and Excel Generation
 * For Griya Sakinah Portal
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {string} title - Report title
 * @param {Array} columns - Column definitions [{header: '', key: ''}]
 * @param {string} filename - Output filename
 */
export const exportToPDF = (data, title, columns, filename = 'laporan') => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 22);

    // Subtitle with date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, 14, 30);

    // Table
    const tableData = data.map(row =>
        columns.map(col => row[col.key] || '-')
    );

    doc.autoTable({
        head: [columns.map(col => col.header)],
        body: tableData,
        startY: 38,
        styles: {
            fontSize: 9,
            cellPadding: 4,
        },
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
        margin: { top: 38 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Halaman ${i} dari ${pageCount} | Griya Sakinah`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`${filename}.pdf`);
    return true;
};

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} sheetName - Sheet name
 * @param {string} filename - Output filename
 */
export const exportToExcel = (data, sheetName = 'Data', filename = 'laporan') => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 18 }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Save file
    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${filename}.xlsx`);

    return true;
};

/**
 * Format currency for export (removes Rp formatting)
 * @param {number} amount - Amount to format
 */
export const formatCurrencyForExport = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
};

/**
 * Format date for export
 * @param {string|Date} date - Date to format
 */
export const formatDateForExport = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default {
    exportToPDF,
    exportToExcel,
    formatCurrencyForExport,
    formatDateForExport
};
