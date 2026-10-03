// projects.js

const projectsModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        const filterDifficulty = document.getElementById('filter-difficulty');
        if (filterDifficulty) {
            filterDifficulty.addEventListener('change', projectsModule.loadData);
        }

        projectsModule.loadData();
    },

    loadData: async () => {
        const containerId = 'projects-container';
        window.components.renderSkeleton(containerId, 'card', 4);

        const difficulty = document.getElementById('filter-difficulty') ? document.getElementById('filter-difficulty').value : '';

        try {
            const data = await window.api.getProjects({ difficulty });
            const items = Array.isArray(data) ? data : [];
            if (items.length > 0) {
                projectsModule.renderCards(items);
            } else {
                window.components.renderEmptyState(containerId, 'No projects found', 'Update your profile and skills to get personalized project recommendations.');
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            window.components.renderErrorState(containerId, 'Unable to load recommendations', projectsModule.loadData);
        }
    },

    renderCards: (items) => {
        const container = document.getElementById('projects-container');
        
        let html = '<div class="grid grid-cols-3 gap-4">';
        
        items.forEach(item => {
            const title = item.title || 'Untitled Project';
            const duration = item.estimatedDuration || 'TBD';
            const diff = (item.difficulty || 'Beginner').toLowerCase();
            const reason = item.recommendationReason || '';
            const tech = (item.technologies || item.technology || []);
            const skills = (item.learningOutcomes || item.skillsDeveloped || []);
            const oppId = item._id ? String(item._id) : '';

            // Display up to 3 technologies
            const techHtml = tech.slice(0, 3).map(s => 
                `<span style="font-size: 0.75rem; color: var(--accent); display: flex; align-items: center; gap: 0.25rem;">
                    <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> ${s}
                </span>`
            ).join('');

            // Display up to 2 skills
            const skillHtml = skills.slice(0, 2).map(s => 
                `<span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;">
                    <svg style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${s}
                </span>`
            ).join('');

            let diffLevel = 1;
            if (diff === 'intermediate') diffLevel = 2;
            if (diff === 'advanced') diffLevel = 3;
            
            const diffColor = diffLevel === 1 ? 'var(--success)' : diffLevel === 2 ? 'var(--warning)' : 'var(--danger)';

            html += `
                <div class="card project-card" data-id="${oppId}" style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <div>
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">${title}</h3>
                            <div style="font-size: 0.875rem; color: ${diffColor}; display: flex; align-items: center; gap: 0.25rem; text-transform: capitalize; font-weight: 600;">
                                ${diff}
                            </div>
                        </div>
                    </div>

                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 1rem;">
                        Project · Est. ${duration}
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem;">
                        ${techHtml}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
                        ${skillHtml}
                    </div>

                    ${reason ? `
                        <div style="font-size: 0.75rem; color: var(--text-secondary); padding: 0.5rem; background: var(--primary-bg); border-radius: var(--border-radius-sm); margin-bottom: 1rem;">
                            <strong>Why?</strong> ${reason}
                        </div>
                    ` : ''}

                    <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary" onclick="window.components.showToast('info', 'Opening project details...')" style="flex: 1;">View Details</button>
                        <button class="btn btn-outline" onclick="window.components.showToast('success', 'Project saved!')">Save ☆</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', projectsModule.init);
