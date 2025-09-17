import PDFDocument from "pdfkit";

export const generateResultPDF = (student, results, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Result_${student.rollNo}.pdf`
  );

  doc.pipe(res);

  // Title
  doc.fontSize(20).text("University Examination Result", { align: "center" });
  doc.moveDown();

  // Student Info
  doc.fontSize(12).text(`Name: ${student.name}`);
  doc.text(`Roll No: ${student.rollNo}`);
  doc.text(`Course: ${student.course}`);
  doc.text(`Department: ${student.department}`);
  doc.moveDown();

  results.forEach((result) => {
    doc
      .fontSize(14)
      .text(`Exam: ${result.exam.examName}`, { underline: true });
    doc.fontSize(12).text(`Semester: ${result.exam.semester}`);
    doc.text(`Date: ${new Date(result.exam.examDate).toDateString()}`);
    doc.moveDown(0.5);

    // Table Header
    doc.font("Helvetica-Bold");
    doc.text("Subject Code", 50, doc.y, { continued: true });
    doc.text("Subject Name", 150, doc.y, { continued: true });
    doc.text("Marks", 350, doc.y, { continued: true });
    doc.text("Max Marks", 420, doc.y, { continued: true });
    doc.text("Grade", 500, doc.y);
    doc.font("Helvetica");

    result.marks.forEach((m) => {
      doc.text(m.subjectCode, 50, doc.y, { continued: true });
      doc.text(m.subjectName, 150, doc.y, { continued: true });
      doc.text(m.marksObtained.toString(), 350, doc.y, { continued: true });
      doc.text(m.maxMarks.toString(), 420, doc.y, { continued: true });
      doc.text(m.grade || "-", 500, doc.y);
    });

    doc.moveDown();
    doc.text(`Overall Percentage: ${result.overallPercentage}%`);
    doc.text(`Result Status: ${result.resultStatus.toUpperCase()}`);
    doc.moveDown(2);
  });

  doc.end();
};
