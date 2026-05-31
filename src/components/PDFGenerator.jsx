import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Grade calculation for Form 1 & Form 2 (Letter grades)
const getLetterGrade = (percentage) => {
  if (percentage >= 80) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
};

// Get points for Form 3 & Form 4 based on percentage
const getPoints = (percentage) => {
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

// Get grade description based on points for Form 3 & Form 4
const getPointsGrade = (points) => {
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

// Get remark based on grade
const getRemark = (grade, points, classLevel) => {
  if (classLevel === 'form3' || classLevel === 'form4') {
    switch(points) {
      case 1: return 'Excellent performance! Keep it up!';
      case 2: return 'Very good performance!';
      case 3: return 'Good performance!';
      case 4: return 'Above average performance!';
      case 5: return 'Average performance. Can improve!';
      case 6: return 'Satisfactory performance. Work harder!';
      case 7: return 'Below average. Requires improvement!';
      case 8: return 'Poor performance! Need serious effort!';
      default: return 'Failed. Please work much harder!';
    }
  } else {
    switch(grade) {
      case 'A': return 'Excellent performance! Keep it up!';
      case 'B': return 'Good performance!';
      case 'C': return 'Average performance. Can improve!';
      case 'D': return 'Below average. Requires improvement!';
      case 'E': return 'Poor performance! Need serious effort!';
      default: return 'Failed. Please work much harder!';
    }
  }
};

export const generateGradePDF = (studentData, marks, ranking, classLevel) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 200);
  doc.text('Ntcheu School System', 105, 20, { align: 'center' });
  
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
  
  // Add grading system indicator
  const isUpperForm = (classLevel === 'form3' || classLevel === 'form4');
  const gradingSystem = isUpperForm ? 'Points System (1-9)' : 'Letter Grades (A-F)';
  doc.setTextColor(100, 100, 100);
  doc.text(`Grading System: ${gradingSystem}`, 140, 55);
  doc.setTextColor(0, 0, 0);
  
  // Marks Table
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
      remark = getRemark(letterGrade, null, classLevel);
    }
    
    return [
      mark.subjectName || mark.subject,
      `${percentage}%`,
      gradeOrPoints,
      remark
    ];
  });
  
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
      2: { cellWidth: 35 },
      3: { cellWidth: 55 }
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
  
  // Overall Grade/Points
  if (isUpperForm) {
    const overallPoints = getPoints(ranking.average || 0);
    doc.text(`Overall Points: ${overallPoints} point${overallPoints !== 1 ? 's' : ''}`, 140, finalY + 20);
    doc.text(`Grade Description: ${getPointsGrade(overallPoints)}`, 20, finalY + 30);
  } else {
    const overallGrade = getLetterGrade(ranking.average || 0);
    doc.text(`Overall Grade: ${overallGrade}`, 140, finalY + 20);
    doc.text(`Grade Description: ${getRemark(overallGrade, null, classLevel)}`, 20, finalY + 30);
  }
  
  // Remarks
  const finalRemark = ranking.remarks || getRemark(ranking.grade, ranking.points, classLevel);
  doc.text(`Remarks: ${finalRemark}`, 20, finalY + 45);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated document. No signature required.', 105, finalY + 65, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, finalY + 72, { align: 'center' });
  
  // Grading Guide at the bottom
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Grading Guide', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  if (isUpperForm) {
    doc.text('Points System (Form 3 & Form 4):', 20, 40);
    const pointsGuide = [
      '85-100% → 1 point (Excellent)',
      '80-84% → 2 points (Very Good)',
      '65-79% → 3 points (Good)',
      '60-64% → 4 points (Above Average)',
      '55-59% → 5 points (Average)',
      '50-54% → 6 points (Satisfactory)',
      '45-49% → 7 points (Below Average)',
      '40-44% → 8 points (Poor)',
      '0-39% → 9 points (Fail)'
    ];
    let yPos = 50;
    pointsGuide.forEach(line => {
      doc.text(line, 25, yPos);
      yPos += 8;
    });
  } else {
    doc.text('Letter Grades (Form 1 & Form 2):', 20, 40);
    const letterGuide = [
      '80-100% → A (Excellent)',
      '65-79% → B (Good)',
      '50-64% → C (Average)',
      '45-49% → D (Below Average)',
      '40-44% → E (Poor)',
      '0-39% → F (Fail)'
    ];
    let yPos = 50;
    letterGuide.forEach(line => {
      doc.text(line, 25, yPos);
      yPos += 8;
    });
  }
  
  doc.text(`Calculation: Test1(20%) + Test2(20%) + End Term(60%) = Overall Percentage`, 20, finalY + 100);
  
  // Save PDF
  const fileName = `${studentData.name.replace(/\s/g, '_')}_Report_${studentData.term}_${studentData.year}.pdf`;
  doc.save(fileName);
};

// Export helper functions for use in components
export { getLetterGrade, getPoints, getPointsGrade, getRemark };