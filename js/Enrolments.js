/**
 * Enrolments Module - ABBS SIS
 * Handles student academic enrolments listing, filtering, modal management, and API persistence.
 */

let allEnrolmentsData = [];

function renderEnrolmentView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  // Render core layout frame
  contentPanel.innerHTML = `
    <div class="module-card" style="background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); border-radius: var(--radius, 8px); padding: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; flex-wrap: wrap;">
        <h3 style="margin: 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">Academic Enrolments</h3>
        <button onclick="openEnrolmentModal()" style="padding: 8px 12px; background: var(--accent, #3B82F6); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <i class="fa-solid fa-plus"></i> New Enrolment
        </button>
      </div>

      <div style="margin-bottom: 14px;">
        <input type="text" id="enrolment-search-input" onkeyup="filterEnrolments()" placeholder="Search by Student ID, Name, Programme, or Cohort..." style="width: 100%; padding: 10px 12px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; font-size: 13px; outline: none;">
      </div>

      <div id="enrolment-list" style="display: flex; flex-direction: column; gap: 10px;">
        <p style="color: var(--text-muted, #94A3B8); text-align: center; padding: 16px;">Loading enrolments...</p>
      </div>
    </div>
  `;

  // Dynamically inject Enrolment Modal into document body if not present
  if (!document.getElementById('enrolment-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'enrolment-modal';
    modalDiv.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 440px; background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); border-radius: var(--radius, 8px); padding: 20px; z-index: 1001; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);';

    modalDiv.innerHTML = `
      <h3 id="enrolment-modal-title" style="margin-top: 0; margin-bottom: 14px; color: #FFFFFF;">Enrol Student</h3>
      <input type="hidden" id="enrolment-row">
      <input type="hidden" id="enrolment-id">
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Select Student</label>
          <select id="enrolment-student-id" style="width: 100%; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
            <option value="">Select Student...</option>
          </select>
        </div>

        <div>
          <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Select Programme</label>
          <select id="enrolment-programme" style="width: 100%; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
            <option value="">Select Programme...</option>
          </select>
        </div>

        <div>
          <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Select Cohort</label>
          <select id="enrolment-cohort" style="width: 100%; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
            <option value="">Select Cohort...</option>
          </select>
        </div>

        <div>
          <label style="font-size: 11px; color: var(--text-muted, #94A3B8); display: block; margin-bottom: 4px;">Enrolment Status</label>
          <select id="enrolment-status" style="width: 100%; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;">
            <option value="Enrolled">Enrolled</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="save-enrol-btn" onclick="submitEnrolment()" style="flex: 1; padding: 10px; background: var(--accent, #3B82F6); color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Save Enrolment</button>
          <button onclick="closeEnrolmentModal()" style="flex: 1; padding: 10px; background: var(--bg-hover, #334155); color: #fff; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  loadEnrolmentListData();
}

function loadEnrolmentListData() {
  apiCall('getEnrolments')
    .then(response => {
      const data = (response && response.data) ? response.data : response;
      allEnrolmentsData = Array.isArray(data) ? data : [];
      displayEnrolmentCards(allEnrolmentsData);
    })
    .catch(err => {
      console.error("getEnrolments failed:", err);
      const container = document.getElementById('enrolment-list');
      if (container) {
        container.innerHTML = `<p style="color: #EF4444; text-align: center; padding: 16px;">Error loading enrolments: ${err.message}</p>`;
      }
    });
}

function displayEnrolmentCards(data) {
  const container = document.getElementById('enrolment-list');
  if (!container) return;

  if (!data || !data.length) {
    container.innerHTML = `<p style="color: var(--text-muted, #94A3B8); text-align: center; padding: 16px;">No active enrolments found.</p>`;
    return;
  }

  let html = '';
  data.forEach(item => {
    const jsonString = JSON.stringify(item).replace(/'/g, "&apos;");
    const passportUrl = item.passport || 'https://via.placeholder.com/150';

    html += `
      <div style="background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${passportUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent, #3B82F6);" onError="this.src='https://via.placeholder.com/150'">
          <div>
            <div style="font-weight: 600; font-size: 14px; color: #FFFFFF;">${item.studentName || 'Unknown Student'} <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: var(--bg-hover, #334155); color: var(--accent, #3B82F6); margin-left: 4px;">${item.status || 'Enrolled'}</span></div>
            <div style="color: var(--accent, #3B82F6); font-weight: 500; font-size: 12px; margin-top: 2px;">${item.programme || 'N/A'} &bull; <span style="color: var(--text-muted, #94A3B8);">${item.cohort || 'N/A'}</span></div>
            <div style="color: var(--text-muted, #94A3B8); font-size: 11px;">ID: ${item.studentId || 'N/A'} | Ref: ${item.enrolmentId || 'N/A'}</div>
          </div>
        </div>
        <div>
          <button onclick='openEnrolmentModal(${jsonString})' style="background: none; border: none; color: var(--accent, #3B82F6); cursor: pointer; padding: 4px;"><i class="fa-solid fa-pen-to-square"></i></button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

window.openEnrolmentModal = function(item = null) {
  const modal = document.getElementById('enrolment-modal');
  const modalTitle = document.getElementById('enrolment-modal-title');
  if (modalTitle) modalTitle.innerText = item ? "Edit Enrolment" : "New Enrolment";

  document.getElementById('enrolment-row').value = item ? item.row : "";
  document.getElementById('enrolment-id').value = item ? item.enrolmentId : "";

  // Fetch selection options dynamically to populate select inputs
  apiCall('getEnrolmentFormData')
    .then(response => {
      const options = (response && response.data) ? response.data : response;
      if (!options) return;

      // Populate Students Dropdown
      const studentSelect = document.getElementById('enrolment-student-id');
      if (studentSelect) {
        studentSelect.innerHTML = '<option value="">Select Student...</option>';
        if (Array.isArray(options.students)) {
          options.students.forEach(s => {
            studentSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.id})</option>`;
          });
        }
        if (item) studentSelect.value = item.studentId;
      }

      // Populate Programmes Dropdown
      const progSelect = document.getElementById('enrolment-programme');
      if (progSelect) {
        progSelect.innerHTML = '<option value="">Select Programme...</option>';
        if (Array.isArray(options.programmes)) {
          options.programmes.forEach(p => {
            const pName = p.name || p;
            progSelect.innerHTML += `<option value="${pName}">${pName}</option>`;
          });
        }
        if (item) progSelect.value = item.programme;
      }

      // Populate Cohorts Dropdown
      const cohortSelect = document.getElementById('enrolment-cohort');
      if (cohortSelect) {
        cohortSelect.innerHTML = '<option value="">Select Cohort...</option>';
        if (Array.isArray(options.cohorts)) {
          options.cohorts.forEach(c => {
            const cName = c.name || c;
            cohortSelect.innerHTML += `<option value="${cName}">${cName}</option>`;
          });
        }
        if (item) cohortSelect.value = item.cohort;
      }

      if (item && document.getElementById('enrolment-status')) {
        document.getElementById('enrolment-status').value = item.status;
      }

      const overlay = document.getElementById('modal-overlay');
      if (overlay) overlay.classList.add('active');
      if (modal) modal.style.display = 'block';
    })
    .catch(err => {
      console.error("Failed fetching enrolment form data:", err);
      alert("Error preparing enrolment form: " + err.message);
    });
};

window.closeEnrolmentModal = function() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');

  const modal = document.getElementById('enrolment-modal');
  if (modal) modal.style.display = 'none';
};

function submitEnrolment() {
  const btn = document.getElementById('save-enrol-btn');
  const form = {
    row: document.getElementById('enrolment-row').value,
    enrolmentId: document.getElementById('enrolment-id').value,
    studentId: document.getElementById('enrolment-student-id').value,
    programme: document.getElementById('enrolment-programme').value,
    cohort: document.getElementById('enrolment-cohort').value,
    status: document.getElementById('enrolment-status').value
  };

  if (!form.studentId || !form.programme || !form.cohort) {
    return alert("Student, Programme, and Cohort are required.");
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Saving...";
  }

  apiCall('saveEnrolment', { form: form }, 'POST')
    .then(response => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Enrolment";
      }

      if (response && (response.status === 'success' || response.result === 'success')) {
        closeEnrolmentModal();
        renderEnrolmentView();
      } else {
        alert("Error saving enrolment: " + (response.message || "Unknown error"));
      }
    })
    .catch(err => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Enrolment";
      }
      alert("Error saving enrolment: " + err.message);
    });
}

function filterEnrolments() {
  const queryInput = document.getElementById('enrolment-search-input');
  if (!queryInput) return;

  const query = queryInput.value.toLowerCase().trim();
  const filtered = allEnrolmentsData.filter(item => 
    (item.studentId && item.studentId.toLowerCase().includes(query)) ||
    (item.studentName && item.studentName.toLowerCase().includes(query)) ||
    (item.programme && item.programme.toLowerCase().includes(query)) ||
    (item.cohort && item.cohort.toLowerCase().includes(query))
  );
  displayEnrolmentCards(filtered);
}
