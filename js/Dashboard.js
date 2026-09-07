/**
 * Dashboard Module - ABBS SIS
 * Handles KPI metrics, programme breakdowns, and recent activity fetches.
 */

window.dashboardMetricsData = window.dashboardMetricsData || null;

async function renderDashboardView() {
  const contentPanel = document.getElementById('main-content');
  if (!contentPanel) return;

  contentPanel.innerHTML = `
    <div class="module-card">
      <!-- Header Shortcuts -->
      <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 12px; margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
          <button onclick="loadModule('Students')" style="background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; padding: 10px 8px; border-radius: 6px; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
            <i class="fa-solid fa-user-plus" style="color: var(--accent);"></i>
            <span>Add Student</span>
          </button>
          <button onclick="loadModule('Enrolment')" style="background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; padding: 10px 8px; border-radius: 6px; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
            <i class="fa-solid fa-id-card" style="color: #8B5CF6;"></i>
            <span>New Enrolment</span>
          </button>
          <button onclick="loadModule('Programmes')" style="background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; padding: 10px 8px; border-radius: 6px; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;">
            <i class="fa-solid fa-diagram-project" style="color: #F59E0B;"></i>
            <span>Programmes</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(59, 130, 246, 0.15); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 18px;">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <div id="kpi-students" style="font-size: 20px; font-weight: 700; line-height: 1.2;">--</div>
            <div style="font-size: 11px; color: var(--text-muted);">Total Students</div>
          </div>
        </div>

        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(139, 92, 246, 0.15); color: #8B5CF6; display: flex; align-items: center; justify-content: center; font-size: 18px;">
            <i class="fa-solid fa-address-card"></i>
          </div>
          <div>
            <div id="kpi-enrolments" style="font-size: 20px; font-weight: 700; line-height: 1.2;">--</div>
            <div style="font-size: 11px; color: var(--text-muted);">Active Enrolments</div>
          </div>
        </div>

        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(245, 158, 11, 0.15); color: #F59E0B; display: flex; align-items: center; justify-content: center; font-size: 18px;">
            <i class="fa-solid fa-sitemap"></i>
          </div>
          <div>
            <div id="kpi-programmes" style="font-size: 20px; font-weight: 700; line-height: 1.2;">--</div>
            <div style="font-size: 11px; color: var(--text-muted);">Programmes</div>
          </div>
        </div>

        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 18px;">
            <i class="fa-solid fa-book-open"></i>
          </div>
          <div>
            <div id="kpi-courses" style="font-size: 20px; font-weight: 700; line-height: 1.2;">--</div>
            <div style="font-size: 11px; color: var(--text-muted);">Master Courses</div>
          </div>
        </div>
      </div>

      <!-- Analytics & Activity Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        
        <!-- Programme Breakdown -->
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 16px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>Enrolment by Programme</span>
            <i class="fa-solid fa-chart-pie" style="color: var(--accent);"></i>
          </div>
          <div id="programme-breakdown-list">
            <div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 16px;">Loading metrics...</div>
          </div>
        </div>

        <!-- Recent Activity Table -->
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 16px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>Recent Enrolments</span>
            <i class="fa-solid fa-clock-rotate-left" style="color: #8B5CF6;"></i>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tbody id="recent-enrolment-rows">
              <tr>
                <td style="color: var(--text-muted); text-align: center; padding: 16px;">Loading recent activities...</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  `;

  await fetchDashboardMetricsData();
}

async function fetchDashboardMetricsData() {
  const breakdown = document.getElementById('programme-breakdown-list');
  const recentContainer = document.getElementById('recent-enrolment-rows');

  try {
    // Calling GET action via apiCall helper (returns data object directly)
    const metricsData = await apiCall('getDashboardMetrics');

    if (metricsData) {
      window.dashboardMetricsData = metricsData;
      populateDashboardView(metricsData);
    } else {
      throw new Error("No data returned from backend.");
    }
  } catch (err) {
    if (breakdown) {
      breakdown.innerHTML = `<p style="color: #EF4444; font-size: 12px; text-align: center; padding: 12px;">Error loading metrics: ${err.message}</p>`;
    }
    if (recentContainer) {
      recentContainer.innerHTML = `<tr><td style="color: #EF4444; font-size: 12px; text-align: center; padding: 12px;">Failed to load activities.</td></tr>`;
    }
  }
}

function populateDashboardView(data) {
  if (!data) return;

  // Set KPI Counters
  const kpiStud = document.getElementById('kpi-students');
  const kpiEnrol = document.getElementById('kpi-enrolments');
  const kpiProg = document.getElementById('kpi-programmes');
  const kpiCour = document.getElementById('kpi-courses');

  if (kpiStud) kpiStud.innerText = data.totalStudents ?? 0;
  if (kpiEnrol) kpiEnrol.innerText = data.totalEnrolments ?? 0;
  if (kpiProg) kpiProg.innerText = `${data.activeProgrammes ?? 0}/${data.totalProgrammes ?? 0}`;
  if (kpiCour) kpiCour.innerText = data.totalCourses ?? 0;

  // Render Programme Breakdown
  const progContainer = document.getElementById('programme-breakdown-list');
  if (progContainer) {
    if (!data.programmeBreakdown || data.programmeBreakdown.length === 0) {
      progContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 12px;">No active enrolments recorded.</div>';
    } else {
      let progHtml = '';
      const maxEnrolments = Math.max(...data.programmeBreakdown.map(p => p.count), 1);

      data.programmeBreakdown.forEach(p => {
        const pct = Math.round((p.count / maxEnrolments) * 100);
        progHtml += `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>${p.name}</span>
              <span style="font-weight: 600; color: var(--accent);">${p.count} Enrolled</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; background: var(--accent); width: ${pct}%; border-radius: 3px;"></div>
            </div>
          </div>
        `;
      });
      progContainer.innerHTML = progHtml;
    }
  }

  // Render Recent Enrolments Table
  const recentContainer = document.getElementById('recent-enrolment-rows');
  if (recentContainer) {
    if (!data.recentEnrolments || data.recentEnrolments.length === 0) {
      recentContainer.innerHTML = '<tr><td style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 12px;">No recent enrolments found.</td></tr>';
    } else {
      let recentHtml = '';
      data.recentEnrolments.forEach(item => {
        recentHtml += `
          <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.4);">
            <td style="padding: 8px 0;">
              <div style="font-weight: 600; font-size: 13px;">${item.studentName}</div>
              <div style="color: var(--text-muted); font-size: 11px;">${item.programme} &bull; ${item.cohort}</div>
            </td>
            <td style="text-align: right; color: var(--text-muted); font-size: 11px; padding: 8px 0;">
              ${item.date}
            </td>
          </tr>
        `;
      });
      recentContainer.innerHTML = recentHtml;
    }
  }
}
