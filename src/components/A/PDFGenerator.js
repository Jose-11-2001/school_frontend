import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const getLetterGrade = (percentage) => {
  if (percentage >= 80) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
};

export const getPoints = (percentage) => {
  if (percentage >= 85) return 1;
  if (percentage >= 80) return 2;
  if (percentage >= 65) return 3;
  if (percentage >= 60) return 4;
  if (percentage >= 55) return 5;
  if (percentage >= 50) return 6;
  if (percentage >= 45) return 7;
  if (percentage >= 40) return 8;
  return 9;
};

export const getPointsGrade = (points) => {
  if (points === 1) return 'Excellent';
  if (points === 2) return 'Very Good';
  if (points === 3) return 'Good';
  if (points === 4) return 'Above Average';
  if (points === 5) return 'Average';
  if (points === 6) return 'Satisfactory';
  if (points === 7) return 'Below Average';
  if (points === 8) return 'Poor';
  return 'Fail';
};

export const generateGradePDF = (studentData, marks, ranking, classLevel) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 200);
  doc.text('Ntcheu School System', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Academic Report', 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Student Name: ${studentData.name}`, 20, 55);
  doc.text(`Admission Number: ${studentData.admissionNumber}`, 20, 65);
  doc.text(`Class: ${studentData.class || 'N/A'}`, 20, 75);
  doc.text(`Stream: ${studentData.stream || 'N/A'}`, 20, 85);
  doc.text(`Term: ${studentData.term}`, 20, 95);
  doc.text(`Year: ${studentData.year}`, 20, 105);
  
  const isUpperForm = (classLevel === 'form3' || classLevel === 'form4');
  const gradingSystem = isUpperForm ? 'Points System (1-9)' : 'Letter Grades (A-F)';
  doc.text(`Grading System: ${gradingSystem}`, 140, 55);
  
  const tableColumn = ["Subject", "Score", isUpperForm ? "Points" : "Grade", "Remark"];
  const tableRows = marks.map(mark => {
    const percentage = mark.score;
    let gradeOrPoints = '';
    let remark = '';
    
    if (isUpperForm) {
      const points = getPoints(percentage);
      gradeOrPoints = `${points} point${points !== 1 ? 's' : ''}`;
      remark = getPointsGrade(points);
    } else {
      const letterGrade = getLetterGrade(percentage);
      gradeOrPoints = letterGrade;
      remark = '';
    }
    
    return [mark.subjectName || mark.subject, `${percentage}%`, gradeOrPoints, remark];
  });
  
  doc.autoTable({
    startY: 115,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 }
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total Marks: ${ranking.totalMarks || 0}`, 20, finalY);
  doc.text(`Average Score: ${ranking.average || 0}%`, 20, finalY + 10);
  doc.text(`Position: ${ranking.position || 'N/A'}`, 140, finalY);
  
  const fileName = `${studentData.name.replace(/\s/g, '_')}_Report.pdf`;
  doc.save(fileName);
};
