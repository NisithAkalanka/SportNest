// Frontend/src/pages/SalaryPage.jsx

import React, { useState } from 'react';
import { generateReport } from '../api/salaryService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, BarChart2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SalaryPage = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, name: 'January' }, { value: 2, name: 'February' },
        { value: 3, name: 'March' }, { value: 4, name: 'April' },
        { value: 5, name: 'May' }, { value: 6, name: 'June' },
        { value: 7, name: 'July' }, { value: 8, name: 'August' },
        { value: 9, name: 'September' }, { value: 10, name: 'October' },
        { value: 11, name: 'November' }, { value: 12, name: 'December' }
    ];

    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError('');
        setReportData(null);
        try {
            const data = await generateReport(Number(selectedYear), Number(selectedMonth));
            setReportData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate report.');
        } finally {
            setIsLoading(false);
        }
    };

   
    const handleDownloadPdf = () => {
        if (!reportData || reportData.length === 0) {
            alert("No data available to download.");
            return;
        }

        try {
            const doc = new jsPDF();
            const monthName = months.find(m => m.value.toString() === selectedMonth)?.name || 'Month';
            doc.setFontSize(20);
            doc.text(`Salary Report - ${monthName} ${selectedYear}`, 14, 22);
            
            const tableColumn = [ "Coach Name", "Basic Salary", "Full Days", "Half Days", "Duty Leaves", "Unpaid Leaves", "Absences", "Net Salary" ];
            const tableRows = reportData.map(item => [
                item.coachName,
                parseFloat(item.baseSalary || 0).toFixed(2),
                item.fullDays, item.halfDays, item.dutyLeaves,
                item.unpaidLeaves, item.absences,
                parseFloat(item.netSalary || 0).toFixed(2)
            ]);
            
            // total salary calculation
            const totalNetSalary = reportData.reduce((total, item) => total + parseFloat(item.netSalary), 0);
            
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
            
            // PDF eke Table ekt psse  Total ek ekthu kirima
            const finalY = doc.lastAutoTable.finalY; 
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Salary Expenditure: LKR ${totalNetSalary.toFixed(2)}`, 14, finalY + 15);
            
            doc.save(`Salary_Report_${monthName}_${selectedYear}.pdf`);
        } catch (pdfError) {
            console.error("Failed to generate PDF:", pdfError);
            alert("An error occurred while generating the PDF. Check the console for details.");
        }
    };
    
    //cal salary
    const totalSalary = reportData ? reportData.reduce((sum, item) => sum + parseFloat(item.netSalary), 0) : 0;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Salary Report</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col"><label className="mb-2 font-semibold text-gray-700">Year</label><Select onValueChange={setSelectedYear} value={selectedYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex flex-col"><label className="mb-2 font-semibold text-gray-700">Month</label><Select onValueChange={setSelectedMonth} value={selectedMonth}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.name}</SelectItem>)}</SelectContent></Select></div>
                    <Button onClick={handleGenerateReport} disabled={isLoading} className="md:col-start-4 bg-orange-500 text-white hover:bg-orange-600">
                        <BarChart2 className="mr-2 h-4 w-4" /> 
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </Button>
                </div>
            </div>

            {isLoading && <p>Generating report...</p>}
            {error && <p className="text-red-600">{error}</p>}
            
            {reportData && !isLoading && (
                <div>
                    {reportData.length > 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Report Details</h2>
                                <Button onClick={handleDownloadPdf} className="bg-green-600 text-white hover:bg-green-700">
                                    <FileDown className="mr-2 h-4 w-4" /> 
                                    Download as PDF
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Coach Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Basic Salary</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Full Days</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Half Days</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Duty Leaves (Paid)</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Leaves (Unpaid)</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Absences</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Net Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.map(item => (
                                            <tr key={item.coachId} className="hover:bg-blue-50">
                                                <td className="px-6 py-4">{item.coachName}</td>
                                                <td className="px-6 py-4">{parseFloat(item.baseSalary).toFixed(2)}</td>
                                                <td className="px-6 py-4">{item.fullDays}</td>
                                                <td className="px-6 py-4">{item.halfDays}</td>
                                                <td className="px-6 py-4">{item.dutyLeaves}</td>
                                                <td className="px-6 py-4">{item.unpaidLeaves}</td>
                                                <td className="px-6 py-4">{item.absences}</td>
                                                <td className="px-6 py-4 font-bold text-lg">{parseFloat(item.netSalary).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {/* <<< NEW: Table ekt Total ekthu kirima>>> */}
                                    <tfoot className="bg-gray-200">
                                        <tr>
                                            {/* mul columns 7m ekak wge penwimata `colSpan` damima */}
                                            <td colSpan="7" className="px-6 py-4 text-right font-bold text-gray-700 text-lg">TOTAL SALARY EXPENDITURE</td>
                                            {/* show total salary */}
                                            <td className="px-6 py-4 whitespace-nowrap font-extrabold text-gray-900 text-xl">
                                                {totalSalary.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div><p>No salary data found for the selected period.</p></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SalaryPage;