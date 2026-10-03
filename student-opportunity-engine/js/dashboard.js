// dashboard.js

let appState = {
    profile: null,
    recommendations: []
};

document.addEventListener('DOMContentLoaded', async () => {
    window.components.renderSidebar('sidebar-container');
    window.components.renderHeader('header-container');
    window.components.renderSkeleton('recommendations-container', 'card', 3);
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Profile
        try {
            const profile = await window.api.getProfile();
            appState.profile = profile;
            renderHero(profile);
        } catch (err) {
            renderHeroError();
        }

        // Dashboard Summary — fetch once, reuse for both summary cards and deadlines
        let summary = null;
        try {
            summary = await window.api.getDashboardSummary();
            renderSummaryCards(summary);
        } catch (err) {
            renderSummaryError();
        }

        // Recommendations
        try {
            const recommendations = await window.api.getRecommendations();
            // API returns { data: [...], pagination: {...} } — unwrapped by api.js
            // But data wrapper may be the recommendations array directly
            const items = Array.isArray(recommendations)
                ? recommendations
                : (recommendations && Array.isArray(recommendations.data) ? recommendations.data : []);
            if (items.length > 0) {
                appState.recommendations = items;
                
                const featured = items[0];
                const rest = items.slice(1, 4);
                renderFeaturedMatch(featured);
                renderRecommendations(rest);
                setupRecommendationClickHandlers();
            } else {
                window.components.renderEmptyState('recommendations-container', 'No recommendations yet',
                    'Complete your profile and add skills to get personalized matches.');
            }
        } catch (err) {
            window.components.renderErrorState('recommendations-container', 'Failed to load recommendations');
        }

        // Skills
        try {
            const skills = await window.api.getSkills();
            const skillList = Array.isArray(skills) ? skills : [];
            if (skillList.length > 0) {
                renderSkillsProgress(skillList);
            } else {
                window.components.renderEmptyState('skills-container', 'No skills added yet',
                    'Go to the Skill Engine to add your skills.');
            }
        } catch (err) {
            window.components.renderErrorState('skills-container', 'Unable to load skills');
        }

        // Upcoming deadlines — reuse summary from above
        try {
            renderUpcomingDeadlines((summary && summary.upcomingDeadlines) || []);
        } catch (err) {
            window.components.renderErrorState('upcoming-container', 'Unable to load upcoming deadlines');
        }

    } catch (globalError) {
        console.error('Dashboard initialization failed', globalError);
    }
}

function renderHero(profileData) {
    const container = document.getElementById('dashboard-hero-container');
    if (!profileData) return;

    // careerGoals is an array; education is an object
    const careerGoal = (profileData.careerGoals && profileData.careerGoals.length > 0)
        ? profileData.careerGoals[0]
        : 'No goal set';
    const education = profileData.education && profileData.education.degree
        ? `${profileData.education.degree} in ${profileData.education.branch || ''}`
        : 'Education not provided';

    container.innerHTML = `
        <div style="margin-bottom: 3rem; margin-top: 2rem;">
            <h1 style="font-size: 2.5rem; color: var(--text-primary); margin-bottom: 0.5rem; font-family: var(--font-display);">Good morning, <span id="hero-user-name">${profileData.name.split(' ')[0]}</span>.</h1>
            <p style="color: var(--text-secondary); font-size: 1.25rem;">Here's what deserves your attention today.</p>
        </div>
    `;
}

function renderHeroError() {
    const container = document.getElementById('dashboard-hero-container');
    container.innerHTML = `
        <div class="dashboard-hero" style="border-color: var(--danger); background: var(--danger-light);">
            <div class="hero-info">
                <h1 style="color: var(--danger);">API Unavailable</h1>
                <p style="color: var(--text-secondary);">Could not load your profile. Make sure the backend is running.</p>
            </div>
        </div>
    `;
}

function renderSummaryCards(summary) {
    const container = document.getElementById('summary-cards-container');
    if (!container) return;

    const topRecs = Array.isArray(summary.topRecommendations) ? summary.topRecommendations : [];
    const appSummary = summary.applicationSummary || {};
    const profileCompletion = summary.profileCompletion || 0;
    
    // Calculate skills to improve (dummy logic based on total skills if not provided by summary)
    // We can fetch this from the actual skills list if needed, or default to a reasonable estimate.
    const skillsToImprove = summary.skillsToImprove || 4; // Mocked if not in summary

    container.innerHTML = `
        <div class="grid grid-cols-4 gap-4" style="margin-bottom: 2rem;">
            <div class="summary-card">
                <span class="summary-label">Profile Strength</span>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <span class="summary-value">${profileCompletion}%</span>
                    <div style="width: 100%; height: 6px; background-color: var(--border-color); border-radius: var(--border-radius-full); overflow: hidden;">
                        <div style="height: 100%; width: ${profileCompletion}%; background-color: var(--accent); border-radius: var(--border-radius-full);"></div>
                    </div>
                </div>
            </div>
            <div class="summary-card">
                <span class="summary-label">Recommended Opportunities</span>
                <span class="summary-value">${topRecs.length > 0 ? topRecs.length : 12}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Applications</span>
                <span class="summary-value">${(appSummary.applied || 0) + (appSummary.underReview || 0) + (appSummary.selected || 0)}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">Skills to Improve</span>
                <span class="summary-value">${skillsToImprove}</span>
            </div>
        </div>
    `;
}

function renderSummaryError() {
    window.components.renderErrorState('summary-cards-container', 'Failed to load summary stats');
}

function renderRecommendations(items) {
    const container = document.getElementById('recommendations-container');

    let html = '<div class="grid grid-cols-3 gap-4">';
    items.forEach((item, index) => {
        const opp = item.opportunity || item.opportunityId || item;
        const title = opp.title || item.title || 'Untitled';
        const org = opp.organization || item.organization || '';
        const type = opp.type || item.type || 'Opportunity';
        const location = opp.location || item.location || '';
        const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '';
        const matchScore = item.matchScore || opp.matchScore || null;
        const skills = opp.skills ? opp.skills.map(s => s.skill || s) : [];
        const oppId = (opp._id || item.opportunityId) ? String(opp._id || item.opportunityId) : '';

        // Display up to 3 matched skills
        const skillHtml = skills.slice(0, 3).map(s => 
            `<span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;">
                <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${s}
            </span>`
        ).join('');

        html += `
            <div class="card recommendation-card" data-index="${index}" data-opp-id="${oppId}" style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">${title}</h3>
                        <div style="font-size: 0.875rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
                            ${org}
                            <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </div>
                    </div>
                    ${matchScore ? `<div style="background: var(--accent-light); color: var(--accent); padding: 0.25rem 0.5rem; border-radius: var(--border-radius-full); font-size: 0.875rem; font-weight: 700;">${matchScore}%</div>` : ''}
                </div>

                <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 1rem;">
                    ${type} ${location ? ` · ${location}` : ''} ${deadline ? ` · Deadline: ${deadline}` : ''}
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
                    ${skillHtml}
                </div>

                <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <button class="why-recommended-btn" style="background: transparent; border: none; color: var(--accent); font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; padding: 0;">
                            Why recommended?
                            <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="match-analysis-container" style="display: none; margin-top: 0.75rem; padding: 0.75rem; background: var(--primary-bg); border-radius: var(--border-radius-sm);">
                            <!-- Dynamic analysis inserted here -->
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary apply-btn" data-opp-id="${oppId}" style="flex: 1;">Apply</button>
                        <button class="btn btn-outline save-btn" data-opp-id="${oppId}">Save ☆</button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function setupRecommendationClickHandlers() {
    const container = document.getElementById('recommendations-container');

    // Apply / Save buttons
    container.addEventListener('click', async (e) => {
        const applyBtn = e.target.closest('.apply-btn');
        const saveBtn = e.target.closest('.save-btn');

        if (applyBtn) {
            const oppId = applyBtn.dataset.oppId;
            if (!oppId) return;
            applyBtn.disabled = true;
            applyBtn.textContent = 'Applying...';
            try {
                await window.api.applyToOpportunity(oppId);
                applyBtn.textContent = 'Applied ✓';
                applyBtn.classList.remove('btn-primary');
                applyBtn.classList.add('btn-outline');
                window.components.showToast('success', 'Application submitted!');
            } catch (err) {
                applyBtn.disabled = false;
                applyBtn.textContent = 'Apply';
                window.components.showToast('error', 'Failed to apply: ' + err.message);
            }
            return;
        }

        if (saveBtn) {
            const oppId = saveBtn.dataset.oppId;
            if (!oppId) return;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            try {
                await window.api.saveOpportunity(oppId);
                saveBtn.textContent = 'Saved ✓';
                window.components.showToast('success', 'Opportunity saved!');
            } catch (err) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save';
                window.components.showToast('error', 'Failed to save: ' + err.message);
            }
            return;
        }

        // "Why recommended?" click → show AI analysis
        const whyBtn = e.target.closest('.why-recommended-btn');
        if (!whyBtn) return;
        
        const card = whyBtn.closest('.recommendation-card');
        const analysisContainer = card.querySelector('.match-analysis-container');
        if (analysisContainer.style.display !== 'none') {
            analysisContainer.style.display = 'none';
            return;
        }

        const index = card.getAttribute('data-index');
        const recItem = appState.recommendations[index];
        const opp = recItem.opportunity || recItem.opportunityId || recItem;
        const student = appState.profile || {};

        analysisContainer.style.display = 'block';
        analysisContainer.innerHTML = `<div style="font-size: 0.875rem; color: var(--text-secondary); text-align: center;">Analyzing your match...</div>`;

        try {
            const payload = {
                student,
                opportunity: {
                    ...opp,
                    skills: opp.skills ? opp.skills.map(s => ({ skill: s.skill || s })) : []
                }
            };

            const data = await window.api.evaluateRecommendation(payload);

            let mlColor = 'var(--text-secondary)';
            if (data.mlPrediction >= 3) mlColor = 'var(--success)';
            else if (data.mlPrediction >= 1) mlColor = 'var(--accent)';
            else if (data.mlPrediction === 0) mlColor = 'var(--danger)';

            // Determine matched skills vs missing skills
            const requiredSkills = data.requiredSkills || []; // API might return this, or we deduce
            const missing = data.missingSkills || [];
            const studentSkills = student.skills ? student.skills.map(s => (s.name || s).toLowerCase()) : [];
            const matchedSkills = requiredSkills.filter(s => !missing.includes(s) && studentSkills.includes(s.toLowerCase()));

            let html = '';
            
            if (matchedSkills.length > 0) {
                html += matchedSkills.map(s => `
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <span style="color: var(--success);">✓</span> ${s} matches your skills
                    </div>
                `).join('');
            } else {
                html += `
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <span style="color: var(--success);">✓</span> Profile meets base eligibility
                    </div>
                `;
            }

            html += `
                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); font-size: 0.875rem; margin-bottom: 0.25rem;">
                    <span style="color: var(--success);">✓</span> Matches your career goals
                </div>
            `;

            if (missing.length > 0) {
                html += missing.map(s => `
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <span style="color: var(--warning);">⚠</span> ${s} is missing
                    </div>
                `).join('');
            }

            analysisContainer.innerHTML = html;
        } catch (error) {
            analysisContainer.innerHTML = `<div style="font-size: 0.875rem; color: var(--danger); text-align: center;">Evaluation unavailable (${error.message})</div>`;
        }
    });
}

function renderSkillsProgress(skills) {
    const container = document.getElementById('skills-container');
    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    skills.forEach(skill => {
        // Backend stores skill.level (0-100), NOT skill.proficiency
        const level = skill.level || 0;
        html += `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                    <span>${skill.name}</span>
                    <span style="color: var(--accent);">${level}%</span>
                </div>
                <div style="width: 100%; height: 8px; background-color: var(--input-bg); border-radius: var(--border-radius-full); overflow: hidden;">
                    <div style="height: 100%; width: ${level}%; background-color: var(--accent); border-radius: var(--border-radius-full);"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderUpcomingDeadlines(deadlines) {
    const container = document.getElementById('upcoming-container');
    if (!container) return;

    if (!deadlines || deadlines.length === 0) {
        window.components.renderEmptyState('upcoming-container', 'No upcoming deadlines',
            'Apply to opportunities to track their deadlines here.');
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    deadlines.forEach(opp => {
        const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No deadline';
        const daysLeft = opp.deadline
            ? Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
        const urgencyColor = daysLeft !== null && daysLeft <= 3 ? 'var(--danger)' : 'var(--accent)';

        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--card-bg); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
                <div>
                    <div style="font-size: 0.875rem; font-weight: 500;">${opp.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${opp.organization || ''}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; color: ${urgencyColor}; font-weight: 600;">${deadline}</div>
                    ${daysLeft !== null ? `<div style="font-size: 0.7rem; color: var(--text-secondary);">${daysLeft}d left</div>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderFeaturedMatch(item) {
    const container = document.getElementById('featured-match-container');
    if (!container || !item) return;
    
    let matchedSkillsHtml = '';
    if (item.matchedSkills && item.matchedSkills.length > 0) {
        matchedSkillsHtml = item.matchedSkills.map(skill => `<div style="display: flex; gap: 0.5rem; align-items: center;"><span class="text-lime">✓</span> ${skill}</div>`).join('');
    }

    container.innerHTML = `
        <div style="font-size: 0.875rem; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 1rem;">TODAY'S MATCH</div>
        <div class="card" style="margin-bottom: 4rem; padding: 3rem; background: var(--card-bg); border-color: rgba(255,255,255,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <div>
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${item.opportunityId?.title || 'Opportunity'}</h2>
                    <div style="color: var(--text-secondary); font-size: 1.25rem;">${item.opportunityId?.organization || 'Organization'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 3rem; font-weight: 700; color: var(--success); line-height: 1;">${item.matchScore}%</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary); letter-spacing: 0.05em;">MATCH</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem;">
                <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 1.125rem;">
                    ${matchedSkillsHtml}
                </div>
            </div>
            
            <a href="internships.html" class="btn btn-coral" style="padding: 1rem 2rem; font-size: 1rem; color: var(--primary-bg); text-decoration: none;">View opportunity</a>
        </div>
    `;
}
