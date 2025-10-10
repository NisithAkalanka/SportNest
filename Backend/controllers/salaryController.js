// Backend/controllers/salaryController.js

const Member = require('../models/memberModel');
const Attendance = require('../models/AttendanceModel');

exports.generateSalaryReport = async (req, res) => {
    try {
        const { year, month } = req.body;
        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }

        // 1. select yr ekt and month ekt adl dws parasaya laba gnima (UTC time)
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1));
        
        //get full days of a month
        const totalDaysInMonth = new Date(year, month, 0).getDate();

        // 2. base salary thiyena Coachlawa soya gnima
        const coaches = await Member.find({ role: 'Coach', baseSalary: { $gt: 0 } });
        if (coaches.length === 0) {
            return res.status(200).json([]);
        }
        
        const coachIds = coaches.map(c => c._id);

        // 3. ema masaya thula adala Coach-lage 'Approved' status eka athi siyaluma attendance records pamanak laba ganima
        const attendanceRecords = await Attendance.find({
            memberId: { $in: coachIds },
            date: { $gte: startDate, $lt: endDate },
            status: 'Approved' // 'Approved' pamanak thora ganima
        });
        
        // 4. ek ek Coach sadaha salary repots
        const report = coaches.map(coach => {
            const coachAttendance = attendanceRecords.filter(
                record => record.memberId.toString() === coach._id.toString()
            );

            
            let fullDays = 0;
            let halfDays = 0;
            let dutyLeaves = 0; 
            let unpaidLeaves = 0; 

            coachAttendance.forEach(record => {
                switch (record.attendanceType) {
                    case 'Full-Day':
                        fullDays++;
                        break;
                    case 'Half-Day':
                        halfDays++;
                        break;
                    case 'Duty-Leave':
                        dutyLeaves++;
                        break;
                    case 'Leave':
                        unpaidLeaves++;
                        break;
                    default:
                        break; 
                }
            });

            // 6. calculate(Absences) 
            // Absences = all days of month - (Coach wisin athulath kala Approved ganana)
            const totalReportedDays = coachAttendance.length;
            const absences = totalDaysInMonth - totalReportedDays;
            
            // 7.calculate (Net Salary)
            // salary for a day = base salary / days of month
            const perDaySalary = coach.baseSalary > 0 ? (coach.baseSalary / totalDaysInMonth) : 0;
            
            // salary gewiyayuthu dina ganan = full days+ duty leaves + (half days * 0.5)
            const totalPaidDaysEquivalent = fullDays + dutyLeaves + (halfDays * 0.5);
            const netSalary = perDaySalary * totalPaidDaysEquivalent;

           
            return {
                coachId: coach._id,
                coachName: `${coach.firstName} ${coach.lastName}`,
                baseSalary: coach.baseSalary,
                fullDays: fullDays,
                halfDays: halfDays,
                dutyLeaves: dutyLeaves,
                unpaidLeaves: unpaidLeaves,
                absences: absences < 0 ? 0 : absences, // agaya 0 ta wada adu wima nawathweema
                netSalary: netSalary.toFixed(2)
            };
        });
        
        //  sampurna report eka response eka lesa yaweema
        res.status(200).json(report);

    } catch (error) {
        console.error("Error generating salary report:", error);
        res.status(500).json({ message: "Failed to generate salary report", error: error.message });
    }
};