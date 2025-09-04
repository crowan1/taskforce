import React from 'react';

const OverviewTab = ({ projectTasks, projectUsers, onCreateTask, onAddUser, onNavigateToDashboard }) => {
    return (
        <div className="overview-tab">
            <div className="overview-grid">
                <div className="overview-card">
                    <h3>Chiffres clés du projet </h3>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-number">{projectTasks.length}</span>
                            <span className="stat-label">Tâches</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{projectUsers.length}</span>
                            <span className="stat-label">Utilisateurs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
