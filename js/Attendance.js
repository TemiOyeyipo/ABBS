(function () {
  // 1. Inject HTML5 QR Code Library
  if (!document.getElementById("html5-qrcode-script")) {
    const script = document.createElement("script");
    script.id = "html5-qrcode-script";
    script.src = "https://unpkg.com/html5-qrcode";
    script.type = "text/javascript";
    document.head.appendChild(script);
  }

  // 2. Inject CSS Styles
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --bg-main: #0F172A;
      --bg-card: #1E293B;
      --bg-hover: #334155;
      --border-color: #334155;
      --accent: #3B82F6;
      --accent-hover: #2563EB;
      --text-muted: #94A3B8;
      --danger: #EF4444;
      --success: #10B981;
      --radius: 8px;
    }

    .att-card-container {
      background: var(--bg-card, #1E293B);
      border: 1px solid var(--border-color, #334155);
      border-radius: var(--radius, 8px);
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    .att-tab-bar {
      display: flex;
      gap: 10px;
      border-bottom: 1px solid var(--border-color, #334155);
      padding-bottom: 14px;
      margin-bottom: 16px;
    }

    .att-tab-btn {
      flex: 1;
      padding: 10px 16px;
      background: var(--bg-main, #0F172A);
      color: var(--text-muted, #94A3B8);
      border: 1px solid var(--border-color, #334155);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .att-tab-btn.active {
      background: var(--accent, #3B82F6);
      color: #FFFFFF;
      border-color: var(--accent, #3B82F6);
    }

    .att-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 10px;
    }

    .att-header-bar h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #FFFFFF;
    }

    .btn-accent-att {
      padding: 10px 16px;
      background: var(--accent, #3B82F6);
      color: #FFFFFF;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      width: 100%;
      margin-top: 14px;
      transition: background 0.2s ease;
    }

    .btn-accent-att:hover { background: var(--accent-hover, #2563EB); }
    .btn-accent-att:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-sec-att {
      padding: 8px 14px;
      background: var(--bg-hover, #334155);
      color: #FFFFFF;
      border: 1px solid var(--border-color, #334155);
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-approve-att { background: var(--success, #10B981); color: #FFFFFF; display: none; }
    .btn-approve-att:hover { background: #059669; }

    .form-group-att {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }

    .form-group-att label { font-size: 12px; color: var(--text-muted, #94A3B8); font-weight: 500; }

    .ctrl-att {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-main, #0F172A);
      border: 1px solid var(--border-color, #334155);
      color: #FFFFFF;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }

    .ctrl-att:focus { border-color: var(--accent, #3B82F6); }

    #reader {
      width: 100%;
      border-radius: 6px;
      overflow: hidden;
      background: #000000;
      margin-top: 10px;
    }

    .student-card-box {
      background: var(--bg-main, #0F172A);
      border: 1px solid var(--border-color, #334155);
      border-radius: 6px;
      padding: 20px;
      text-align: center;
      margin-top: 16px;
    }

    .student-photo-img {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--accent, #3B82F6);
      margin: 0 auto 12px auto;
      display: block;
      background: var(--bg-card, #1E293B);
    }

    .student-name-txt { font-size: 20px; font-weight: 700; color: #FFFFFF; }
    .student-id-txt { font-size: 13px; color: var(--accent, #3B82F6); font-weight: 600; margin-top: 2px; }

    .status-badge-box {
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    .status-idle { background: var(--bg-main, #0F172A); color: var(--text-muted, #94A3B8); border: 1px dashed var(--border-color, #334155); }
    .status-success { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid #10B981; }
    .status-error { background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid #EF4444; }

    .counter-box-att {
      background: var(--bg-main, #0F172A);
      border: 1px solid var(--border-color, #334155);
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin-top: 16px;
    }

    .counter-num-txt { font-size: 36px; font-weight: 800; color: var(--success, #10B981); margin-top: 4px; }
  `;
  document.head.appendChild(style);

  // 3. Define Application Logic
  window.html5QrcodeScanner = window.html5QrcodeScanner || null;
  window.currentStudentAttendance = window.currentStudentAttendance || null;

  window.renderAttendanceView = function () {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="att-card-container">
        <!-- MODE SWITCH TABS -->
        <div class="att-tab-bar">
          <button id="att-tab-qr-btn" class="att-tab-btn active" onclick="switchAttendanceMode('qr')">
            <i class="fa-solid fa-qrcode"></i> QR Scan Mode
          </button>
          <button id="att-tab-manual-btn" class="att-tab-btn" onclick="switchAttendanceMode('manual')">
            <i class="fa-solid fa-pen-to-square"></i> Manual Input Mode
          </button>
        </div>

        <!-- TAB 1: QR SCANNER SECTION -->
        <div id="att-qr-view">
          <div id="att-setup-section">
            <div class="att-header-bar">
              <h3><i class="fa-solid fa-qrcode" style="color: var(--accent, #3B82F6);"></i> Attendance Portal Setup</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group-att">
                <label>Programme</label>
                <select id="att-programme" class="ctrl-att" onchange="loadAttendanceCourses('qr')">
                  <option value="">Select Programme...</option>
                </select>
              </div>
              <div class="form-group-att">
                <label>Semester</label>
                <select id="att-semester" class="ctrl-att">
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>
            </div>
            <div class="form-group-att">
              <label>Course</label>
              <select id="att-course" class="ctrl-att">
                <option value="">Select Programme First...</option>
              </select>
            </div>
            <div class="form-group-att">
              <label>Lesson / Topic</label>
              <input type="text" id="att-lesson" class="ctrl-att" placeholder="e.g. Lesson 5 - Database Normalization">
            </div>
            <button id="att-start-btn" class="btn-accent-att" onclick="startAttendanceSession()">
              <i class="fa-solid fa-play"></i> START ATTENDANCE SESSION
            </button>
          </div>

          <div id="att-active-header" class="att-header-bar" style="display: none; background: var(--bg-main, #0F172A); padding: 12px; border-radius: 6px; border-left: 4px solid var(--accent, #3B82F6);">
            <div>
              <h4 id="att-session-title" style="margin: 0; color: #FFF; font-size: 15px;">Course Name</h4>
              <div id="att-session-sub" style="font-size: 12px; color: var(--text-muted, #94A3B8); margin-top: 2px;">Programme • Semester • Lesson</div>
            </div>
            <button class="btn-sec-att" onclick="endAttendanceSession()">
              <i class="fa-solid fa-stop"></i> End Session
            </button>
          </div>

          <div id="att-scanning-section" style="display: none; flex-direction: column; gap: 16px; margin-top: 16px;">
            <div>
              <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #FFF;">Camera Viewfinder</h4>
              <div id="reader"></div>
            </div>
            <div class="student-card-box">
              <img id="att-photo" class="student-photo-img" src="https://via.placeholder.com/130" alt="Student Photo">
              <div id="att-student-name" class="student-name-txt">Waiting for Scan...</div>
              <div id="att-student-id" class="student-id-txt">-</div>
              <div id="att-status-card" class="status-badge-box status-idle">Ready to scan student ID QR code</div>
              <button id="att-approve-btn" class="btn-accent-att btn-approve-att" onclick="approveAttendanceRecord()">
                <i class="fa-solid fa-check-circle"></i> APPROVE ATTENDANCE
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: MANUAL INPUT -->
        <div id="att-manual-view" style="display: none;">
          <div class="att-header-bar">
            <h3><i class="fa-solid fa-pen-to-square" style="color: var(--accent, #3B82F6);"></i> Manual Attendance Input</h3>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group-att">
              <label>Programme</label>
              <select id="att-manual-programme" class="ctrl-att" onchange="onManualProgrammeChange()">
                <option value="">Select Programme...</option>
              </select>
            </div>
            <div class="form-group-att">
              <label>Semester</label>
              <select id="att-manual-semester" class="ctrl-att">
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group-att">
              <label>Course</label>
              <select id="att-manual-course" class="ctrl-att">
                <option value="">Select Programme First...</option>
              </select>
            </div>
            <div class="form-group-att">
              <label>Cohort / Academic Session</label>
              <select id="att-manual-cohort" class="ctrl-att" onchange="loadStudentsForManualMarking()">
                <option value="">Loading Cohorts...</option>
              </select>
            </div>
          </div>
          <div class="form-group-att">
            <label>Lesson / Topic Title</label>
            <input type="text" id="att-manual-topic" class="ctrl-att" placeholder="e.g. Lesson 4 - System Architecture">
          </div>
          <div class="form-group-att">
            <label>Select Student</label>
            <select id="att-manual-student" class="ctrl-att">
              <option value="">Select Programme & Cohort First...</option>
            </select>
          </div>
          <div class="form-group-att">
            <label>Attendance Status</label>
            <select id="att-manual-status" class="ctrl-att">
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <button id="att-manual-submit-btn" class="btn-accent-att" onclick="submitManualAttendance()">
            <i class="fa-solid fa-check"></i> SAVE MANUAL RECORD
          </button>
          <div id="att-manual-status-card" class="status-badge-box status-idle" style="display: none; margin-top: 14px;"></div>
        </div>

        <!-- COUNTER -->
        <div class="counter-box-att">
          <span style="font-size: 11px; color: var(--text-muted, #94A3B8); font-weight: 700; letter-spacing: 0.5px;">TODAY'S TOTAL RECORDED ATTENDANCE</span>
          <div id="att-today-count" class="counter-num-txt">0</div>
        </div>
      </div>

      <!-- AUDIO FEEDBACK -->
      <audio id="attSuccessSound" src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"></audio>
      <audio id="attErrorSound" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"></audio>
    `;

    loadAttendanceProgrammes();
    loadAttendanceCohorts();
    loadTodayAttendanceCount();
  };

  window.switchAttendanceMode = function (mode) {
    const qrView = document.getElementById("att-qr-view");
    const manualView = document.getElementById("att-manual-view");
    const qrBtn = document.getElementById("att-tab-qr-btn");
    const manualBtn = document.getElementById("att-tab-manual-btn");

    if (!qrView || !manualView) return;

    if (mode === "qr") {
      qrView.style.display = "block";
      manualView.style.display = "none";
      if (qrBtn) qrBtn.classList.add("active");
      if (manualBtn) manualBtn.classList.remove("active");
    } else {
      qrView.style.display = "none";
      manualView.style.display = "block";
      if (manualBtn) manualBtn.classList.add("active");
      if (qrBtn) qrBtn.classList.remove("active");

      if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear().catch((err) => console.error(err));
        window.html5QrcodeScanner = null;
      }
    }
  };

  window.playAttSuccessSound = function () {
    const sound = document.getElementById("attSuccessSound");
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  };

  window.playAttErrorSound = function () {
    const sound = document.getElementById("attErrorSound");
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  };

  window.loadAttendanceProgrammes = function () {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((data) => {
          const qrSelect = document.getElementById("att-programme");
          const manualSelect = document.getElementById("att-manual-programme");

          let optionsHtml = '<option value="">Select Programme...</option>';
          (data || []).forEach((item) => {
            const val = item.name || item;
            optionsHtml += `<option value="${val}">${val}</option>`;
          });

          if (qrSelect) qrSelect.innerHTML = optionsHtml;
          if (manualSelect) manualSelect.innerHTML = optionsHtml;
        })
        .withFailureHandler((err) => console.error("Error loading programmes:", err))
        .getProgrammesList();
    }
  };

  window.loadAttendanceCohorts = function () {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((cohorts) => {
          const cohortSelect = document.getElementById("att-manual-cohort");
          if (!cohortSelect) return;

          let optionsHtml = '<option value="">Select Cohort...</option>';
          (cohorts || []).forEach((coh) => {
            optionsHtml += `<option value="${coh}">${coh}</option>`;
          });

          cohortSelect.innerHTML = optionsHtml;
        })
        .withFailureHandler((err) => console.error("Error loading cohorts:", err))
        .getCohortsList();
    }
  };

  window.onManualProgrammeChange = function () {
    const progEl = document.getElementById("att-manual-programme");
    const studentSelect = document.getElementById("att-manual-student");

    loadAttendanceCourses("manual");

    if (!progEl || !progEl.value) {
      if (studentSelect) {
        studentSelect.innerHTML = '<option value="">Select Programme First...</option>';
      }
      return;
    }

    loadStudentsForManualMarking();
  };

  window.loadAttendanceCourses = function (mode = "qr") {
    const isManual = mode === "manual";
    const progSelect = document.getElementById(isManual ? "att-manual-programme" : "att-programme");
    const courseSelect = document.getElementById(isManual ? "att-manual-course" : "att-course");

    if (!progSelect || !courseSelect) return;
    const programme = progSelect.value;

    courseSelect.innerHTML = '<option value="">Select Course...</option>';
    if (!programme) return;

    if (typeof google !== "undefined" && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((courses) => {
          (courses || []).forEach((c) => {
            const courseName = c.courseName || c;
            const opt = document.createElement("option");
            opt.value = courseName;
            opt.text = courseName;
            courseSelect.appendChild(opt);
          });
        })
        .withFailureHandler((err) => console.error("Error loading courses:", err))
        .getCoursesByProgramme(programme);
    }
  };

  window.loadStudentsForManualMarking = function () {
    const progEl = document.getElementById("att-manual-programme");
    const cohortEl = document.getElementById("att-manual-cohort");
    const studentSelect = document.getElementById("att-manual-student");

    if (!studentSelect || !progEl || !cohortEl) return;
    const programme = progEl.value;
    const cohort = cohortEl.value;

    if (!programme) {
      studentSelect.innerHTML = '<option value="">Select Programme First...</option>';
      return;
    }

    if (!cohort) {
      studentSelect.innerHTML = '<option value="">Select Cohort First...</option>';
      return;
    }

    studentSelect.innerHTML = '<option value="">Loading students...</option>';

    if (typeof google !== "undefined" && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((students) => {
          if (!students || students.length === 0) {
            studentSelect.innerHTML = '<option value="">No eligible students found in Enrolments</option>';
            return;
          }

          let html = '<option value="">Select Student...</option>';
          students.forEach((s) => {
            const cleanName = (s.studentName || "").replace(/'/g, "&apos;");
            const payload = JSON.stringify({
              studentID: s.studentID,
              studentName: cleanName,
              photoUrl: s.photoUrl || "",
            }).replace(/'/g, "&apos;");

            html += `<option value='${payload}'>${s.studentID} - ${cleanName}</option>`;
          });

          studentSelect.innerHTML = html;
        })
        .withFailureHandler((err) => {
          studentSelect.innerHTML = '<option value="">Error loading students</option>';
          console.error("Fetch error:", err);
        })
        .getStudentsByProgrammeAndCohort(programme, cohort);
    }
  };

  window.loadTodayAttendanceCount = function () {
    if (typeof google !== "undefined" && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((count) => {
          const counterEl = document.getElementById("att-today-count");
          if (counterEl) counterEl.innerText = count || 0;
        })
        .getTodayAttendanceCount();
    }
  };

  window.startAttendanceSession = function () {
    const prog = document.getElementById("att-programme").value;
    const sem = document.getElementById("att-semester").value;
    const course = document.getElementById("att-course").value;
    const lesson = document.getElementById("att-lesson").value.trim();

    if (!prog || !course || !lesson) {
      alert("Please complete Programme, Course, and Lesson details.");
      return;
    }

    document.getElementById("att-session-title").innerText = course;
    document.getElementById("att-session-sub").innerText = `${prog} • ${sem} • ${lesson}`;
    document.getElementById("att-setup-section").style.display = "none";
    document.getElementById("att-active-header").style.display = "flex";
    document.getElementById("att-scanning-section").style.display = "flex";

    startScannerEngine();
  };

  window.endAttendanceSession = function () {
    if (confirm("Are you sure you want to end this attendance session?")) {
      if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear().catch((err) => console.error("Scanner clear error:", err));
        window.html5QrcodeScanner = null;
      }

      document.getElementById("att-setup-section").style.display = "block";
      document.getElementById("att-active-header").style.display = "none";
      document.getElementById("att-scanning-section").style.display = "none";
      resetScannedStudentCard();
    }
  };

  window.startScannerEngine = function () {
    if (typeof Html5QrcodeScanner !== "undefined") {
      window.html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 220, height: 220 } },
        false
      );
      window.html5QrcodeScanner.render(onAttendanceScanSuccess, onAttendanceScanFailure);
    }
  };

  window.onAttendanceScanSuccess = function (decodedText) {
    try {
      const data = JSON.parse(decodedText);

      if (data.status && data.status.toLowerCase() === "completed") {
        const card = document.getElementById("att-status-card");
        card.className = "status-badge-box status-error";
        card.innerText = "Access Denied: Student has Completed Programme";

        document.getElementById("att-approve-btn").style.display = "none";
        playAttErrorSound();
        return;
      }

      window.currentStudentAttendance = data;

      document.getElementById("att-student-name").innerText =
        data.fullName || data.studentName || "Student Identified";
      document.getElementById("att-student-id").innerText = data.studentID || data.studentId || "-";
      if (data.photoUrl || data.pictureUrl) {
        document.getElementById("att-photo").src = data.photoUrl || data.pictureUrl;
      }

      const card = document.getElementById("att-status-card");
      card.className = "status-badge-box status-success";
      card.innerText = "Verified! Click Approve to record.";

      document.getElementById("att-approve-btn").style.display = "inline-flex";
      playAttSuccessSound();
    } catch (e) {
      const card = document.getElementById("att-status-card");
      card.className = "status-badge-box status-error";
      card.innerText = "Invalid QR code payload format.";
      playAttErrorSound();
    }
  };

  window.onAttendanceScanFailure = function (error) {
    // Passive scanner check
  };

  window.resetScannedStudentCard = function () {
    window.currentStudentAttendance = null;
    document.getElementById("att-student-name").innerText = "Waiting for Scan...";
    document.getElementById("att-student-id").innerText = "-";
    document.getElementById("att-photo").src = "https://via.placeholder.com/130";

    const card = document.getElementById("att-status-card");
    card.className = "status-badge-box status-idle";
    card.innerText = "Ready to scan student ID QR code";
    document.getElementById("att-approve-btn").style.display = "none";
  };

  window.approveAttendanceRecord = function () {
    if (!window.currentStudentAttendance) return;

    const btn = document.getElementById("att-approve-btn");
    btn.disabled = true;
    btn.innerText = "SAVING...";

    const payload = {
      programme: document.getElementById("att-programme").value,
      semester: document.getElementById("att-semester").value,
      course: document.getElementById("att-course").value,
      lesson: document.getElementById("att-lesson").value,
      studentId: window.currentStudentAttendance.studentID || window.currentStudentAttendance.studentId,
      studentName: window.currentStudentAttendance.fullName || window.currentStudentAttendance.studentName,
      pictureUrl: window.currentStudentAttendance.photoUrl || window.currentStudentAttendance.pictureUrl || "",
      status: "Present",
    };

    google.script.run
      .withSuccessHandler((res) => {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check-circle"></i> APPROVE ATTENDANCE`;

        if (res && res.isDuplicate) {
          const card = document.getElementById("att-status-card");
          card.className = "status-badge-box status-error";
          card.innerText = res.message;
          playAttErrorSound();
        } else {
          btn.style.display = "none";
          resetScannedStudentCard();
          loadTodayAttendanceCount();
        }
      })
      .withFailureHandler((err) => {
        btn.disabled = false;
        alert("Failed to save: " + err.message);
      })
      .recordAttendanceEntry(payload);
  };

  window.submitManualAttendance = function () {
    const studentRaw = document.getElementById("att-manual-student").value;
    const course = document.getElementById("att-manual-course").value;
    const lesson = document.getElementById("att-manual-topic").value;

    if (!studentRaw || !course || !lesson) {
      alert("Please select a student and enter course and lesson details.");
      return;
    }

    const studentObj = JSON.parse(studentRaw);
    const btn = document.getElementById("att-manual-submit-btn");
    btn.disabled = true;

    const payload = {
      programme: document.getElementById("att-manual-programme").value,
      semester: document.getElementById("att-manual-semester").value,
      course: course,
      lesson: lesson,
      studentId: studentObj.studentID,
      studentName: studentObj.studentName,
      pictureUrl: studentObj.photoUrl || "",
      status: document.getElementById("att-manual-status").value,
    };

    google.script.run
      .withSuccessHandler((res) => {
        btn.disabled = false;
        const statusCard = document.getElementById("att-manual-status-card");
        statusCard.style.display = "block";

        if (res && res.isDuplicate) {
          statusCard.className = "status-badge-box status-error";
          statusCard.innerText = res.message;
          playAttErrorSound();
        } else {
          statusCard.className = "status-badge-box status-success";
          statusCard.innerText = `Record saved for ${studentObj.studentName}`;
          loadTodayAttendanceCount();
          setTimeout(() => {
            statusCard.style.display = "none";
          }, 3000);
        }
      })
      .withFailureHandler((err) => {
        btn.disabled = false;
        alert("Save failed: " + err.message);
      })
      .recordAttendanceEntry(payload);
  };
})();
