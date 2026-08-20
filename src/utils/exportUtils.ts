import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { StopPoint, TripReport } from '../types';
import { formatDateTime, formatTimeOnly, formatDateOnly, formatCoord } from './geoUtils';

/**
 * Export stops data to Microsoft Excel (.xlsx) file
 */
export function exportStopsToExcel(
  stops: StopPoint[],
  companyName: string = 'PT. ESA JAYA MULIA SENTOSA',
  downloadedBy: string = 'Owner Management'
) {
  // 1. Prepare Main Sheet Data
  const sheetData = [
    [companyName],
    ['SISTEM GPS TRACKER & LAPORAN TITIK PERHENTIAN ARMADA (30 HARI)'],
    [`Tanggal Cetak: ${formatDateTime(new Date().toISOString())} | Diunduh Oleh: ${downloadedBy}`],
    [''], // Empty row
    [
      'No',
      'ID Perjalanan',
      'Nama Driver',
      'Plat Nomor',
      'Koordinat Berhenti (Lat, Lng)',
      'Waktu Tiba',
      'Waktu Berangkat',
      'Durasi Berhenti (Menit)',
      'Status Peringatan',
      'Catatan / Keterangan',
    ],
    ...stops.map((stop, index) => [
      index + 1,
      stop.tripId,
      stop.driverName,
      stop.vehiclePlate,
      formatCoord(stop.lat, stop.lng),
      formatDateTime(stop.arrivalTime),
      formatDateTime(stop.departureTime),
      stop.durationMinutes,
      stop.isOverLimit ? 'ALERT (>60 MENIT)' : 'NORMAL',
      stop.notes || '-',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // ID Perjalanan
    { wch: 18 }, // Driver
    { wch: 14 }, // Plat
    { wch: 26 }, // Koordinat
    { wch: 20 }, // Tiba
    { wch: 20 }, // Berangkat
    { wch: 22 }, // Durasi
    { wch: 20 }, // Status
    { wch: 35 }, // Catatan
  ];

  // 2. Prepare Summary Sheet Data
  const totalStops = stops.length;
  const overLimitStops = stops.filter((s) => s.isOverLimit).length;
  const normalStops = totalStops - overLimitStops;
  const totalIdleMinutes = stops.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const summaryData = [
    [companyName, 'RINGKASAN STATISTIK OPERASIONAL ARMADA'],
    [''],
    ['Metrik', 'Nilai'],
    ['Total Titik Perhentian', totalStops],
    ['Perhentian Normal (< 60 Menit)', normalStops],
    ['Perhentian Melebihi Batas (> 60 Menit)', overLimitStops],
    ['Total Waktu Berhenti (Jam)', (totalIdleMinutes / 60).toFixed(1) + ' Jam'],
    ['Rata-rata Durasi Perhentian', (totalStops > 0 ? (totalIdleMinutes / totalStops).toFixed(0) : 0) + ' Menit'],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 35 }, { wch: 20 }];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Perhentian');
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan_Statistik');

  // Generate filename
  const fileName = `PT_Esa_Jaya_Laporan_GPS_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export stops data to PDF document
 */
export function exportStopsToPdf(
  stops: StopPoint[],
  companyName: string = 'PT. ESA JAYA MULIA SENTOSA',
  downloadedBy: string = 'Owner Management'
) {
  const doc = new jsPDF('landscape');

  // Header banner
  doc.setFillColor(30, 27, 75); // Dark Indigo
  doc.rect(0, 0, 297, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('LAPORAN RESMI GPS TRACKING & RIWAYAT TITIK PERHENTIAN ARMADA (30 HARI)', 14, 20);

  // Metadata sub-header
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.text(
    `Tanggal Export: ${formatDateTime(new Date().toISOString())} | Diunduh Oleh: ${downloadedBy} | Total Catatan: ${stops.length}`,
    14,
    35
  );

  // Table header
  let startY = 42;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, 269, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  doc.text('No', 16, startY + 5.5);
  doc.text('Driver / Plat', 26, startY + 5.5);
  doc.text('Koordinat (Lat, Lng)', 80, startY + 5.5);
  doc.text('Waktu Tiba', 140, startY + 5.5);
  doc.text('Waktu Keluar', 180, startY + 5.5);
  doc.text('Durasi', 220, startY + 5.5);
  doc.text('Status', 250, startY + 5.5);

  let currentY = startY + 12;
  const pageHeight = doc.internal.pageSize.getHeight();

  stops.forEach((stop, idx) => {
    // Check if new page is needed
    if (currentY > pageHeight - 20) {
      doc.addPage('landscape');
      currentY = 20;

      // Repeat Table header on new page
      doc.setFillColor(241, 245, 249);
      doc.rect(14, currentY, 269, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('No', 16, currentY + 5.5);
      doc.text('Driver / Plat', 26, currentY + 5.5);
      doc.text('Koordinat (Lat, Lng)', 80, currentY + 5.5);
      doc.text('Waktu Tiba', 140, currentY + 5.5);
      doc.text('Waktu Keluar', 180, currentY + 5.5);
      doc.text('Durasi', 220, currentY + 5.5);
      doc.text('Status', 250, currentY + 5.5);
      currentY += 12;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    if (stop.isOverLimit) {
      doc.setFillColor(254, 242, 242); // soft red highlight
      doc.rect(14, currentY - 4, 269, 8, 'F');
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(30, 41, 59);
    }

    doc.text(`${idx + 1}`, 16, currentY + 1.5);
    doc.text(`${stop.driverName} (${stop.vehiclePlate})`, 26, currentY + 1.5);
    doc.text(formatCoord(stop.lat, stop.lng), 80, currentY + 1.5);
    doc.text(formatDateTime(stop.arrivalTime), 140, currentY + 1.5);
    doc.text(formatDateTime(stop.departureTime), 180, currentY + 1.5);
    doc.text(`${stop.durationMinutes} Menit`, 220, currentY + 1.5);
    
    if (stop.isOverLimit) {
      doc.setFont('helvetica', 'bold');
      doc.text('ALERT >60m', 250, currentY + 1.5);
    } else {
      doc.text('Normal', 250, currentY + 1.5);
    }

    currentY += 8;
  });

  const fileName = `PT_Esa_Jaya_Laporan_GPS_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

/**
 * Export stops to standard CSV
 */
export function exportStopsToCsv(
  stops: StopPoint[],
  companyName: string = 'PT. ESA JAYA MULIA SENTOSA'
) {
  const headers = [
    'No',
    'ID Perjalanan',
    'Nama Driver',
    'Plat Nomor',
    'Latitude',
    'Longitude',
    'Waktu Tiba',
    'Waktu Berangkat',
    'Durasi Berhenti (Menit)',
    'Status Warning (>60 Min)',
    'Catatan',
  ];

  const rows = stops.map((s, idx) => [
    idx + 1,
    `"${s.tripId}"`,
    `"${s.driverName}"`,
    `"${s.vehiclePlate}"`,
    s.lat.toFixed(6),
    s.lng.toFixed(6),
    `"${formatDateTime(s.arrivalTime)}"`,
    `"${formatDateTime(s.departureTime)}"`,
    s.durationMinutes,
    s.isOverLimit ? 'YES' : 'NO',
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    `# ${companyName} - Laporan GPS & Titik Perhentian`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PT_Esa_Jaya_GPS_Stops_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
