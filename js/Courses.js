/**
 * Courses Module - ABBS SIS
 * Handles master course catalog listing, filtering, modal creation/editing, and API persistence.
 */

window.allMasterCourses = window.allMasterCourses || [];

function renderCoursesView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  // Inject CSS Styles Dynamically if not already present
  if (!document.getElementById('courses-module-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'courses-module-styles';
    styleEl.textContent = `
      .crs-card-container {
        background: var(--bg-card, #1E293B);
        border: 1px solid var(--border-color, #334155);
        border-radius: var(--radius, 8px);
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      }
      .crs-header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 10px;
      }
      .crs-header-bar h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #FFFFFF;
      }
      .btn-accent-crs {
        padding: 8px 14px;
        background: var(--accent, #3B82F6);
        color: #FFFFFF;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .btn-accent-crs:hover {
        background: var(--accent-hover, #2563EB);
      }
      .btn-sec-crs {
        padding: 8px 14px;
        background: var(--bg-hover, #334155);
        color: #FFFFFF;
        border: 1px solid var(--border-color, #334155);
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
      }
      .search-input-crs {
        width: 100%;
        padding: 10px 12px;
        background: var(--bg-main, #0F172A);
        border: 1px solid var(--border-color, #334155);
        color: #FFFFFF;
        border-radius: 6px;
        font-size: 13px;
        margin-bottom: 16px;
        outline: none;
      }
      .search-input-crs:focus {
        border-color: var(--accent, #3B82F6);
      }
      .tbl-crs {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        text-align: left;
      }
      .tbl-crs th, .tbl-crs td {
        padding: 12px 10px;
        border-bottom: 1px solid var(--border-color, #334155);
      }
      .tbl-crs th {
        background: var(--bg-main, #0F172A);
        color: var(--text-muted, #94A3B8);
        font-weight: 600;
      }
      .tbl-crs td {
        color: #FFFFFF;
      }
      .badge-crs-active {
        background: rgba(16, 185, 129, 0.15);
        color: #10B981;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge-crs-inactive {
        background: rgba(239, 68, 68, 0.15);
        color: #EF4444;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .crs-modal-mask {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
      }
      .crs-modal-box {
        width: 100%;
        max-width: 480px;
        background: var(--bg-card, #1E293B);
        border: 1px solid var(--border-color, #334155);
        border-radius: var(--radius, 8px);
        padding: 20px;
      }
      .form-group-crs {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
      }
      .form-group-crs label {
        font-size: 12px;
        color: var(--text-muted, #94A3B8);
        font-weight: 500;
      }
      .ctrl-crs {
        width: 100%;
        padding: 10px;
        background: var(--bg-main, #0F172A);
        border: 1px solid var(--border-color, #334155);
        color: #FFFFFF;
        border-radius: 6px;
        font-size: 13px;
        outline: none;
      }
      .ctrl-crs:focus {
        border-color: var(--accent, #3B82F6);
      }
    `;
    document.head.appendChild(styleEl);
  }

  contentPanel.innerHTML = `
    <div class="crs-card-container">
      <div class="crs-header-bar">
        <h3>Master Courses Catalog</h3>
        <button class="btn-accent-crs" onclick="openCourseModal()"><i class="fa-solid fa-plus"></i> New Course</button>
      </div>

      <input type="text" id="search-course" class="search-input-crs" placeholder="Search course by code or title..." onkeyup="filterCoursesTable()">

      <div style="overflow-x: auto;">
        <table class="tbl-crs">
          <thead>
            <tr>
              <th style="width: 120px;">Course Code</th>
              <th>Course Title</th>
              <th style="width: 70px;">Units</th>
              <th>Department</th>
              <th style="width: 90px;">Status</th>
              <th style="width: 40px;"></th>
            </tr>
          </thead>
          <tbody id="courses-table-body">
            <tr>
              <td colspan="6" style="text-align: center; color: var(--text-muted, #94A3B8); padding: 20px;">Loading catalog...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Course Add/Edit Modal -->
    <div id="course-modal-overlay" class="crs-modal-mask" style="display: none;">
      <div class="crs-modal-box">
        <div class="crs-header-bar" style="margin-bottom: 12px;">
          <h4 id="crs-modal-title" style="margin: 0; color: #fff;">Course Entry</h4>
          <i class="fa-solid fa-xmark" onclick="closeCourseModal()" style="cursor: pointer; color: var(--text-muted, #94A3B8);"></i>
        </div>

        <input type="hidden" id="crs-row">
        <input type="hidden" id="crs-id">

        <div style="display: flex; gap: 10px;">
          <div class="form-group-crs" style="flex: 2;">
            <label>Course Code</label>
            <input type="text" id="crs-code" class="ctrl-crs" placeholder="e.g. GST 101" required>
          </div>
          <div class="form-group-crs" style="flex: 1;">
            <label>Default Units</label>
            <input type="number" id="crs-units" class="ctrl-crs" min="1" max="6" value="3" required>
          </div>
        </div>

        <div class="form-group-crs">
          <label>Course Title</label>
          <input type="text" id="crs-title" class="ctrl-crs" placeholder="e.g. Use of English & Communication" required>
        </div>

        <div class="form-group-crs">
          <label>Department / Faculty</label>
          <input type="text" id="crs-dept" class="ctrl-crs" placeholder="e.g. General Studies">
        </div>

        <div class="form-group-crs">
          <label>Status</label>
          <select id="crs-status" class="ctrl-crs">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
          <button type="button" class="btn-sec-crs" onclick="closeCourseModal()">Cancel</button>
          <button type="button" id="save-crs-btn" class="btn-accent-crs" onclick="submitCourse()">Save Course</button>
        </div>
      </div>
    </div>
  `;

  loadCoursesTable();
}

function loadCoursesTable() {
  apiCall('getAllMasterCourses')
    .then(response => {
      const courses = (response && response.data) ? response.data : response;
      if (Array.isArray(courses)) {
        renderCoursesTableData(courses);
      } else {
        throw new Error(response.message || "Invalid courses payload structure.");
      }
    })
    .catch(err => {
      const tbody = document.getElementById('courses-table-body');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #EF4444; padding: 20px;">Error loading courses: ${err.message}</td></tr>`;
      }
    });
}

function renderCoursesTableData(courses) {
  window.allMasterCourses = courses || [];
  const tbody = document.getElementById('courses-table-body');
  if (!tbody) return;

  if (!window.allMasterCourses.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted, #94A3B8); padding: 20px;">No master courses found. Add your first course above!</td></tr>`;
    return;
  }

  let html = '';
  window.allMasterCourses.forEach((c) => {
    const badge = c.status === 'Active' ? 'badge-crs-active' : 'badge-crs-inactive';
    const jsonString = JSON.stringify(c).replace(/'/g, "&apos;");

    html += `
      <tr>
        <td><strong>${c.code || '—'}</strong></td>
        <td>${c.title || ''}</td>
        <td>${c.units || ''}</td>
        <td style="color: var(--text-muted, #94A3B8);">${c.department || 'General'}</td>
        <td><span class="${badge}">${c.status || 'Active'}</span></td>
        <td style="text-align: center;">
          <i class="fa-solid fa-pen-to-square" style="color: var(--accent, #3B82F6); cursor: pointer;" onclick='openCourseModal(true, ${jsonString})'></i>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function openCourseModal(isEdit = false, cData = null) {
  const modal = document.getElementById('course-modal-overlay');
  document.getElementById('crs-modal-title').innerText = isEdit ? "Edit Master Course" : "New Master Course";
  document.getElementById('crs-row').value = isEdit ? cData.row : '';
  document.getElementById('crs-id').value = isEdit ? cData.id : '';
  document.getElementById('crs-code').value = isEdit ? (cData.code || '') : '';
  document.getElementById('crs-title').value = isEdit ? (cData.title || '') : '';
  document.getElementById('crs-units').value = isEdit ? (cData.units || 3) : 3;
  document.getElementById('crs-dept').value = isEdit ? (cData.department || '') : '';
  document.getElementById('crs-status').value = isEdit ? (cData.status || 'Active') : 'Active';

  if (modal) modal.style.display = 'flex';
}

function closeCourseModal() {
  const modal = document.getElementById('course-modal-overlay');
  if (modal) modal.style.display = 'none';
}

function submitCourse() {
  const btn = document.getElementById('save-crs-btn');
  const payload = {
    row: document.getElementById('crs-row').value,
    id: document.getElementById('crs-id').value,
    code: document.getElementById('crs-code').value.trim(),
    title: document.getElementById('crs-title').value.trim(),
    units: document.getElementById('crs-units').value,
    department: document.getElementById('crs-dept').value.trim(),
    status: document.getElementById('crs-status').value
  };

  if (!payload.title) return alert("Course Title is required.");
  if (!payload.units || payload.units <= 0) return alert("Valid Units are required.");

  btn.disabled = true;
  btn.innerText = "Saving...";

  apiCall('saveMasterCourse', { form: payload }, 'POST')
    .then(response => {
      btn.disabled = false;
      btn.innerText = "Save Course";
      
      if (response && (response.status === 'success' || response.result === 'success')) {
        closeCourseModal();
        renderCoursesView();
      } else {
        alert("Error saving course: " + (response.message || "Unknown error"));
      }
    })
    .catch(err => {
      btn.disabled = false;
      btn.innerText = "Save Course";
      alert("Error saving course: " + err.message);
    });
}

function filterCoursesTable() {
  const query = document.getElementById('search-course').value.toLowerCase();
  const rows = document.querySelectorAll('#courses-table-body tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}
