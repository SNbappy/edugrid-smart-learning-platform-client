import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportAttendanceRegisterPDF = (
    classroomName,
    sortedSessions,
    sortedStudents,
    getStudentAttendance
) => {
    try {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Attendance Register', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(classroomName, pageWidth / 2, 22, { align: 'center' });

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

        // Prepare table data
        const headers = [
            'Student Name',
            ...sortedSessions.map(session =>
                new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ),
            'Present',
            '%'
        ];

        const tableData = sortedStudents.map(student => {
            const { attendance, presentCount, totalSessions, percentage } =
                getStudentAttendance(student.email);

            return [
                student.name || student.email,
                ...attendance.map(status => status === 'present' ? 'P' : 'A'),
                `${presentCount}/${totalSessions}`,
                `${percentage}%`
            ];
        });

        // Create table
        doc.autoTable({
            startY: 35,
            head: [headers],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'center'
            },
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 50 },
                [headers.length - 2]: { fillColor: [219, 234, 254], fontStyle: 'bold' },
                [headers.length - 1]: { fillColor: [209, 250, 229], fontStyle: 'bold' }
            },
            didParseCell: function (data) {
                // Color P/A cells
                if (data.section === 'body' && data.column.index > 0 && data.column.index < headers.length - 2) {
                    if (data.cell.text[0] === 'P') {
                        data.cell.styles.fillColor = [209, 250, 229]; // Green
                        data.cell.styles.textColor = [22, 101, 52];
                    } else if (data.cell.text[0] === 'A') {
                        data.cell.styles.fillColor = [254, 226, 226]; // Red
                        data.cell.styles.textColor = [153, 27, 27];
                    }
                }
            }
        });

        // Footer statistics
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Students: ${sortedStudents.length}`, 20, finalY);
        doc.text(`Total Sessions: ${sortedSessions.length}`, 100, finalY);

        const avgAttendance = Math.round(
            sortedStudents.reduce((sum, student) => {
                const { percentage } = getStudentAttendance(student.email);
                return sum + percentage;
            }, 0) / sortedStudents.length
        );
        doc.text(`Average Attendance: ${avgAttendance}%`, 180, finalY);

        // Save PDF
        const fileName = `Attendance_Register_${classroomName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        return false;
    }
};
