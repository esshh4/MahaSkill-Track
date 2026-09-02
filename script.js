// =====================================================
// MAHASKILLTRACK - MAIN APPLICATION
// =====================================================

// Application State
const app = {
    currentUser: null,
    currentPage: 'landing',
    filters: {},
    
    // Initialize application
    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.showPage('landing');
    },
    
    // Setup event listeners
    setupEventListeners() {
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
        
        document.getElementById('mobileSidebarClose')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('active');
        });
        
        document.getElementById('btnLogout')?.addEventListener('click', () => {
            this.logout();
        });
        
        document.getElementById('traineesSearch')?.addEventListener('input', (e) => {
            this.showTraineesPage();
        });
        
        document.getElementById('outcomesSearch')?.addEventListener('input', (e) => {
            this.showOutcomesPage();
        });
    },
    
    // Navigation
    navigate(page) {
        this.showPage(page);
    },
    
    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Close sidebar on mobile
        document.getElementById('sidebar')?.classList.remove('active');
        
        // Show selected page
        const pageEl = document.getElementById(`page-${pageName}`);
        if (pageEl) {
            pageEl.classList.add('active');
            this.currentPage = pageName;
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Call page-specific renderer
        switch(pageName) {
            case 'dashboard':
                this.showDashboardPage();
                break;
            case 'trainees':
                this.showTraineesPage();
                break;
            case 'trainee-detail':
                this.showTraineeDetailPage();
                break;
            case 'programs':
                this.showProgramsPage();
                break;
            case 'providers':
                this.showProvidersPage();
                break;
            case 'employers':
                this.showEmployersPage();
                break;
            case 'reports':
                this.showReportsPage();
                break;
            case 'followups':
                this.showFollowupsPage();
                break;
            case 'outcomes':
                this.showOutcomesPage();
                break;
            case 'analytics':
                this.showAnalyticsPage();
                break;
            case 'skillgaps':
                this.showSkillGapsPage();
                break;
            case 'settings':
                this.showSettingsPage();
                break;
            case 'consent':
                this.showConsentPage();
                break;
        }
        
        // Scroll to top
        document.querySelector('.content-wrapper').scrollTop = 0;
    },
    
    // Authentication
    checkAuth() {
        const user = localStorage.getItem('mahaskill_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateUI();
        }
    },
    
    handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        
        const user = data.DEMO_USERS.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('mahaskill_user', JSON.stringify(user));
            this.updateUI();
            this.navigate('dashboard');
        } else {
            alert('Invalid email or password');
        }
    },
    
    quickLogin(email, password) {
        document.getElementById('emailInput').value = email;
        document.getElementById('passwordInput').value = password;
        this.handleLogin(new Event('submit'));
    },
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('mahaskill_user');
        this.updateUI();
        this.navigate('landing');
    },
    
    updateUI() {
        if (this.currentUser) {
            // Show authenticated UI
            this.renderNavigation();
            document.getElementById('userInfo').innerHTML = `
                <strong>${this.currentUser.name}</strong>
                <div style="font-size: 12px; color: var(--color-text-lighter);">${this.capitalizeRole(this.currentUser.role)}</div>
            `;
            document.getElementById('btnLogout').style.display = 'block';
        } else {
            // Show public UI
            document.getElementById('navMenu').innerHTML = '';
            document.getElementById('userInfo').innerHTML = '';
            document.getElementById('btnLogout').style.display = 'none';
        }
    },
    
    renderNavigation() {
        const navMenu = document.getElementById('navMenu');
        const role = this.currentUser.role;
        
        const items = [
            { label: 'Dashboard', page: 'dashboard', roles: ['admin', 'provider', 'employer'] },
            { label: 'Trainees', page: 'trainees', roles: ['admin', 'provider'] },
            { label: 'Programs', page: 'programs', roles: ['admin', 'provider'] },
            { label: 'Providers', page: 'providers', roles: ['admin'] },
            { label: 'Employers', page: 'employers', roles: ['admin', 'provider'] },
            { label: 'Reports', page: 'reports', roles: ['admin', 'provider'] },
            { label: 'Follow-ups', page: 'followups', roles: ['admin', 'provider'] },
            { label: 'Outcomes', page: 'outcomes', roles: ['admin', 'provider'] },
            { label: 'Analytics', page: 'analytics', roles: ['admin'] },
            { label: 'Skill Gaps', page: 'skillgaps', roles: ['admin'] },
            { label: 'Consent', page: 'consent', roles: ['admin'] },
            { label: 'Settings', page: 'settings', roles: ['admin', 'provider', 'employer', 'trainee'] },
        ];
        
        navMenu.innerHTML = items
            .filter(item => item.roles.includes(role))
            .map(item => `
                <a class="nav-item" onclick="app.navigate('${item.page}')">${item.label}</a>
            `)
            .join('');
    },
    
    capitalizeRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    },
    
    // PAGE RENDERERS
    showDashboardPage() {
        if (!this.currentUser) {
            this.navigate('login');
            return;
        }
        
        const trainees = this.getScopedTrainees();
        const stats = this.calculateStats(trainees);
        
        // Update header
        document.getElementById('dashboardTitle').textContent = `Welcome, ${this.currentUser.name.split(' ')[0]}`;
        document.getElementById('dashboardSubtitle').textContent = `${this.capitalizeRole(this.currentUser.role)} • ${trainees.length} trainee records in view`;
        
        // Render stats
        const statsHtml = `
            <div class="stat-card success">
                <div class="stat-label">Trainees in Training</div>
                <div class="stat-value">${stats.inTraining}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-label">Training Completed</div>
                <div class="stat-value">${stats.completed}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-label">Employed</div>
                <div class="stat-value">${stats.employed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Placement Rate</div>
                <div class="stat-value">${stats.placementRate}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Salary</div>
                <div class="stat-value">₹${stats.avgSalary.toLocaleString()}</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-label">Follow-ups Due</div>
                <div class="stat-value">${stats.followupsDue}</div>
            </div>
        `;
        document.getElementById('statsContainer').innerHTML = statsHtml;
        
        // Render notifications
        const notificationsHtml = `
            <h3>Notifications</h3>
            ${data.NOTIFICATIONS.map(n => `
                <div class="notification-item ${n.tone === 'warning' ? 'warning' : n.tone === 'danger' ? 'danger' : ''}">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-detail">${n.detail}</div>
                    <div class="notification-time">${n.time}</div>
                </div>
            `).join('')}
        `;
        document.getElementById('notificationsContainer').innerHTML = notificationsHtml;
        
        // Clear other sections if not needed
        document.getElementById('filterBar').innerHTML = '';
        document.getElementById('chartsContainer').innerHTML = '';
    },
    
    showTraineesPage() {
        if (!this.currentUser) {
            this.navigate('login');
            return;
        }
        
        const trainees = this.getScopedTrainees();
        const searchTerm = document.getElementById('traineesSearch')?.value.toLowerCase() || '';
        
        let filtered = trainees;
        if (searchTerm) {
            filtered = trainees.filter(t => 
                t.name.toLowerCase().includes(searchTerm) ||
                t.id.toLowerCase().includes(searchTerm) ||
                t.district.toLowerCase().includes(searchTerm)
            );
        }
        
        // Update subtitle
        document.getElementById('traineesSubtitle').textContent = `${filtered.length} trainee records match your search`;
        
        // Render table
        const tableHtml = filtered.map(trainee => `
            <tr onclick="app.viewTraineeDetail('${trainee.id}')">
                <td><strong>${trainee.name}</strong></td>
                <td>${trainee.id}</td>
                <td>${this.getCourseName(trainee.courseId)}</td>
                <td><span class="badge badge-${this.getTrainingStatusColor(trainee.trainingStatus)}">${trainee.trainingStatus}</span></td>
                <td><span class="badge badge-${this.getEmploymentStatusColor(trainee.employmentStatus)}">${trainee.employmentStatus}</span></td>
                <td>${trainee.employment?.salary ? '₹' + trainee.employment.salary.toLocaleString() : '-'}</td>
                <td><a href="#">View</a></td>
            </tr>
        `).join('');
        
        document.getElementById('traineesTableBody').innerHTML = tableHtml || '<tr><td colspan="7" class="text-center">No trainees found</td></tr>';
    },
    
    viewTraineeDetail(traineeId) {
        const trainee = data.trainees.find(t => t.id === traineeId);
        if (!trainee) return;
        
        // Store for detail page
        this.selectedTrainee = trainee;
        this.navigate('trainee-detail');
    },
    
    showTraineeDetailPage() {
        const trainee = this.selectedTrainee;
        if (!trainee) {
            this.navigate('trainees');
            return;
        }
        
        const course = data.COURSES.find(c => c.id === trainee.courseId);
        const provider = data.PROVIDERS.find(p => p.id === trainee.providerId);
        const employer = trainee.employment ? data.EMPLOYERS.find(e => e.id === trainee.employment.employerId) : null;
        
        const html = `
            <div style="margin-bottom: 20px;">
                <a href="#" onclick="app.navigate('trainees'); return false;" class="btn-secondary">← Back to Trainees</a>
            </div>
            
            <div class="cards-grid">
                <div class="card">
                    <div class="card-title">${trainee.name}</div>
                    <div class="card-subtitle">ID: ${trainee.id}</div>
                    <div class="card-field">
                        <span class="card-label">Age</span>
                        <span class="card-value">${trainee.age}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Gender</span>
                        <span class="card-value">${trainee.gender}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Education</span>
                        <span class="card-value">${trainee.education}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">District</span>
                        <span class="card-value">${trainee.district}</span>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-title">Training Information</div>
                    <div class="card-field">
                        <span class="card-label">Course</span>
                        <span class="card-value">${course?.name}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Provider</span>
                        <span class="card-value">${provider?.name}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Start Date</span>
                        <span class="card-value">${trainee.startDate}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">End Date</span>
                        <span class="card-value">${trainee.endDate}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Attendance</span>
                        <span class="card-value">${trainee.attendance}%</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Assessment Score</span>
                        <span class="card-value">${trainee.assessmentScore}%</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Status</span>
                        <span class="card-value"><span class="badge badge-${this.getTrainingStatusColor(trainee.trainingStatus)}">${trainee.trainingStatus}</span></span>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-title">Employment Information</div>
                    <div class="card-field">
                        <span class="card-label">Status</span>
                        <span class="card-value"><span class="badge badge-${this.getEmploymentStatusColor(trainee.employmentStatus)}">${trainee.employmentStatus}</span></span>
                    </div>
                    ${trainee.employment ? `
                        <div class="card-field">
                            <span class="card-label">Employer</span>
                            <span class="card-value">${trainee.employment.employerName}</span>
                        </div>
                        <div class="card-field">
                            <span class="card-label">Job Title</span>
                            <span class="card-value">${trainee.employment.jobTitle}</span>
                        </div>
                        <div class="card-field">
                            <span class="card-label">Salary</span>
                            <span class="card-value">₹${trainee.employment.salary?.toLocaleString()}</span>
                        </div>
                        <div class="card-field">
                            <span class="card-label">Location</span>
                            <span class="card-value">${trainee.employment.location}</span>
                        </div>
                    ` : `
                        <div class="card-field">
                            <span class="card-label">Reason</span>
                            <span class="card-value">${trainee.nonPlacementReason || 'N/A'}</span>
                        </div>
                    `}
                </div>
                
                ${trainee.salaryProgression && trainee.salaryProgression.length > 0 ? `
                    <div class="card">
                        <div class="card-title">Salary Progression</div>
                        ${trainee.salaryProgression.map(sp => `
                            <div class="card-field">
                                <span class="card-label">${sp.point}</span>
                                <span class="card-value">₹${sp.salary.toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${trainee.followUps && trainee.followUps.length > 0 ? `
                    <div class="card">
                        <div class="card-title">Follow-ups</div>
                        ${trainee.followUps.map(fu => `
                            <div class="card-field">
                                <span class="card-label">${fu.milestone}</span>
                                <span class="card-value"><span class="badge badge-${this.getFollowupStatusColor(fu.status)}">${fu.status}</span></span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('traineeDetailContent').innerHTML = html;
    },
    
    showProgramsPage() {
        const html = data.COURSES.map(course => `
            <div class="card">
                <div class="card-title">${course.name}</div>
                <div class="card-subtitle">${course.sector}</div>
                <div class="card-field">
                    <span class="card-label">Duration</span>
                    <span class="card-value">${course.durationWeeks} weeks</span>
                </div>
                <div class="card-field">
                    <span class="card-label">Skills Taught</span>
                    <span class="card-value">${course.skills.join(', ')}</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('programsContainer').innerHTML = html;
    },
    
    showProvidersPage() {
        const providers = this.getVisibleProviders();
        const html = providers.map(provider => {
            const courses = provider.courses.map(cId => data.COURSES.find(c => c.id === cId)?.name).filter(Boolean);
            return `
                <div class="card">
                    <div class="card-title">${provider.name}</div>
                    <div class="card-subtitle">${provider.district}</div>
                    <div class="card-field">
                        <span class="card-label">Accreditation</span>
                        <span class="card-value">${provider.accreditation}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Rating</span>
                        <span class="card-value">${provider.rating}/5</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Courses</span>
                        <span class="card-value">${courses.join(', ')}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('providersContainer').innerHTML = html;
    },
    
    showEmployersPage() {
        const employers = this.getVisibleEmployers();
        const html = employers.map(employer => `
            <div class="card">
                <div class="card-title">${employer.name}</div>
                <div class="card-subtitle">${employer.sector}</div>
                <div class="card-field">
                    <span class="card-label">Status</span>
                    <span class="card-value"><span class="badge badge-${this.getStatusColor(employer.status)}">${employer.status}</span></span>
                </div>
                <div class="card-field">
                    <span class="card-label">District</span>
                    <span class="card-value">${employer.district}</span>
                </div>
                <div class="card-field">
                    <span class="card-label">Rating</span>
                    <span class="card-value">${employer.rating}/5</span>
                </div>
                <div class="card-field">
                    <span class="card-label">Skills Required</span>
                    <span class="card-value">${employer.skillRequirements.join(', ')}</span>
                </div>
                <div class="card-field">
                    <span class="card-label">Feedback</span>
                    <span class="card-value">${employer.feedback}</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('employersContainer').innerHTML = html;
    },
    
    showReportsPage() {
        // Reports page is already rendered in HTML
        // This is just a placeholder
    },
    
    showFollowupsPage() {
        const trainees = this.getScopedTrainees();
        const followups = [];
        
        trainees.forEach(trainee => {
            if (trainee.followUps) {
                trainee.followUps.forEach(fu => {
                    followups.push({
                        trainee: trainee,
                        followUp: fu
                    });
                });
            }
        });
        
        const html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Trainee</th>
                        <th>Milestone</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Salary</th>
                    </tr>
                </thead>
                <tbody>
                    ${followups.map(f => `
                        <tr>
                            <td><strong>${f.trainee.name}</strong></td>
                            <td>${f.followUp.milestone}</td>
                            <td>${f.followUp.dueDate}</td>
                            <td><span class="badge badge-${this.getFollowupStatusColor(f.followUp.status)}">${f.followUp.status}</span></td>
                            <td>${f.followUp.salary ? '₹' + f.followUp.salary.toLocaleString() : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('followupContent').innerHTML = html;
    },
    
    showOutcomesPage() {
        const trainees = this.getScopedTrainees();
        const searchTerm = document.getElementById('outcomesSearch')?.value.toLowerCase() || '';
        
        let filtered = trainees;
        if (searchTerm) {
            filtered = trainees.filter(t => t.name.toLowerCase().includes(searchTerm));
        }
        
        const html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Trainee</th>
                        <th>Course</th>
                        <th>Employment Status</th>
                        <th>Position</th>
                        <th>Salary</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(t => `
                        <tr>
                            <td><strong>${t.name}</strong></td>
                            <td>${this.getCourseName(t.courseId)}</td>
                            <td><span class="badge badge-${this.getEmploymentStatusColor(t.employmentStatus)}">${t.employmentStatus}</span></td>
                            <td>${t.employment?.jobTitle || t.nonPlacementReason || '-'}</td>
                            <td>${t.employment?.salary ? '₹' + t.employment.salary.toLocaleString() : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('outcomesContent').innerHTML = html;
    },
    
    showAnalyticsPage() {
        const trainees = this.getScopedTrainees();
        const stats = this.calculateStats(trainees);
        
        const html = `
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-title">Employment Status Distribution</div>
                    <div class="chart-subtitle">Breakdown of trainee employment outcomes</div>
                    <div style="padding: 20px; text-align: center;">
                        <div style="display: grid; gap: 10px;">
                            <div><span class="badge badge-success">Employed:</span> ${trainees.filter(t => t.employmentStatus === 'Employed').length}</div>
                            <div><span class="badge badge-info">Self-employed:</span> ${trainees.filter(t => t.employmentStatus === 'Self-employed').length}</div>
                            <div><span class="badge badge-warning">Seeking:</span> ${trainees.filter(t => t.employmentStatus === 'Seeking Employment').length}</div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-title">Training Status</div>
                    <div class="chart-subtitle">Progress of trainees through programs</div>
                    <div style="padding: 20px; text-align: center;">
                        <div style="display: grid; gap: 10px;">
                            <div><span class="badge badge-info">In Training:</span> ${trainees.filter(t => t.trainingStatus === 'In Training').length}</div>
                            <div><span class="badge badge-success">Completed:</span> ${trainees.filter(t => t.trainingStatus === 'Completed').length}</div>
                            <div><span class="badge badge-danger">Dropped:</span> ${trainees.filter(t => t.trainingStatus === 'Dropped Out').length}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 25px;">
                <div class="card-title">District-wise Performance</div>
                <div class="card-subtitle">Trainee distribution across districts</div>
                ${this.getDistrictStats(trainees).map(ds => `
                    <div class="card-field">
                        <span class="card-label">${ds.district}</span>
                        <span class="card-value">${ds.count} trainees</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('analyticsContent').innerHTML = html;
    },
    
    showSkillGapsPage() {
        const html = data.SKILL_DEMAND.map(skill => {
            const demandPercent = skill.demand;
            const coveragePercent = skill.coverage;
            const gapPercent = demandPercent - coveragePercent;
            
            return `
                <div class="skill-row">
                    <div class="skill-name">${skill.skill}</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar">
                            <div class="skill-bar-fill" style="width: ${coveragePercent}%;" title="Coverage: ${coveragePercent}%"></div>
                        </div>
                    </div>
                    <div style="min-width: 100px; text-align: right;">
                        <div>Demand: ${demandPercent}%</div>
                        <div>Coverage: ${coveragePercent}%</div>
                        <div style="color: var(--color-danger); font-weight: 600;">Gap: ${gapPercent}%</div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('skillsContent').innerHTML = html;
    },
    
    showSettingsPage() {
        const html = `
            <div class="card">
                <div class="card-title">Account Information</div>
                <div class="card-field">
                    <span class="card-label">Name</span>
                    <span class="card-value">${this.currentUser.name}</span>
                </div>
                <div class="card-field">
                    <span class="card-label">Email</span>
                    <span class="card-value">${this.currentUser.email}</span>
                </div>
                <div class="card-field">
                    <span class="card-label">Role</span>
                    <span class="card-value">${this.capitalizeRole(this.currentUser.role)}</span>
                </div>
            </div>
        `;
        
        document.getElementById('settingsContent').innerHTML = html;
    },
    
    showConsentPage() {
        const trainees = this.getScopedTrainees();
        const granted = trainees.filter(t => t.consent === 'Granted').length;
        const partial = trainees.filter(t => t.consent === 'Partial').length;
        const withdrawn = trainees.filter(t => t.consent === 'Withdrawn').length;
        
        const html = `
            <div class="cards-grid">
                <div class="card">
                    <div class="card-title">Consent Summary</div>
                    <div class="card-field">
                        <span class="card-label">Granted</span>
                        <span class="card-value">${granted} trainees</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Partial</span>
                        <span class="card-value">${partial} trainees</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Withdrawn</span>
                        <span class="card-value">${withdrawn} trainees</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('consentContent').innerHTML = html;
    },
    
    switchFollowupTab(tab) {
        // Update active button
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        this.showFollowupsPage();
    },
    
    // UTILITY FUNCTIONS
    getScopedTrainees() {
        if (this.currentUser.role === 'admin') {
            return data.trainees;
        } else if (this.currentUser.role === 'provider') {
            return data.trainees.filter(t => t.providerId === this.currentUser.providerId);
        } else if (this.currentUser.role === 'trainee') {
            return data.trainees.filter(t => t.id === this.currentUser.traineeId);
        } else if (this.currentUser.role === 'employer') {
            return data.trainees.filter(t => t.employment?.employerId === this.currentUser.employerId);
        }
        return [];
    },
    
    getVisibleProviders() {
        if (this.currentUser.role === 'provider') {
            return data.PROVIDERS.filter(p => p.id === this.currentUser.providerId);
        }
        return data.PROVIDERS;
    },
    
    getVisibleEmployers() {
        if (this.currentUser.role === 'employer') {
            return data.EMPLOYERS.filter(e => e.id === this.currentUser.employerId);
        }
        return data.EMPLOYERS;
    },
    
    calculateStats(trainees) {
        return {
            inTraining: trainees.filter(t => t.trainingStatus === 'In Training').length,
            completed: trainees.filter(t => t.trainingStatus === 'Completed').length,
            employed: trainees.filter(t => t.employmentStatus === 'Employed').length,
            placementRate: trainees.length > 0 ? Math.round(trainees.filter(t => ['Employed', 'Self-employed', 'Apprenticeship'].includes(t.employmentStatus)).length / trainees.length * 100) : 0,
            avgSalary: trainees.length > 0 ? Math.round(trainees.filter(t => t.employment?.salary).reduce((sum, t) => sum + (t.employment?.salary || 0), 0) / trainees.filter(t => t.employment?.salary).length) : 0,
            followupsDue: trainees.reduce((sum, t) => sum + (t.followUps?.filter(f => f.status === 'Due').length || 0), 0)
        };
    },
    
    getDistrictStats(trainees) {
        const districts = {};
        trainees.forEach(t => {
            districts[t.district] = (districts[t.district] || 0) + 1;
        });
        return Object.entries(districts).map(([district, count]) => ({ district, count }));
    },
    
    getCourseName(courseId) {
        return data.COURSES.find(c => c.id === courseId)?.name || 'Unknown';
    },
    
    getTrainingStatusColor(status) {
        switch(status) {
            case 'Completed': return 'success';
            case 'In Training': return 'info';
            case 'Dropped Out': return 'danger';
            default: return 'primary';
        }
    },
    
    getEmploymentStatusColor(status) {
        switch(status) {
            case 'Employed': return 'success';
            case 'Self-employed': return 'success';
            case 'Apprenticeship': return 'success';
            case 'Seeking Employment': return 'info';
            case 'Unreachable': return 'warning';
            default: return 'primary';
        }
    },
    
    getFollowupStatusColor(status) {
        switch(status) {
            case 'Completed': return 'success';
            case 'Due': return 'danger';
            case 'Pending': return 'warning';
            case 'Unreachable': return 'danger';
            default: return 'primary';
        }
    },
    
    getStatusColor(status) {
        switch(status) {
            case 'Verified': return 'success';
            case 'Pending Verification': return 'warning';
            case 'Needs Review': return 'warning';
            default: return 'primary';
        }
    },
    
    exportTraineeData() {
        const trainees = this.getScopedTrainees();
        let csv = 'ID,Name,Age,Gender,District,Course,Training Status,Employment Status,Salary\n';
        
        trainees.forEach(t => {
            csv += `${t.id},${t.name},${t.age},${t.gender},${t.district},${this.getCourseName(t.courseId)},${t.trainingStatus},${t.employmentStatus},${t.employment?.salary || ''}\n`;
        });
        
        this.downloadCSV(csv, 'mahaskilltrack-trainees.csv');
    },
    
    exportOutcomeData() {
        const trainees = this.getScopedTrainees();
        const stats = this.calculateStats(trainees);
        let csv = 'Metric,Value\n';
        csv += `Total Trainees,${trainees.length}\n`;
        csv += `In Training,${stats.inTraining}\n`;
        csv += `Training Completed,${stats.completed}\n`;
        csv += `Employed,${stats.employed}\n`;
        csv += `Placement Rate,${stats.placementRate}%\n`;
        csv += `Average Salary,₹${stats.avgSalary}\n`;
        
        this.downloadCSV(csv, 'mahaskilltrack-outcomes.csv');
    },
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};

// =====================================================
// DATA
// =====================================================

const data = {
    DISTRICTS: [
        "Pune",
        "Mumbai",
        "Nagpur",
        "Nashik",
        "Aurangabad",
        "Kolhapur",
        "Thane",
        "Satara"
    ],
    
    COURSES: [
        {
            id: "C-WEB",
            name: "Web Development",
            sector: "IT & ITeS",
            durationWeeks: 24,
            skills: ["JavaScript", "HTML", "CSS", "React", "SQL", "Communication"]
        },
        {
            id: "C-ELE",
            name: "Electrician",
            sector: "Electrical",
            durationWeeks: 16,
            skills: ["Wiring", "Safety Standards", "Motor Repair", "Blueprint Reading"]
        },
        {
            id: "C-HCA",
            name: "Healthcare Assistant",
            sector: "Healthcare",
            durationWeeks: 20,
            skills: ["Patient Care", "First Aid", "Record Keeping", "Communication"]
        },
        {
            id: "C-DEO",
            name: "Data Entry Operator",
            sector: "IT & ITeS",
            durationWeeks: 12,
            skills: ["Excel", "Typing Speed", "Data Accuracy", "SQL"]
        },
        {
            id: "C-TAI",
            name: "Tailoring & Garment Making",
            sector: "Apparel",
            durationWeeks: 14,
            skills: ["Pattern Making", "Machine Stitching", "Quality Check"]
        },
        {
            id: "C-AUT",
            name: "Automotive Technician",
            sector: "Automotive",
            durationWeeks: 22,
            skills: ["Engine Diagnostics", "Safety Standards", "Electrical Systems"]
        }
    ],
    
    PROVIDERS: [
        {
            id: "P-01",
            name: "Sahyadri Skill Academy",
            district: "Pune",
            courses: ["C-WEB", "C-DEO", "C-ELE"],
            rating: 4.6,
            accreditation: "A+"
        },
        {
            id: "P-02",
            name: "Konkan Vocational Institute",
            district: "Mumbai",
            courses: ["C-WEB", "C-HCA"],
            rating: 4.3,
            accreditation: "A"
        },
        {
            id: "P-03",
            name: "Vidarbha Technical Centre",
            district: "Nagpur",
            courses: ["C-ELE", "C-AUT"],
            rating: 3.9,
            accreditation: "B"
        },
        {
            id: "P-04",
            name: "Godavari Livelihood Mission",
            district: "Nashik",
            courses: ["C-TAI", "C-HCA", "C-DEO"],
            rating: 4.1,
            accreditation: "A"
        },
        {
            id: "P-05",
            name: "Marathwada Kaushalya Kendra",
            district: "Aurangabad",
            courses: ["C-AUT", "C-TAI"],
            rating: 3.6,
            accreditation: "C"
        },
        {
            id: "P-06",
            name: "Panchganga Industrial Training",
            district: "Kolhapur",
            courses: ["C-ELE", "C-DEO"],
            rating: 4.0,
            accreditation: "B"
        }
    ],
    
    EMPLOYERS: [
        {
            id: "E-01",
            name: "Trimurti Softworks Pvt Ltd",
            sector: "IT & ITeS",
            district: "Pune",
            status: "Verified",
            skillRequirements: ["JavaScript", "React", "SQL", "Communication"],
            feedback: "Trainees are strong on frontend basics but need deeper database knowledge.",
            rating: 4.2
        },
        {
            id: "E-02",
            name: "Sagar Health Services",
            sector: "Healthcare",
            district: "Mumbai",
            status: "Verified",
            skillRequirements: ["Patient Care", "First Aid", "Record Keeping"],
            feedback: "Well prepared for ward duties; documentation skills improving.",
            rating: 4.5
        },
        {
            id: "E-03",
            name: "Deccan Motors Works",
            sector: "Automotive",
            district: "Nagpur",
            status: "Pending Verification",
            skillRequirements: ["Engine Diagnostics", "Electrical Systems", "Safety Standards"],
            feedback: "Need more hands-on diagnostics practice before deployment.",
            rating: 3.8
        },
        {
            id: "E-04",
            name: "Ajanta Apparels",
            sector: "Apparel",
            district: "Aurangabad",
            status: "Verified",
            skillRequirements: ["Machine Stitching", "Quality Check", "Pattern Making"],
            feedback: "Good productivity; quality inspection training could improve.",
            rating: 4.0
        },
        {
            id: "E-05",
            name: "Panchganga Electricals",
            sector: "Electrical",
            district: "Kolhapur",
            status: "Needs Review",
            skillRequirements: ["Wiring", "Safety Standards", "Motor Repair"],
            feedback: "Safety compliance awareness is excellent.",
            rating: 3.9
        },
        {
            id: "E-06",
            name: "Nashik BPO Solutions",
            sector: "IT & ITeS",
            district: "Nashik",
            status: "Verified",
            skillRequirements: ["Excel", "Data Accuracy", "SQL", "Communication"],
            feedback: "Excel proficiency is good, SQL exposure is limited.",
            rating: 4.1
        }
    ],
    
    DEMO_USERS: [
        { email: "admin@mahaskill.demo", name: "Anjali Deshmukh", role: "admin", password: "demo1234" },
        { email: "provider@mahaskill.demo", name: "Sahyadri Skill Academy", role: "provider", password: "demo1234", providerId: "P-01" },
        { email: "trainee@mahaskill.demo", name: "Rahul Pawar", role: "trainee", password: "demo1234", traineeId: "MST-1001" },
        { email: "employer@mahaskill.demo", name: "Trimurti Softworks Pvt Ltd", role: "employer", password: "demo1234", employerId: "E-01" }
    ],
    
    SKILL_DEMAND: [
        { skill: "JavaScript", demand: 82, coverage: 61 },
        { skill: "SQL", demand: 74, coverage: 45 },
        { skill: "Communication", demand: 68, coverage: 52 },
        { skill: "Excel", demand: 61, coverage: 70 },
        { skill: "Engine Diagnostics", demand: 57, coverage: 49 },
        { skill: "Patient Care", demand: 64, coverage: 66 },
        { skill: "Safety Standards", demand: 59, coverage: 72 },
        { skill: "Quality Check", demand: 48, coverage: 38 }
    ],
    
    NOTIFICATIONS: [
        {
            id: "n1",
            title: "128 trainees require 6-month follow-up",
            detail: "Follow-up window closes in 7 days across 6 districts.",
            tone: "warning",
            time: "2h ago"
        },
        {
            id: "n2",
            title: "Godavari Livelihood Mission submitted new outcome data",
            detail: "42 outcome records awaiting validation.",
            tone: "info",
            time: "5h ago"
        },
        {
            id: "n3",
            title: "15 employer records require verification",
            detail: "Employer verification backlog is above threshold.",
            tone: "warning",
            time: "Yesterday"
        },
        {
            id: "n4",
            title: "Automotive Technician placement rate declining",
            detail: "Down 6.4 pts against the previous cohort.",
            tone: "danger",
            time: "2 days ago"
        }
    ],
    
    trainees: [] // Will be populated with generated trainees
};

// Generate trainees data
function generateTraineeData() {
    const FIRST_NAMES = ["Rahul","Priya","Amit","Sneha","Vikram","Kavita","Nilesh","Pooja","Sagar","Meera","Rohit","Aarti","Ganesh","Shraddha","Prashant","Manisha","Akash","Rupali","Sandeep","Vaishali","Kiran","Deepak","Swapnil","Ashwini","Tushar","Mansi","Yogesh","Rutuja","Nikhil","Sushma"];
    const LAST_NAMES = ["Pawar","Jadhav","Kulkarni","Shinde","Patil","Deshmukh","More","Gaikwad","Chavan","Kadam","Sawant","Bhosale","Salunkhe","Waghmare"];
    const EDUCATION = ["10th Pass", "12th Pass", "ITI Diploma", "Graduate", "Undergraduate"];
    
    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    const trainees = [];
    for (let i = 0; i < 50; i++) {
        const firstName = pick(FIRST_NAMES);
        const lastName = pick(LAST_NAMES);
        const courseId = pick(data.COURSES.map(c => c.id));
        const course = data.COURSES.find(c => c.id === courseId);
        const provider = pick(data.PROVIDERS);
        const isEmployed = Math.random() < 0.65;
        
        const trainee = {
            id: `MST-${1001 + i}`,
            name: `${firstName} ${lastName}`,
            age: 19 + Math.floor(Math.random() * 14),
            gender: Math.random() < 0.46 ? "Female" : "Male",
            district: pick(data.DISTRICTS),
            education: pick(EDUCATION),
            contactReachable: true,
            consent: pick(["Granted", "Partial", "Withdrawn"]),
            consentDate: "2025-09-01",
            dataSharing: { analytics: true, employers: Math.random() < 0.75, research: Math.random() < 0.55 },
            courseId: courseId,
            providerId: provider.id,
            trainingCenter: `${provider.name} — ${pick(data.DISTRICTS)} Centre`,
            startDate: "2025-09-01",
            endDate: "2026-03-01",
            attendance: Math.round(70 + Math.random() * 29),
            assessmentScore: Math.round(52 + Math.random() * 46),
            certified: Math.random() < 0.92,
            trainingStatus: pick(["In Training", "Completed", "Dropped Out"]),
            employmentStatus: isEmployed ? pick(["Employed", "Self-employed", "Apprenticeship"]) : pick(["Seeking Employment", "Unreachable"]),
            nonPlacementReason: !isEmployed ? pick(["Lack of required skills", "Lack of suitable jobs", "Salary too low", "Location constraints", "Personal reasons"]) : undefined,
            employment: isEmployed ? {
                employerId: pick(data.EMPLOYERS).id,
                employerName: pick(data.EMPLOYERS).name,
                jobTitle: "Job Title",
                joiningDate: "2025-09-15",
                salary: 15000 + Math.floor(Math.random() * 20000),
                employmentType: "Full-time",
                location: "Maharashtra",
                verified: Math.random() < 0.75
            } : undefined,
            salaryProgression: isEmployed ? [
                { point: "Joining", salary: 18000 },
                { point: "3 months", salary: 19000 },
                { point: "6 months", salary: 20000 }
            ] : [],
            followUps: [
                { id: `${Math.random()}-F3`, milestone: "3 months", dueDate: "2025-12-15", status: pick(["Completed", "Due", "Pending"]) },
                { id: `${Math.random()}-F6`, milestone: "6 months", dueDate: "2026-03-15", status: pick(["Completed", "Due", "Pending"]) }
            ],
            timeline: [],
            trainingYear: 2025,
            satisfaction: Math.round(3 + Math.random() * 2)
        };
        
        trainees.push(trainee);
    }
    
    return trainees;
}

// Populate trainees
data.trainees = generateTraineeData();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
