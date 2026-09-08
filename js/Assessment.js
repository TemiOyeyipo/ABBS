/**
 * Assessment Module - ABBS SIS
 * Manages student academic assessments, automated attendance fetching, grade calculation, and persistence.
 */

let allAssessmentsData = [];

function renderAssessmentView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  // Render core view layout
  contentPanel.innerHTML = `
    <div class="module-card" style="background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); border-radius: var(--radius, 8px); padding: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; flex-wrap: wrap;">
        <h3 style="margin: 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">Course Assessments</h3>
        <button onclick="openAssessmentModal()" style="padding: 8px 12px; background: var(--accent, #3B82F6); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <i class="fa-solid fa-plus"></i> Record Assessment
        </button>
      </div>

      <div style="margin-bottom: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <input type="text" id="asm-search-input" onkeyup="filterAssessments()" placeholder="Filter by Student ID, Name, Programme, Cohort, Course..." style="flex: 1; padding: 10px 12px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; font-size: 13px; outline: none;">
      </div>

      <div id="asm-list" style="display: flex; flex-direction: column; gap: 10px;">
        <p style="color: var(--text-muted, #94A3B8); text-align: center; padding: 16px;">Loading assessments...</p>
      </div>
    </div>
  `;

  // Inject dynamic assessment modal frame into document body if absent
  if (!document.getElementById('assessment-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'assessment-modal';
    modalDiv.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 450px; background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); border-radius: var(--radius, 8px); padding: 20px; z-index: 1001; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);';

    modalDiv.innerHTML = `
      <h3 id="assessment-modal-title" style="margin-top: 0; margin-bottom: 14px; color: #FFFFFF;">Record Assessment</h3>
      <input type="hidden" id="asm-row">
      <input type="hidden" id="asm-id">

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Enrolled Student</label>
          <select id="asm-student-id" onchange="autoFetchProgrammeCourses()" style="width: 100%; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
            <option value="">Select Student...</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <div style="flex: 1;">
            <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Programme</label>
            <input type="text" id="asm-programme" readonly style="width: 100%; padding: 10px; background: var(--bg-hover, #334155); border: 1px solid var(--border-color, #334155); color: #aaa; border-radius: 6px; outline: none;">
          </div>
          <div style="flex: 1;">
            <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Cohort</label>
            <input type="text" id="asm-cohort" readonly style="width: 100%; padding: 10px; background: var(--bg-hover, #334155); border: 1px solid var(--border-color, #334155); color: #aaa; border-radius: 6px; outline: none;">
          </div>
        </div>

        <div>
          <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Course Name</label>
          <select id="asm-course-select" onchange="autoFetchAttendance()" style="width: 100%; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
            <option value="">Select Allocated Course...</option>
          </select>
        </div>

        <div style="background: var(--bg-main, #0F172A); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color, #334155); display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #FFFFFF;">
            <span>Attendance Score (Auto 30%):</span>
            <strong id="asm-attendance-preview" style="color: var(--accent, #3B82F6);">0.00 %</strong>
          </div>
          
          <div>
            <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Assignment Score (Max 20%):</label>
            <input type="number" id="asm-assignment" max="20" min="0" placeholder="0 - 20" style="width: 100%; padding: 8px; background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 4px; outline: none;" required>
          </div>

          <div>
            <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Exam Score (Max 50%):</label>
            <input type="number" id="asm-exam" max="50" min="0" placeholder="0 - 50" style="width: 100%; padding: 8px; background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 4px; outline: none;" required>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="save-asm-btn" onclick="submitAssessment()" style="flex: 1; padding: 10px; background: var(--accent, #3B82F6); color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Save Assessment</button>
          <button onclick="closeAssessmentModal()" style="flex: 1; padding: 10px; background: var(--bg-hover, #334155); color: #fff; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  loadAssessmentData();
}

function loadAssessmentData() {
  apiCall('getAssessments')
    .then(response => {
      const data = (response && response.data) ? response.data : response;
      allAssessmentsData = Array.isArray(data) ? data : [];
      displayAssessmentCards(allAssessmentsData);
    })
    .catch(err => {
      console.error("getAssessments failed:", err);
      const container = document.getElementById('asm-list');
      if (container) {
        container.innerHTML = `<p style="color: #EF4444; text-align: center; padding: 16px;">Error loading assessments: ${err.message}</p>`;
      }
    });
}

function displayAssessmentCards(data) {
  const container = document.getElementById('asm-list');
  if (!container) return;

  if (!data || !data.length) {
    container.innerHTML = `<p style="color: var(--text-muted, #94A3B8); text-align: center; padding: 16px;">No assessment records found.</p>`;
    return;
  }

  let html = '';
  data.forEach(item => {
    const scoreColor = item.totalScore >= 70 ? '#10B981' : item.totalScore >= 50 ? '#F59E0B' : '#EF4444';
    const jsonString = JSON.stringify(item).replace(/'/g, "&apos;");
    const passportUrl = item.passport || 'https://via.placeholder.com/150';

    html += `
      <div style="background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${passportUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent, #3B82F6);" onError="this.src='https://via.placeholder.com/150'">
          <div>
            <div style="font-weight: 600; font-size: 14px; color: #FFFFFF;">${item.studentName || 'Unknown Student'} <span style="font-size: 11px; color: var(--accent, #3B82F6);">(${item.studentId || 'N/A'})</span></div>
            <div style="font-weight: 500; font-size: 12px; color: #fff; margin-top: 2px;">${item.courseName || 'N/A'}</div>
            <div style="color: var(--text-muted, #94A3B8); font-size: 11px;">${item.programme || 'N/A'} &bull; ${item.cohort || 'N/A'}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="text-align: right; font-size: 11px; color: var(--text-muted, #94A3B8);">
            <div>Att: ${item.attendanceScore || 0}/30 | Ass: ${item.assignmentScore || 0}/20 | Exam: ${item.examScore || 0}/50</div>
            <div style="font-size: 14px; font-weight: 700; color: ${scoreColor}; margin-top: 2px;">Total: ${item.totalScore || 0}%</div>
          </div>
          <button onclick='openAssessmentModal(${jsonString})' style="background: none; border: none; color: var(--accent, #3B82F6); cursor: pointer; padding: 4px;"><i class="fa-solid fa-pen-to-square"></i></button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

window.openAssessmentModal = function(item = null) {
  const modalTitle = document.getElementById('assessment-modal-title');
  if (modalTitle) modalTitle.innerText = item ? "Edit Assessment" : "Record Assessment";

  document.getElementById('asm-row').value = item ? item.row : "";
  document.getElementById('asm-id').value = item ? item.assessmentId : "";

  // Fetch active enrolments to populate student selection
  apiCall('getEnrolments')
    .then(response => {
      const enrolments = (response && response.data) ? response.data : response;
      const select = document.getElementById('asm-student-id');
      if (!select) return;

      select.innerHTML = '<option value="">Select Enrolled Student...</option>';
      window.enrolmentCache = enrolments || [];

      if (Array.isArray(enrolments)) {
        enrolments.forEach(e => {
          select.innerHTML += `<option value="${e.studentId}" data-prog="${e.programme}" data-cohort="${e.cohort}">${e.studentName} - ${e.programme} (${e.cohort})</option>`;
        });
      }

      if (item) {
        select.value = item.studentId;
        document.getElementById('asm-programme').value = item.programme || "";
        document.getElementById('asm-cohort').value = item.cohort || "";
        
        // Fetch courses for selected programme and set values
        autoFetchProgrammeCourses(item.courseName);
        document.getElementById('asm-assignment').value = item.assignmentScore || "";
        document.getElementById('asm-exam').value = item.examScore || "";
        document.getElementById('asm-attendance-preview').innerText = (item.attendanceScore || "0.00") + " %";
      }

      const overlay = document.getElementById('modal-overlay');
      if (overlay) overlay.classList.add('active');

      const modal = document.getElementById('assessment-modal');
      if (modal) modal.style.display = 'block';
    })
    .catch(err => {
      console.error("Failed fetching enrolment dependencies:", err);
      alert("Error opening assessment modal: " + err.message);
    });
};

window.autoFetchProgrammeCourses = function(selectedCourseName = null) {
  const select = document.getElementById('asm-student-id');
  if (!select) return;

  const selectedOpt = select.options[select.selectedIndex];
  if (!selectedOpt || !selectedOpt.value) return;

  const programmeName = selectedOpt.getAttribute('data-prog');
  const cohort = selectedOpt.getAttribute('data-cohort');

  document.getElementById('asm-programme').value = programmeName || "";
  document.getElementById('asm-cohort').value = cohort || "";

  apiCall('getCoursesByProgramme', { programme: programmeName })
    .then(response => {
      const courses = (response && response.data) ? response.data : response;
      const courseSelect = document.getElementById('asm-course-select');
      if (!courseSelect) return;

      courseSelect.innerHTML = '<option value="">Select Allocated Course...</option>';
      
      if (!courses || !courses.length) {
        courseSelect.innerHTML += '<option value="" disabled>No active courses found for this programme</option>';
        return;
      }

      courses.forEach(c => {
        const cName = c.courseName || c;
        const cUnit = c.unit ? ` (${c.unit} Units)` : '';
        courseSelect.innerHTML += `<option value="${cName}">${cName}${cUnit}</option>`;
      });

      if (selectedCourseName) {
        courseSelect.value = selectedCourseName;
      }
    })
    .catch(err => {
      console.error("Failed fetching courses by programme:", err);
    });
};

window.autoFetchAttendance = function() {
  const select = document.getElementById('asm-student-id');
  if (!select) return;

  const selectedOpt = select.options[select.selectedIndex];
  if (!selectedOpt || !selectedOpt.value) return;

  const studentId = selectedOpt.value;
  const prog = selectedOpt.getAttribute('data-prog');
  const cohort = selectedOpt.getAttribute('data-cohort');
  const courseSelect = document.getElementById('asm-course-select');
  const course = courseSelect ? courseSelect.value : '';

  if (studentId && course) {
    apiCall('calculateAttendanceScore', { studentId, programme: prog, cohort, course })
      .then(response => {
        const score = (response && response.score !== undefined) ? response.score : response;
        const preview = document.getElementById('asm-attendance-preview');
        if (preview) preview.innerText = (score || "0.00") + " %";
      })
      .catch(err => {
        console.error("Failed calculating attendance score:", err);
      });
  }
};

window.closeAssessmentModal = function() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');

  const modal = document.getElementById('assessment-modal');
  if (modal) modal.style.display = 'none';
};

function submitAssessment() {
  const btn = document.getElementById('save-asm-btn');
  const courseSelect = document.getElementById('asm-course-select');

  const form = {
    row: document.getElementById('asm-row').value,
    assessmentId: document.getElementById('asm-id').value,
    studentId: document.getElementById('asm-student-id').value,
    programme: document.getElementById('asm-programme').value,
    cohort: document.getElementById('asm-cohort').value,
    courseName: courseSelect ? courseSelect.value : '',
    assignmentScore: document.getElementById('asm-assignment').value,
    examScore: document.getElementById('asm-exam').value
  };

  if (!form.studentId || !form.courseName) {
    return alert("Student and Course Name are required.");
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Saving...";
  }

  apiCall('saveAssessment', { form: form }, 'POST')
    .then(response => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Assessment";
      }

      if (response && (response.status === 'success' || response.result === 'success')) {
        closeAssessmentModal();
        renderAssessmentView();
      } else {
        alert("Error saving assessment: " + (response.message || "Unknown error"));
      }
    })
    .catch(err => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Assessment";
      }
      alert("Error saving assessment: " + err.message);
    });
}

function filterAssessments() {
  const queryInput = document.getElementById('asm-search-input');
  if (!queryInput) return;

  const query = queryInput.value.toLowerCase().trim();
  const filtered = allAssessmentsData.filter(item => 
    (item.studentId && item.studentId.toLowerCase().includes(query)) ||
    (item.studentName && item.studentName.toLowerCase().includes(query)) ||
    (item.programme && item.programme.toLowerCase().includes(query)) ||
    (item.cohort && item.cohort.toLowerCase().includes(query)) ||
    (item.courseName && item.courseName.toLowerCase().includes(query))
  );
  displayAssessmentCards(filtered);
}
