const Member = require('../models/memberModel');
const Attendance = require('../models/AttendanceModel');

exports.generateSalaryReport = async (req, res) => {
    try {
        const { year, month } = req.body;
        console.log(`Generating report for Year: ${year}, Month: ${month}`);

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }

        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1)); 
        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        
        const coaches = await Member.find({ role: 'Coach', baseSalary: { $gt: 0 } });
        console.log(`Found ${coaches.length} coaches with a base salary.`);

        if (coaches.length === 0) {
            return res.status(200).json([]);
        }
        
        const coachIds = coaches.map(c => c._id);
        const attendanceRecords = await Attendance.find({
            memberId: { $in: coachIds },
            date: { $gte: startDate, $lt: endDate }
        });
        console.log(`Found ${attendanceRecords.length} relevant attendance records.`);
        
        const report = coaches.map(coach => {
            const coachAttendance = attendanceRecords.filter(
                record => record.memberId.toString() === coach._id.toString()
            );

            // watup sahitha dina gananya kirima
            const fullDays = coachAttendance.filter(r => r.status === 'Work Full-Day').length;
            const halfDays = coachAttendance.filter(r => r.status === 'Work Half-Day').length;
            const dutyLeaves = coachAttendance.filter(r => r.status === 'Duty-Leave').length;
            
            // 1.watup rahitha 'Leave' dina gananya kirima
            const unpaidLeaves = coachAttendance.filter(r => r.status === 'Leave').length;
            const absences = coachAttendance.filter(r => r.status === 'Absent').length;

            // watup gananya kirimeda Absent and Leave nosalakai
            const netSalary = (coach.baseSalary / 30) * (fullDays + (halfDays * 0.5) + dutyLeaves);

            return {
                coachId: coach._id,
                coachName: `${coach.firstName} ${coach.lastName}`,
                baseSalary: coach.baseSalary,
                fullDays,
                halfDays,
                dutyLeaves,
                //  2. Frontend ekt unpaidLeaves gnana yaweema
                unpaidLeaves, 
                absences,
                netSalary: netSalary.toFixed(2)
            };
        });
        
        console.log("Final report generated:", report);
        res.status(200).json(report);

    } catch (error) {
        console.error("Error generating salary report:", error);
        res.status(500).json({ message: "Failed to generate salary report", error: error.message });
    }
};