// frontend/src/utils/pdfGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ★★★ MUST import like this ★★★

// title: PDF එකේ report title (string)
// head: Table headers (array of arrays) → e.g., [['First Name', 'Email', 'Plan']]
// body: Table data (array of arrays) → e.g., [['Nisith', 'a@gmail.com', 'Student'], ...]
// filename: Save කරන PDF file නම (string, without .pdf)

export const generatePdf = (title, head, body, filename) => {
    // 1. Create new PDF
    const doc = new jsPDF('p', 'pt', 'a4'); // Portrait, points unit, A4 page

    // 2. Add Main Header (SportNest Report)
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('SportNest Report', 40, 50);

    // 3. Add Date/Time
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 70);

    // 4. Add Specific Report Title
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 40, 100);

    // 5. Generate Table using jspdf-autotable
    autoTable(doc, {
        startY: 120,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [13, 27, 42] }, // Navy Blue Header
        styles: {
            fontSize: 9,
            cellPadding: 8,
        },
    });

    // 6. Save PDF
    doc.save(`${filename}.pdf`);
};
