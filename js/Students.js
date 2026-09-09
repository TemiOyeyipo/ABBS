/**
 * Students Module - ABBS SIS
 * Handles student listing, filtering, modal registration, image compression, and CRUD operations over API.
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwDfcAR9PDzdiJPhTXUvYWljY_GALosTYcvzypVUB6ydUrtVQczxyikxwdOqPp0Qrs5/exec'; // Replace with your Web App URL

let allStudentsData = [];

/**
 * Universal API Interface Engine
 * Uses text/plain for POST requests to avoid CORS preflight (OPTIONS) triggers in browsers.
 */
function apiCall(action, payload = {}, method = 'GET') {
  if (method === 'GET') {
    const queryParams = new URLSearchParams({ action, ...payload }).toString();
    return fetch(`${SCRIPT_URL}?${queryParams}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      });
  } 

  if (method === 'POST') {
    return fetch(`${SCRIPT_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    });
  }
}

function renderStudentsView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  contentPanel.innerHTML = `
    <div class="module-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; flex-wrap: wrap;">
        <h3>Student Profiles</h3>
        <button onclick="openStudentModal()" style="padding: 8px 12px; background: var(--accent); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <i class="fa-solid fa-user-plus"></i> Register Student
        </button>
      </div>

      <div style="margin-bottom: 14px;">
        <input type="text" id="student-search-input" onkeyup="filterStudents()" placeholder="Search by Student ID, Name, or Phone..." style="width: 100%; padding: 10px 12px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; font-size: 13px;">
      </div>

      <div id="student-list" style="display: flex; flex-direction: column; gap: 10px;">
        <p style="color: var(--text-muted); text-align: center; padding: 16px;">Loading student profiles...</p>
      </div>
    </div>

    <!-- Student Registration / Edit Modal -->
    <div id="student-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 420px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 20px; z-index: 300; max-height: 90vh; overflow-y: auto;">
      <h3 id="student-modal-title" style="margin-bottom: 14px;">Register Student</h3>
      <input type="hidden" id="student-row">
      <input type="hidden" id="student-existing-passport">
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <input type="text" id="student-id" placeholder="Student ID (Auto-generated if blank)" style="padding: 10px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
        <input type="text" id="student-name" placeholder="Full Name" style="padding: 10px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px;" required>
        
        <div style="display: flex; gap: 10px;">
          <select id="student-gender" style="flex: 1; padding: 10px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px;" required>
            <option value="">Gender...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select id="student-status" style="flex: 1; padding: 10px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <input type="email" id="student-email" placeholder="Email Address" style="padding: 10px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
        <input type="tel" id="student-phone" placeholder="Phone Number" style="padding: 10px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px;">
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; color: var(--text-muted);">Passport Photo</label>
          <input type="file" id="student-photo-file" accept="image/*" style="padding: 8px; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; font-size: 12px;">
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="save-btn" onclick="submitStudent()" style="flex: 1; padding: 10px; background: var(--accent); color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Save Student</button>
          <button onclick="closeStudentModal()" style="flex: 1; padding: 10px; background: var(--bg-hover); color: #fff; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Fetch students via API Interface Engine
  apiCall('getStudents')
    .then(response => {
      const data = (response && response.data) ? response.data : response;
      if (Array.isArray(data)) {
        allStudentsData = data;
        displayStudentCards(allStudentsData);
      } else {
        throw new Error(response.message || "Failed to parse students list.");
      }
    })
    .catch(err => {
      const listContainer = document.getElementById('student-list');
      if (listContainer) {
        listContainer.innerHTML = `<p style="color: #EF4444; text-align: center;">Error loading profiles: ${err.message}</p>`;
      }
    });
}

function displayStudentCards(data) {
  const container = document.getElementById('student-list');
  if (!container) return;

  if (!data || !data.length) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center;">No student profiles registered.</p>`;
    return;
  }

  let html = '';
  data.forEach(item => {
    // Direct Base64 rendering with fallback placeholder
    const passportUrl = (item.passport && item.passport.trim() !== '') ? item.passport : 'https://via.placeholder.com/150';
    const jsonString = JSON.stringify(item).replace(/'/g, "&apos;");

    html += `
      <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${passportUrl}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent);" onError="this.src='https://via.placeholder.com/150'">
          <div>
            <div style="font-weight: 600; font-size: 14px;">${item.name} <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: var(--bg-hover); color: var(--accent); margin-left: 4px;">${item.status || 'Active'}</span></div>
            <div style="color: var(--accent); font-weight: 600; font-size: 12px; margin-top: 2px;">ID: ${item.id}</div>
            <div style="color: var(--text-muted); font-size: 11px;">Email: ${item.email || 'N/A'} | Phone: ${item.phone || 'N/A'}</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick='openStudentModal(${jsonString})' style="background: none; border: none; color: var(--accent); cursor: pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
          <button onclick="removeStudent('${item.row}')" style="background: none; border: none; color: #EF4444; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function filterStudents() {
  const query = document.getElementById('student-search-input').value.toLowerCase().trim();
  const filtered = allStudentsData.filter(item => 
    (item.id && item.id.toLowerCase().includes(query)) ||
    (item.name && item.name.toLowerCase().includes(query)) ||
    (item.phone && item.phone.toLowerCase().includes(query))
  );
  displayStudentCards(filtered);
}

function openStudentModal(item = null) {
  document.getElementById('student-modal-title').innerText = item ? "Edit Student Profile" : "Register Student";
  document.getElementById('student-row').value = item ? item.row : "";
  document.getElementById('student-id').value = item ? item.id : "";
  document.getElementById('student-name').value = item ? item.name : "";
  document.getElementById('student-gender').value = item ? item.gender : "";
  document.getElementById('student-status').value = item ? item.status : "Active";
  document.getElementById('student-email').value = item ? item.email : "";
  document.getElementById('student-phone').value = item ? item.phone : "";
  document.getElementById('student-existing-passport').value = item ? item.passport : "";
  document.getElementById('student-photo-file').value = "";

  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('active');
  document.getElementById('student-modal').style.display = 'block';
}

function closeStudentModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');
  document.getElementById('student-modal').style.display = 'none';
}

/**
 * Compresses uploaded image and yields a clean data:image/jpeg;base64,... URI.
 * Resizes down to max 150x150 at 0.6 quality to stay safe under cell limits.
 */
function compressAndConvertImage(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (event) {
    const img = new Image();
    img.src = event.target.result;
    img.onload = function () {
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) { 
          height = Math.round((height * maxWidth) / width); 
          width = maxWidth; 
        }
      } else {
        if (height > maxHeight) { 
          width = Math.round((width * maxHeight) / height); 
          height = maxHeight; 
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width; 
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Output high-compression JPEG Base64 URI directly
      callback(canvas.toDataURL('image/jpeg', 0.6));
    };
  };
}

function submitStudent() {
  const saveBtn = document.getElementById('save-btn');
  const fileInput = document.getElementById('student-photo-file');
  
  const form = {
    row: document.getElementById('student-row').value,
    id: document.getElementById('student-id').value,
    name: document.getElementById('student-name').value,
    gender: document.getElementById('student-gender').value,
    status: document.getElementById('student-status').value,
    email: document.getElementById('student-email').value,
    phone: document.getElementById('student-phone').value,
    existingPassport: document.getElementById('student-existing-passport').value,
    passportDataUri: null
  };

  if (!form.name) return alert("Full Name is required.");

  saveBtn.disabled = true;
  saveBtn.innerText = "Saving Profile...";

  if (fileInput && fileInput.files.length > 0) {
    // Compress and format into standard base64 URI
    compressAndConvertImage(fileInput.files[0], 150, 150, function (base64Uri) {
      form.passportDataUri = base64Uri;
      executeSave(form, saveBtn);
    });
  } else {
    executeSave(form, saveBtn);
  }
}

function executeSave(form, saveBtn) {
  apiCall('saveStudent', { form: form }, 'POST')
    .then(response => {
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Student";
      
      if (response && (response.status === 'success' || response.result === 'success')) {
        closeStudentModal();
        renderStudentsView();
      } else {
        alert("Error saving profile: " + (response.message || "Unknown error"));
      }
    })
    .catch(err => {
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Student";
      alert("Error saving profile: " + err.message);
    });
}

function removeStudent(row) {
  if (confirm("Are you sure you want to delete this student profile?")) {
    apiCall('deleteStudent', { row: row }, 'POST')
      .then(response => {
        if (response && (response.status === 'success' || response.result === 'success')) {
          renderStudentsView();
        } else {
          alert("Error deleting student: " + (response.message || "Unknown error"));
        }
      })
      .catch(err => alert("Error deleting student: " + err.message));
  }
}
