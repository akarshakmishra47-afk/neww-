// internships.js

const internshipsModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        document.getElementById('apply-filters-btn').addEventListener('click', internshipsModule.loadData);

        internshipsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'internships-container';
        window.components.renderSkeleton(containerId, 'card', 6);

        const typeEl = document.getElementById('filter-type');
        const modeEl = document.getElementById('filter-mode');
        const sortEl = document.getElementById('filter-sort');

        const type = typeEl ? typeEl.value : '';
        const mode = modeEl ? modeEl.value : '';
        const sort = sortEl ? sortEl.value : '';

        try {
            // api.js auto-unwraps .data; backend returns array of Opportunity docs
            const data = await window.api.getInternships({ mode, sort });
            const items = Array.isArray(data) ? data : [];
            if (items.length > 0) {
                internshipsModule.renderCards(items);
            } else {
                window.components.renderEmptyState(containerId, 'No opportunities found', 'Try adjusting your filters or checking back later.');
            }
        } catch (error) {
            console.error("Failed to fetch internships:", error);
            window.components.renderErrorState(containerId, 'Unable to load opportunities', internshipsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('internships-container');
        
        let html = '<div class="grid grid-cols-3 gap-4">';
        
        items.forEach(item => {
            const title = item.title || 'Untitled';
            const org = item.organization || '';
            const type = item.type || 'Opportunity';
            const location = item.location || '';
            const deadline = item.deadline ? new Date(item.deadline).toLocaleDateString() : '';
            const matchScore = item.matchScore || null;
            const skills = item.skills ? item.skills.map(s => s.skill || s) : [];
            const oppId = item._id ? String(item._id) : '';
            const applyUrl = item.applyUrl || null;

            // Display up to 3 matched skills
            const skillHtml = skills.slice(0, 3).map(s => 
                `<span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;">
                    <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${s}
                </span>`
            ).join('');

            html += `
                <div class="card opportunity-card" data-id="${oppId}" style="display: flex; flex-direction: column;">
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

                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; gap: 0.5rem;">
                        ${applyUrl 
                            ? `<a href="${applyUrl}" target="_blank" class="btn btn-primary" style="flex: 1; text-align: center; text-decoration: none;">Apply Externally ↗</a>` 
                            : `<button class="btn btn-primary apply-opp-btn" data-id="${oppId}" style="flex: 1;">Apply</button>`
                        }
                        <button class="btn btn-outline save-opp-btn" data-id="${oppId}" ${applyUrl ? 'disabled title="External jobs cannot be saved locally yet"' : ''} style="flex: 0.5;">Save ☆</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;

        // Wire Apply/Save buttons
        container.querySelectorAll('.apply-opp-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                btn.disabled = true; btn.textContent = 'Applying...';
                try {
                    await window.api.applyToOpportunity(id);
                    btn.textContent = 'Applied ✓';
                    window.components.showToast('success', 'Application submitted!');
                } catch (err) {
                    btn.disabled = false; btn.textContent = 'Apply';
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
                    window.components.showToast('success', 'Opportunity saved!');
                } catch (err) {
                    btn.disabled = false; btn.textContent = 'Save';
                    window.components.showToast('error', 'Failed: ' + err.message);
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', internshipsModule.init);
