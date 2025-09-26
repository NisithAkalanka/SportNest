import React, { useState } from 'react';
import { generateReport } from '../api/salaryService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ★★★ 1. බොත්තම් සඳහා අයිකන (icons) import කර ගැනීම ★★★
import { FileDown, BarChart2 } from 'lucide-react'; // 'lucide-react' library එක install කරගත යුතුය.

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
            
            const tableColumn = [
                "Coach Name", "Basic Salary (LKR)", "Full Days", "Half Days", 
                "Duty Leaves (Paid)", "Leaves (Unpaid)", "Absences", "Net Salary (LKR)"
            ];
            
            const tableRows = reportData.map(item => [
                item.coachName,
                parseFloat(item.baseSalary || 0).toFixed(2),
                item.fullDays, item.halfDays, item.dutyLeaves,
                item.unpaidLeaves, item.absences,
                parseFloat(item.netSalary || 0).toFixed(2)
            ]);
            
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
            doc.save(`Salary_Report_${monthName}_${selectedYear}.pdf`);
        } catch (pdfError) {
            console.error("Failed to generate PDF:", pdfError);
            alert("An error occurred. Check the console for details.");
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Salary Report</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col"><label className="mb-2 font-semibold text-gray-700">Year</label><Select onValueChange={setSelectedYear} value={selectedYear}><SelectTrigger className="focus:ring-2 focus:ring-blue-500"><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex flex-col"><label className="mb-2 font-semibold text-gray-700">Month</label><Select onValueChange={setSelectedMonth} value={selectedMonth}><SelectTrigger className="focus:ring-2 focus:ring-blue-500"><SelectValue /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.name}</SelectItem>)}</SelectContent></Select></div>
                    
                    {/* ★★★ 2. "Generate Report" බොත්තම තැඹිලි පාට කර, අයිකනයක් සහ hover effect එකක් එක් කිරීම ★★★ */}
                    <Button onClick={handleGenerateReport} disabled={isLoading} className="md:col-start-4 bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                        <BarChart2 className="mr-2 h-4 w-4" /> 
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </Button>
                </div>
            </div>

            {isLoading && <p className="text-center text-blue-600 font-semibold">Generating report, please wait...</p>}
            {error && <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center font-medium">{error}</p>}
            
            {reportData && !isLoading && (
                <div className="animate-in fade-in-0 duration-600">
                    {reportData.length > 0 ? (
                        // ★★★ 3. Report Details කාඩ්පතට ඉහළින් වර්ණවත් මායිමක් එක් කිරීම ★★★
                        <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-t-4 border-blue-500">
                            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">Report Details</h2>
                                
                                {/* ★★★ 4. "Download as PDF" බොත්තම කොළ පාට කර, අයිකනයක් සහ hover effect එකක් එක් කිරීම ★★★ */}
                                <Button onClick={handleDownloadPdf} disabled={!reportData || reportData.length === 0} className="bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                                    <FileDown className="mr-2 h-4 w-4" /> 
                                    Download as PDF
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* ★★★ 5. වගුවේ ශීර්ෂයට (Table Header) තද පැහැති පසුබිමක් ලබා දීම ★★★ */}
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Coach Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Basic Salary</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Full Days</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Half Days</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Duty Leaves (Paid)</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Leaves (Unpaid)</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Absences</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.map(item => (
                                            // ★★★ 6. එක් එක් පේළියට (row) hover effect එකක් එක් කිරීම ★★★
                                            <tr key={item.coachId} className="hover:bg-blue-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.coachName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{parseFloat(item.baseSalary).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.fullDays}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.halfDays}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.dutyLeaves}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.unpaidLeaves}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.absences}</td>
                                                {/* ★★★ 7. ශුද්ධ වැටුප (Net Salary) තද පැහැයෙන් (bold) පෙන්වීම ★★★ */}
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-lg">{parseFloat(item.netSalary).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center transition-all duration-300 hover:shadow-xl animate-in fade-in-0 duration-600">
                            <p className="text-gray-600 font-semibold text-lg">No salary data found for the selected period.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SalaryPage;