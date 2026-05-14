import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateGradePDF = (studentData, marks, ranking) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 200);
  doc.text('School Marks System', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Academic Report', 105, 35, { align: 'center' });
  
  // Student Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Student Name: ${studentData.name}`, 20, 55);
  doc.text(`Admission Number: ${studentData.admissionNumber}`, 20, 65);
  doc.text(`Class: ${studentData.class || 'N/A'}`, 20, 75);
  doc.text(`Stream: ${studentData.stream || 'N/A'}`, 20, 85);
  doc.text(`Term: ${studentData.term}`, 20, 95);
  doc.text(`Year: ${studentData.year}`, 20, 105);
  
  // Marks Table
  const tableColumn = ["Subject", "Score", "Grade", "Remark"];
  const tableRows = marks.map(mark => [
    mark.subjectName || mark.subject,
    mark.score,
    mark.grade || calculateGrade(mark.score).grade,
    mark.remark || calculateGrade(mark.score).remark
  ]);
  
  doc.autoTable({
    startY: 115,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 60 }
    }
  });
  
  // Performance Summary
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Performance Summary', 20, finalY);
  
  doc.setFontSize(12);
  doc.text(`Total Marks: ${ranking.totalMarks || 0}`, 20, finalY + 10);
  doc.text(`Average Score: ${ranking.average || 0}%`, 20, finalY + 20);
  doc.text(`Position: ${ranking.position || 'N/A'}`, 140, finalY + 10);
  doc.text(`Overall Grade: ${ranking.grade || 'N/A'}`, 140, finalY + 20);
  
  // Remarks
  doc.text(`Remarks: ${ranking.remarks || getRemarks(ranking.grade)}`, 20, finalY + 35);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated document. No signature required.', 105, finalY + 55, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, finalY + 62, { align: 'center' });
  
  // Save PDF
  doc.save(`${studentData.name}_Report_${studentData.term}_${studentData.year}.pdf`);
};

const calculateGrade = (score) => {
  if (score >= 90) return { grade: 'A+', remark: 'Excellent' };
  if (score >= 80) return { grade: 'A', remark: 'Very Good' };
  if (score >= 75) return { grade: 'A-', remark: 'Good' };
  if (score >= 70) return { grade: 'B+', remark: 'Above Average' };
  if (score >= 65) return { grade: 'B', remark: 'Satisfactory' };
  if (score >= 60) return { grade: 'B-', remark: 'Average' };
  if (score >= 55) return { grade: 'C+', remark: 'Fair' };
  if (score >= 50) return { grade: 'C', remark: 'Pass' };
  if (score >= 45) return { grade: 'C-', remark: 'Below Average' };
  if (score >= 40) return { grade: 'D', remark: 'Needs Improvement' };
  return { grade: 'E', remark: 'Fail' };
};

const getRemarks = (grade) => {
  switch(grade) {
    case 'A+': return 'Excellent performance! Keep it up!';
    case 'A': return 'Very good performance!';
    case 'A-': return 'Good performance!';
    case 'B+': return 'Above average performance!';
    case 'B': return 'Satisfactory performance!';
    case 'B-': return 'Average performance. Can improve!';
    case 'C+': return 'Fair performance. Needs more effort!';
    case 'C': return 'Passing performance. Work harder!';
    case 'C-': return 'Below average. Requires improvement!';
    case 'D': return 'Needs significant improvement!';
    default: return 'Poor performance. Please work harder!';
  }
};