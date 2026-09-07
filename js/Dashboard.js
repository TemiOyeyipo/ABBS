function getDashboardMetrics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Fetch Total Students from "Students" sheet
  const studentsSheet = ss.getSheetByName("Students");
  const studentRows = studentsSheet ? studentsSheet.getLastRow() - 1 : 0;
  const totalStudents = Math.max(0, studentRows);

  // 2. Fetch Enrolments & Programme Breakdown from "Enrolments" sheet
  const enrolmentsSheet = ss.getSheetByName("Enrolment"); // or "Enrolments"
  let totalEnrolments = 0;
  const programmeCounts = {};
  const recentEnrolments = [];

  if (enrolmentsSheet && enrolmentsSheet.getLastRow() > 1) {
    // Read all data from sheet (Column headers assumed: [0] Student ID, [1] Student Name, [2] Programme, [3] Cohort, [4] Date)
    const enrolmentData = enrolmentsSheet.getRange(2, 1, enrolmentsSheet.getLastRow() - 1, enrolmentsSheet.getLastColumn()).getValues();
    
    totalEnrolments = enrolmentData.length;

    // Process rows from bottom (newest) to top
    for (let i = enrolmentData.length - 1; i >= 0; i--) {
      const row = enrolmentData[i];
      const studentName = row[1] || "Unknown Student";
      const programme = row[2] || "Unassigned";
      const cohort = row[3] || "N/A";
      const rawDate = row[4];
      
      // Format date string safely
      const dateStr = rawDate instanceof Date 
        ? Utilities.formatDate(rawDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd")
        : String(rawDate || "");

      // Count enrolments per programme
      programmeCounts[programme] = (programmeCounts[programme] || 0) + 1;

      // Collect the 5 most recent enrolments
      if (recentEnrolments.length < 5) {
        recentEnrolments.push({
          studentName: studentName,
          programme: programme,
          cohort: cohort,
          date: dateStr
        });
      }
    }
  }

  // Format Programme Breakdown for the frontend chart bars
  const programmeBreakdown = Object.keys(programmeCounts).map(progName => ({
    name: progName,
    count: programmeCounts[progName]
  }));

  // 3. Fetch Programmes count from "Programmes" sheet
  const programmesSheet = ss.getSheetByName("Programmes");
  let totalProgrammes = 0;
  let activeProgrammes = 0;

  if (programmesSheet && programmesSheet.getLastRow() > 1) {
    const progData = programmesSheet.getRange(2, 1, programmesSheet.getLastRow() - 1, programmesSheet.getLastColumn()).getValues();
    totalProgrammes = progData.length;

    // Assuming Column 3 (index 2) holds Status e.g. "Active"
    activeProgrammes = progData.filter(row => String(row[2]).toLowerCase() === "active").length;
  }

  // 4. Fetch Master Courses count from "Courses" sheet
  const coursesSheet = ss.getSheetByName("Courses");
  const courseRows = coursesSheet ? coursesSheet.getLastRow() - 1 : 0;
  const totalCourses = Math.max(0, courseRows);

  // Return formatted object expected by Dashboard.js
  return {
    totalStudents: totalStudents,
    totalEnrolments: totalEnrolments,
    activeProgrammes: activeProgrammes,
    totalProgrammes: totalProgrammes,
    totalCourses: totalCourses,
    programmeBreakdown: programmeBreakdown,
    recentEnrolments: recentEnrolments
  };
}
