// workshops.js

const workshopsModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        document.getElementById('apply-filters-btn').addEventListener('click', workshopsModule.loadData);

        workshopsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'workshops-container';
        window.components.renderSkeleton(containerId, 'card', 6);

        const category = document.getElementById('filter-category').value;
        const duration = document.getElementById('filter-duration').value;

        try {
            const data = await window.api.getWorkshops({ category, duration });
            const items = Array.isArray(data) ? data : [];
            if (items.length > 0) {
                workshopsModule.renderCards(items);
            } else {
                window.components.renderEmptyState(containerId, 'No programs found', 'Try adjusting your filters to see more results.');
            }
        } catch (error) {
            console.error("Failed to fetch workshops:", error);
            window.components.renderErrorState(containerId, 'Unable to load programs', workshopsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('workshops-container');
        
        let html = '<div class="grid grid-cols-4 gap-4">';
        
        items.forEach(item => {
            const title = item.title || 'Untitled';
            const org = item.organization || item.organizer || '';
            const category = item.category || 'Workshop';
            const location = item.mode || 'Online';
            const date = item.date || 'Self-paced';
            const duration = item.duration || 'Flexible';
            const skills = item.skills ? item.skills.map(s => s.skill || s) : [];
            const oppId = item._id ? String(item._id) : '';

            // Display up to 3 matched skills
            const skillHtml = skills.slice(0, 3).map(s => 
                `<span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;">
                    <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${s}
                </span>`
            ).join('');

            html += `
                <div class="card workshop-card" data-id="${oppId}" style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">${category}</div>
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">${title}</h3>
                            <div style="font-size: 0.875rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
                                ${org}
                                <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                        <div>${location} · Date: ${date}</div>
                        <div>Duration: ${duration}</div>
                        ${item.eligibility ? `<div>Eligibility: ${item.eligibility}</div>` : ''}
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
                        ${skillHtml}
                    </div>

                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline" style="width: 100%;" onclick="window.api.saveOpportunity('${oppId}').then(() => window.components.showToast('success', 'Saved!')).catch(e => window.components.showToast('error', e.message))">Register / Save ☆</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', workshopsModule.init);
