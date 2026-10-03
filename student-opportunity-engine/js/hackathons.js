// hackathons.js

const hackathonsModule = {
    currentCategory: 'hackathons',

    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        // Setup tabs
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                hackathonsModule.currentCategory = e.target.dataset.category;
                hackathonsModule.loadData();
            });
        });

        document.getElementById('apply-filters-btn').addEventListener('click', hackathonsModule.loadData);

        hackathonsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'events-container';
        window.components.renderSkeleton(containerId, 'card', 6);

        const searchQuery = document.getElementById('search-input').value;
        const mode = document.getElementById('filter-mode').value;

        try {
            const data = await window.api.getHackathons({ q: searchQuery, mode });
            const items = Array.isArray(data) ? data : [];
            if (items.length > 0) {
                hackathonsModule.renderCards(items);
            } else {
                window.components.renderEmptyState(containerId, 'No events found', `Try adjusting your filters to find more ${hackathonsModule.currentCategory}.`);
            }
        } catch (error) {
            console.error(`Failed to fetch ${hackathonsModule.currentCategory}:`, error);
            window.components.renderErrorState(containerId, 'Unable to load events', hackathonsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('events-container');
        
        let html = '<div class="grid grid-cols-3 gap-4">';
        
        items.forEach(item => {
            const title = item.title || 'Untitled';
            const org = item.organization || item.organizer || '';
            const type = item.type || hackathonsModule.currentCategory;
            const location = item.mode || 'Online';
            const deadline = item.deadline ? new Date(item.deadline).toLocaleDateString() : '';
            const matchScore = item.matchScore || null;
            const skills = item.skills ? item.skills.map(s => s.skill || s) : [];
            const oppId = item._id ? String(item._id) : '';
            const prize = item.prize || '';
            const date = item.date || 'TBD';

            // Display up to 3 matched skills
            const skillHtml = skills.slice(0, 3).map(s => 
                `<span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;">
                    <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${s}
                </span>`
            ).join('');

            html += `
                <div class="card event-card" data-id="${oppId}" style="display: flex; flex-direction: column;">
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

                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                        <div>${type} ${location ? ` · ${location}` : ''} ${date ? ` · Date: ${date}` : ''}</div>
                        ${prize ? `<div style="color: var(--warning); font-weight: 600;">Prize: ${prize}</div>` : ''}
                        ${item.eligibility ? `<div>Eligibility: ${item.eligibility}</div>` : ''}
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
                        ${skillHtml}
                    </div>

                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary apply-opp-btn" data-id="${oppId}" style="flex: 1;">Register</button>
                        <button class="btn btn-outline save-opp-btn" data-id="${oppId}">Save ☆</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('.apply-opp-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                btn.disabled = true; btn.textContent = 'Registering...';
                try {
                    await window.api.applyToOpportunity(id);
                    btn.textContent = 'Registered ✓';
                    window.components.showToast('success', 'Registration submitted!');
                } catch (err) {
                    btn.disabled = false; btn.textContent = 'Register';
                    window.components.showToast('error', 'Failed: ' + err.message);
                }
            });
        });
        container.querySelectorAll('.save-opp-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                btn.disabled = true; btn.textContent = 'Saving...';
                try {
                    await window.api.saveOpportunity(id);
                    btn.textContent = 'Saved ✓';
                    window.components.showToast('success', 'Saved!');
                } catch (err) {
                    btn.disabled = false; btn.textContent = 'Save';
                    window.components.showToast('error', 'Failed: ' + err.message);
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', hackathonsModule.init);
