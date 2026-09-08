/**
 * Cohorts Module - ABBS SIS
 * Handles cohort catalog listing, dynamic programme selection, modal creation/editing, and API persistence.
 */

window.masterCohorts = window.masterCohorts || [];

function renderCohortsView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  // Render core container structure
  contentPanel.innerHTML = `
    <div class="module-card" style="background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); border-radius: var(--radius, 8px); padding: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h3 style="margin: 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">Cohorts Management</h3>
        <button onclick="openCohortModal()" style="padding: 8px 12px; background: var(--accent, #3B82F6); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <i class="fa-solid fa-plus"></i> Add Cohort
        </button>
      </div>
      <div id="cohort-list" style="display: flex; flex-direction: column; gap: 10px;">
        <p style="color: var(--text-muted, #94A3B8); text-align: center; padding: 16px;">Loading cohorts...</p>
      </div>
    </div>
  `;

  // Inject Cohort Modal dynamically if it does not exist in the DOM
  if (!document.getElementById('cohort-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'cohort-modal';
    modalDiv.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 400px; background: var(--bg-card, #1E293B); border: 1px solid var(--border-color, #334155); border-radius: var(--radius, 8px); padding: 20px; z-index: 1001; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);';
    
    modalDiv.innerHTML = `
      <h3 id="cohort-modal-title" style="margin-top: 0; margin-bottom: 14px; color: #FFFFFF;">Add Cohort</h3>
      <input type="hidden" id="cohort-row">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <input type="text" id="cohort-name" placeholder="Cohort Name (e.g. DTH 2025/2026 Alpha)" style="padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
        
        <div style="display: flex; gap: 10px;">
          <input type="text" id="cohort-session" placeholder="Session (e.g. 2025/2026)" style="flex: 1; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
          <input type="number" id="cohort-year" placeholder="Year (e.g. 2025)" style="flex: 1; padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
        </div>

        <select id="cohort-programme" style="padding: 10px; background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); color: #fff; border-radius: 6px; outline: none;" required>
          <option value="">Select Programme...</option>
        </select>
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="save-cohort-btn" onclick="submitCohort()" style="flex: 1; padding: 10px; background: var(--accent, #3B82F6); color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Save Cohort</button>
          <button onclick="closeCohortModal()" style="flex: 1; padding: 10px; background: var(--bg-hover, #334155); color: #fff; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  loadCohortsData();
}

function loadCohortsData() {
  apiCall('getCohorts')
    .then(response => {
      const data = (response && response.data) ? response.data : response;
      const container = document.getElementById('cohort-list');
      if (!container) return;

      if (!Array.isArray(data) || !data.length) {
        container.innerHTML = `<p style="color: var(--text-muted, #94A3B8); text-align: center; padding: 16px;">No cohorts created yet.</p>`;
        return;
      }

      window.masterCohorts = data;
      let html = '';
      data.forEach(item => {
        const jsonString = JSON.stringify(item).replace(/'/g, "&apos;");
        html += `
          <div style="background: var(--bg-main, #0F172A); border: 1px solid var(--border-color, #334155); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 14px; color: #FFFFFF;">${item.name || 'Untitled Cohort'}</div>
              <div style="color: var(--text-muted, #94A3B8); font-size: 11px; margin-top: 4px;">Prog: ${item.programme || 'N/A'} | Session: ${item.session || 'N/A'} | Year: ${item.year || 'N/A'}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick='openCohortModal(${jsonString})' style="background: none; border: none; color: var(--accent, #3B82F6); cursor: pointer; padding: 4px;"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="removeCohort('${item.row}')" style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 4px;"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    })
    .catch(err => {
      console.error("getCohorts failed:", err);
      const container = document.getElementById('cohort-list');
      if (container) {
        container.innerHTML = `<p style="color: #EF4444; text-align: center; padding: 16px;">Error loading cohorts: ${err.message}</p>`;
      }
    });
}

// Modal Handlers
window.openCohortModal = function(item = null) {
  const modalTitle = document.getElementById('cohort-modal-title');
  if (modalTitle) modalTitle.innerText = item ? "Edit Cohort" : "Add Cohort";

  document.getElementById('cohort-row').value = item ? item.row : "";
  document.getElementById('cohort-name').value = item ? item.name : "";
  document.getElementById('cohort-session').value = item ? item.session : "";
  document.getElementById('cohort-year').value = item ? item.year : "";

  // Fetch available programmes dynamically
  apiCall('getProgrammesList')
    .then(response => {
      const programmes = (response && response.data) ? response.data : response;
      const select = document.getElementById('cohort-programme');
      if (!select) return;

      select.innerHTML = '<option value="">Select Programme...</option>';
      if (Array.isArray(programmes)) {
        programmes.forEach(p => {
          const progName = p.name || p;
          const selected = (item && item.programme === progName) ? 'selected' : '';
          select.innerHTML += `<option value="${progName}" ${selected}>${progName}</option>`;
        });
      }
    })
    .catch(err => {
      console.error("Failed fetching programmes for cohort modal:", err);
    });

  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('active');

  const cohortModal = document.getElementById('cohort-modal');
  if (cohortModal) cohortModal.style.display = 'block';
};

window.closeCohortModal = function() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');

  const cohortModal = document.getElementById('cohort-modal');
  if (cohortModal) cohortModal.style.display = 'none';
};

// CRUD Operations
function submitCohort() {
  const btn = document.getElementById('save-cohort-btn');
  const form = {
    row: document.getElementById('cohort-row').value,
    name: document.getElementById('cohort-name').value.trim(),
    session: document.getElementById('cohort-session').value.trim(),
    year: document.getElementById('cohort-year').value.trim(),
    programme: document.getElementById('cohort-programme').value
  };

  if (!form.name || !form.session || !form.programme) {
    return alert("Cohort Name, Session, and Programme are required.");
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Saving...";
  }

  apiCall('saveCohort', { form: form }, 'POST')
    .then(response => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Cohort";
      }

      if (response && (response.status === 'success' || response.result === 'success')) {
        closeCohortModal();
        renderCohortsView();
      } else {
        alert("Error saving cohort: " + (response.message || "Unknown error"));
      }
    })
    .catch(err => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Cohort";
      }
      alert("Error saving cohort: " + err.message);
    });
}

function removeCohort(row) {
  if (!row) return;

  if (confirm("Are you sure you want to delete this cohort?")) {
    apiCall('deleteCohort', { row: row }, 'POST')
      .then(response => {
        if (response && (response.status === 'success' || response.result === 'success')) {
          renderCohortsView();
        } else {
          alert("Error deleting cohort: " + (response.message || "Unknown error"));
        }
      })
      .catch(err => {
        alert("Error deleting cohort: " + err.message);
      });
  }
}
