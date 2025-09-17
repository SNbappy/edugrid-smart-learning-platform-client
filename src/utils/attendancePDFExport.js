import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Apply the plugin to jsPDF
applyPlugin(jsPDF);

// Export all attendance sessions as one comprehensive PDF
export const exportAllSessionsPDF = (classroomName, attendanceSessions, stats) => {
    try {
        const doc = new jsPDF();

        // Add title and header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Attendance Report', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text(classroomName, 105, 30, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

        // Add summary statistics
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics:', 14, 55);

        doc.setFont(undefined, 'normal');
        doc.text(`Total Sessions: ${attendanceSessions.length}`, 14, 65);
        doc.text(`Total Students: ${stats.totalStudents || 0}`, 14, 72);
        doc.text(`Average Attendance: ${stats.averageAttendance}%`, 14, 79);

        let currentY = 90;

        // Process each session
        attendanceSessions.forEach((session, index) => {
            // Check if we need a new page
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }

            // Session header
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(session.title, 14, currentY);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Date: ${new Date(session.date).toLocaleDateString()} | Status: ${session.status}`, 14, currentY + 7);

            if (session.description) {
                doc.text(`Description: ${session.description}`, 14, currentY + 14);
                currentY += 7;
            }

            // Calculate session stats
            const present = session.attendance.filter(s => s.status === 'present').length;
            const absent = session.attendance.filter(s => s.status === 'absent').length;
            const unmarked = session.attendance.filter(s => s.status === 'unmarked').length;

            // Session statistics
            doc.text(`Present: ${present} | Absent: ${absent} | Unmarked: ${unmarked}`, 14, currentY + 14);

            // Create table data
            const tableData = session.attendance.map(student => [
                student.studentName || 'N/A',
                student.studentEmail || 'N/A',
                (student.status || 'unmarked').charAt(0).toUpperCase() + (student.status || 'unmarked').slice(1),
                student.markedAt ? new Date(student.markedAt).toLocaleString() : 'Not marked'
            ]);

            // Use autoTable
            doc.autoTable({
                startY: currentY + 20,
                head: [['Student Name', 'Email', 'Status', 'Marked At']],
                body: tableData,
                theme: 'striped',
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [69, 123, 157],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { left: 14, right: 14 }
            });

            // Update currentY to the end of the table
            currentY = doc.lastAutoTable.finalY + 15;
        });

        // Save the PDF
        const fileName = `${classroomName.replace(/\s+/g, '_')}_Complete_Attendance_Report.pdf`;
        doc.save(fileName);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};

// Export single session as PDF
export const exportSingleSessionPDF = (session, classroomName = 'Classroom') => {
    try {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Attendance Report', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text(session.title, 105, 30, { align: 'center' });
        doc.setFont(undefined, 'normal');
        doc.text(classroomName, 105, 40, { align: 'center' });

        // Session details
        doc.setFontSize(12);
        doc.text(`Date: ${new Date(session.date).toLocaleDateString()}`, 14, 55);
        doc.text(`Status: ${session.status}`, 14, 62);
        if (session.description) {
            doc.text(`Description: ${session.description}`, 14, 69);
        }
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 76);

        // Calculate statistics
        const present = session.attendance.filter(s => s.status === 'present').length;
        const absent = session.attendance.filter(s => s.status === 'absent').length;
        const unmarked = session.attendance.filter(s => s.status === 'unmarked').length;
        const total = session.attendance.length;
        const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        // Statistics section
        doc.setFont(undefined, 'bold');
        doc.text('Session Statistics:', 14, 90);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Students: ${total}`, 14, 97);
        doc.text(`Present: ${present} (${attendanceRate}%)`, 14, 104);
        doc.text(`Absent: ${absent}`, 14, 111);
        doc.text(`Unmarked: ${unmarked}`, 14, 118);

        // Create table data
        const tableData = session.attendance.map(student => [
            student.studentName || 'N/A',
            student.studentEmail || 'N/A',
            (student.status || 'unmarked').charAt(0).toUpperCase() + (student.status || 'unmarked').slice(1),
            student.markedAt ? new Date(student.markedAt).toLocaleString() : 'Not marked',
            student.markedBy || 'N/A'
        ]);

        // Add attendance table
        doc.autoTable({
            startY: 130,
            head: [['Student Name', 'Email', 'Status', 'Marked At', 'Marked By']],
            body: tableData,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [69, 123, 157],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 40 }, // Student Name
                1: { cellWidth: 55 }, // Email
                2: { cellWidth: 25 }, // Status
                3: { cellWidth: 35 }, // Marked At
                4: { cellWidth: 30 }  // Marked By
            },
            margin: { left: 14, right: 14 }
        });

        // Save the PDF
        const fileName = `${session.title.replace(/\s+/g, '_')}_Attendance.pdf`;
        doc.save(fileName);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};
