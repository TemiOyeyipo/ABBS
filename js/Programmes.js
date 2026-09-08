/**
 * Programmes Module - ABBS SIS
 * Handles master programme catalog listing, filtering, modal creation/editing, 
 * course allocations, and API persistence.
 */

window.masterProgrammes = window.masterProgrammes || [];
window.masterCourses = window.masterCourses || [];
window.tempAllocatedCourses = window.tempAllocatedCourses || [];

function renderProgrammesView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  // Dynamically inject component CSS styles if not present
  if (!document.getElementById('programmes-module-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'programmes-module-styles';
    styleEl.textContent = `
      .prog-card-container {
        background: var(--bg-card, #1E293B);
        border: 1px solid var(--border-color, #334155);
        border-radius: var(--radius, 8px);
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      }
      .prog-header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 10px;
      }
      .prog-header-bar h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #FFFFFF;
      }
      .btn-accent-prog {
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
      .btn-accent-prog:hover {
        background: var(--accent-hover, #2563EB);
      }
      .btn-sec-prog {
        padding: 8px 14px;
        background: var(--bg-hover, #334155);
        color: #FFFFFF;
        border: 1px solid var(--border-color, #334155);
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
      }
      .search-input-prog {
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
      .search-input-prog:focus {
        border-color: var(--accent, #3B82F6);
      }
      .prog-list-box {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .prog-card-item {
        background: var(--bg-main, #0F172A);
        border: 1px solid var(--border-color, #334155);
        padding: 14px;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .badge-prog-active {
        background: rgba(16, 185, 129, 0.15);
        color: #10B981;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge-prog-inactive {
        background: rgba(239, 68, 68, 0.15);
        color: #EF4444;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .prog-modal-mask {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
      }
      .prog-modal-box {
        width: 100%;
        max-width: 550px;
        background: var(--bg-card, #1E293B);
        border: 1px solid var(--border-color, #334155);
        border-radius: var(--radius, 8px);
        padding: 20px;
      }
      .form-group-prog {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
      }
      .form-group-prog label {
        font-size: 12px;
        color: var(--text-muted, #94A3B8);
        font-weight: 500;
      }
      .ctrl-prog {
        width: 100%;
        padding: 8px 10px;
        background: var(--bg-main, #0F172A);
        border: 1px solid var(--border-color, #334155);
        color: #FFFFFF;
        border-radius: 6px;
        font-size: 13px;
        outline: none;
      }
      .ctrl-prog:focus {
        border-color: var(--accent, #3B82F6);
      }
      .alloc-container {
        background: var(--bg-main, #0F172A);
        border: 1px solid var(--border-color, #334155);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
      }
      .tbl-alloc {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      .tbl-alloc th, .tbl-alloc td {
        padding: 6px;
        border-bottom: 1px solid var(--border-color, #334155);
        text-align: left;
        color: #fff;
      }
      .tbl-alloc th {
        color: var(--text-muted, #94A3B8);
      }
    `;
    document.head.appendChild(styleEl);
  }

  contentPanel.innerHTML = `
    <div class="prog-card-container">
      <div class="prog-header-bar">
        <h3>Programmes Portal</h3>
        <button class="btn-accent-prog" onclick="openProgModal()"><i class="fa-solid fa-plus"></i> New Programme</button>
      </div>

      <input type="text" id="search-programme" class="search-input-prog" placeholder="Search programmes..." onkeyup="filterProgrammes()">

      <div id="programme-list" class="prog-list-box">
        <div style="text-align: center; color: var(--text-muted, #94A3B8); padding: 20px;">Loading programmes...</div>
      </div>
    </div>

    <!-- Modal Container -->
    <div id="programme-modal-overlay" class="prog-modal-mask" style="display: none;">
      <div class="prog-modal-box">
        <div class="prog-header-bar" style="margin-bottom: 12px;">
          <h4 id="prog-modal-title" style="margin: 0; color: #fff;">Manage Programme</h4>
          <i class="fa-solid fa-xmark" onclick="closeProgModal()" style="cursor: pointer; color: var(--text-muted, #94A3B8);"></i>
        </div>

        <input type="hidden" id="prog-row">
        <input type="hidden" id="prog-id">

        <div class="form-group-prog">
          <label>Programme Name</label>
          <input type="text" id="prog-name" class="ctrl-prog" placeholder="e.g. Higher Diploma in Software Engineering" required>
        </div>

        <div class="form-group-prog">
          <label>Status</label>
          <select id="prog-status" class="ctrl-prog">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div class="alloc-container">
          <label style="font-size: 12px; font-weight: 600; color: #fff; display: block; margin-bottom: 8px;">Allocate Courses to Programme</label>
          
          <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <select id="course-dropdown-selector" class="ctrl-prog" style="flex: 2; min-width: 180px;" onchange="autoFillCourseUnits()">
              <option value="">Loading Master List Courses...</option>
            </select>
            <input type="number" id="course-unit-input" class="ctrl-prog" placeholder="Units" min="1" max="6" style="width: 75px;">
            <button type="button" onclick="appendCourseToTable()" class="btn-accent-prog">Add</button>
          </div>

          <table class="tbl-alloc">
            <thead>
              <tr>
                <th>Course Name</th>
                <th style="width: 50px;">Unit</th>
                <th style="width: 90px;">Status</th>
                <th style="width: 30px;"></th>
              </tr>
            </thead>
            <tbody id="allocated-courses-body">
              <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted, #94A3B8); padding: 10px;">No courses allocated yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn-sec-prog" onclick="closeProgModal()">Cancel</button>
          <button type="button" id="save-prog-btn" class="btn-accent-prog" onclick="submitProgramme()">Save Programme</button>
        </div>
      </div>
    </div>
  `;

  // Fetch dynamic content from API
  loadProgrammesView();
  loadMasterCoursesList();
}

function loadProgrammesView() {
  apiCall('getProgrammesList')
    .then(response => {
      const data = (response && response.data) ? response.data : response;
      if (Array.isArray(data)) {
        renderProgrammesList(data);
      } else {
        renderProgrammesList([]);
      }
    })
    .catch(err => {
      console.error("getProgrammesList failed:", err);
      const listContainer = document.getElementById('programme-list');
      if (listContainer) {
        listContainer.innerHTML = `<div style="text-align: center; color: #EF4444; padding: 20px;">Could not load programmes: ${err.message}</div>`;
      }
    });
}

function loadMasterCoursesList() {
  apiCall('getAllMasterCourses')
    .then(response => {
      const courses = (response && response.data) ? response.data : response;
      window.masterCourses = Array.isArray(courses) ? courses : [];
      populateMasterCoursesDropdown();
    })
    .catch(err => {
      console.error("Failed to fetch master courses:", err);
      populateMasterCoursesDropdown();
    });
}

function populateMasterCoursesDropdown() {
  const select = document.getElementById('course-dropdown-selector');
  if (!select) return;

  if (!window.masterCourses || window.masterCourses.length === 0) {
    select.innerHTML = '<option value="">No Master Courses Available</option>';
    return;
  }

  let optionsHtml = '<option value="">Select Course from Master List...</option>';
  window.masterCourses.forEach((c, idx) => {
    const displayName = c.name || (c.code ? `${c.code} - ${c.title}` : c.title) || c;
    optionsHtml += `<option value="${displayName}" data-index="${idx}">${displayName}</option>`;
  });

  select.innerHTML = optionsHtml;
}

function autoFillCourseUnits() {
  const select = document.getElementById('course-dropdown-selector');
  const unitInput = document.getElementById('course-unit-input');
  if (!select || !unitInput) return;

  const selectedOption = select.options[select.selectedIndex];
  const courseIdx = selectedOption ? selectedOption.getAttribute('data-index') : null;

  if (courseIdx !== null && window.masterCourses[courseIdx]) {
    unitInput.value = window.masterCourses[courseIdx].defaultUnit || window.masterCourses[courseIdx].units || 3;
  } else {
    unitInput.value = '';
  }
}

function renderProgrammesList(data) {
  window.masterProgrammes = data || [];
  const listContainer = document.getElementById('programme-list');
  if (!listContainer) return;
  
  if (!window.masterProgrammes.length) {
    listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted, #94A3B8); padding: 20px;">No programmes found. Click "+ New Programme" above to create one.</div>`;
    return;
  }

  let html = '';
  window.masterProgrammes.forEach(prog => {
    const badgeClass = prog.status === 'Active' ? 'badge-prog-active' : 'badge-prog-inactive';
    const jsonString = JSON.stringify(prog).replace(/'/g, "&apos;");

    html += `
      <div class="prog-card-item">
        <div>
          <div style="font-weight: 600; font-size: 14px; color: #fff;">${prog.name || 'Untitled Programme'} <span style="font-size: 11px; color: var(--accent, #3B82F6);">(${prog.id || 'N/A'})</span></div>
          <div style="color: var(--text-muted, #94A3B8); font-size: 12px; margin-top: 4px;">
            Total Allocated Units: <strong>${prog.totalUnits || 0}</strong>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="${badgeClass}">${prog.status || 'Active'}</span>
          <i class="fa-solid fa-pen-to-square" style="color: var(--accent, #3B82F6); cursor: pointer;" onclick='openProgModal(true, ${jsonString})'></i>
        </div>
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

// Expose explicitly to window scope for onclick bindings
window.openProgModal = function(isEdit = false, progData = null) {
  try {
    const modalOverlay = document.getElementById('programme-modal-overlay');
    if (!modalOverlay) {
      console.error("Modal container 'programme-modal-overlay' missing from DOM.");
      return;
    }

    const setElemVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    const modalTitle = document.getElementById('prog-modal-title');
    if (modalTitle) {
      modalTitle.innerText = isEdit ? "Edit Programme & Curriculum" : "New Programme";
    }

    setElemVal('prog-name', isEdit && progData ? progData.name : '');
    setElemVal('prog-status', isEdit && progData ? progData.status : 'Active');
    setElemVal('prog-id', isEdit && progData ? progData.id : '');
    setElemVal('prog-row', isEdit && progData ? progData.row : '');

    // Refresh courses dropdown
    if (!window.masterCourses || window.masterCourses.length === 0) {
      if (typeof loadMasterCoursesList === 'function') loadMasterCoursesList();
    } else {
      if (typeof populateMasterCoursesDropdown === 'function') populateMasterCoursesDropdown();
    }

    // Handle course allocations fetch
    if (isEdit && progData && progData.id) {
      apiCall('getCoursesByProgrammeId', { programmeId: progData.id })
        .then(response => {
          const courses = (response && response.data) ? response.data : response;
          window.tempAllocatedCourses = Array.isArray(courses) ? courses : [];
          if (typeof renderAllocatedCoursesTable === 'function') renderAllocatedCoursesTable();
        })
        .catch(err => {
          console.error("Failed fetching programme courses:", err);
          window.tempAllocatedCourses = [];
          if (typeof renderAllocatedCoursesTable === 'function') renderAllocatedCoursesTable();
        });
    } else {
      window.tempAllocatedCourses = [];
      if (typeof renderAllocatedCoursesTable === 'function') renderAllocatedCoursesTable();
    }

    // Display modal
    modalOverlay.style.display = 'flex';
  } catch (err) {
    console.error("Error opening programme modal:", err);
    alert("Could not open modal: " + err.message);
  }
};

window.closeProgModal = function() {
  const modalOverlay = document.getElementById('programme-modal-overlay');
  if (modalOverlay) modalOverlay.style.display = 'none';
};

function appendCourseToTable() {
  const select = document.getElementById('course-dropdown-selector');
  const unitInput = document.getElementById('course-unit-input');
  
  const courseName = select.value;
  const unit = unitInput.value;

  if (!courseName) return alert("Please select a course from the dropdown.");
  if (!unit || unit <= 0) return alert("Please enter a valid course unit.");

  if (window.tempAllocatedCourses.some(c => c.courseName === courseName)) {
    return alert("This course is already allocated to this programme.");
  }

  window.tempAllocatedCourses.push({
    courseName: courseName,
    unit: Number(unit),
    status: "Active"
  });

  renderAllocatedCoursesTable();
  select.value = "";
  unitInput.value = "";
}

function renderAllocatedCoursesTable() {
  const tbody = document.getElementById('allocated-courses-body');
  if (!tbody) return;

  if (!window.tempAllocatedCourses.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted, #94A3B8); padding: 10px;">No courses allocated yet.</td></tr>`;
    return;
  }

  let html = '';
  window.tempAllocatedCourses.forEach((c, index) => {
    html += `
      <tr>
        <td>${c.courseName}</td>
        <td>${c.unit}</td>
        <td>
          <select onchange="window.tempAllocatedCourses[${index}].status = this.value" class="ctrl-prog" style="padding: 2px 4px; font-size: 11px;">
            <option value="Active" ${c.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${c.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </td>
        <td style="text-align: center;">
          <i class="fa-solid fa-trash" onclick="removeAllocatedCourse(${index})" style="color: #EF4444; cursor: pointer;"></i>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function removeAllocatedCourse(index) {
  window.tempAllocatedCourses.splice(index, 1);
  renderAllocatedCoursesTable();
}

function submitProgramme() {
  const btn = document.getElementById('save-prog-btn');
  const payload = {
    row: document.getElementById('prog-row').value,
    programmeId: document.getElementById('prog-id').value,
    programmeName: document.getElementById('prog-name').value.trim(),
    status: document.getElementById('prog-status').value,
    courses: window.tempAllocatedCourses
  };

  if (!payload.programmeName) return alert("Programme Name is required.");

  btn.disabled = true;
  btn.innerText = "Saving...";

  apiCall('saveProgrammeWithCourses', { form: payload }, 'POST')
    .then(response => {
      btn.disabled = false;
      btn.innerText = "Save Programme";

      if (response && (response.status === 'success' || response.result === 'success')) {
        closeProgModal();
        renderProgrammesView();
      } else {
        alert("Error saving programme: " + (response.message || "Unknown error"));
      }
    })
    .catch(err => {
      btn.disabled = false;
      btn.innerText = "Save Programme";
      alert("Error: " + err.message);
    });
}

function filterProgrammes() {
  const query = document.getElementById('search-programme').value.toLowerCase();
  const cards = document.querySelectorAll('.prog-card-item');
  
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? 'flex' : 'none';
  });
}
