import React, { useEffect, useState } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';

const OverviewTab = ({ projectTasks, projectUsers, onCreateTask, onAddUser, onNavigateToDashboard, selectedProject, mode }) => {
    const [alerts, setAlerts] = useState({ overdueTasks: [], overloadedUsers: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAlerts = async () => {
            if (mode !== 'alerts' || !selectedProject?.id) return;
            try {
                setLoading(true);
                const data = await dashboardServices.getProjectAlerts(selectedProject.id);
                setAlerts({
                    overdueTasks: data.overdueTasks || [],
                    overloadedUsers: data.overloadedUsers || []
                });
            } catch (error) {
                setAlerts({ overdueTasks: [], overloadedUsers: [] });
            } finally {
                setLoading(false);
            }
        };
        loadAlerts();
    }, [mode, selectedProject]);

    if (mode === 'alerts') {
        return (
            <div className="alerts-tab">
                <h3>Alertes & Notifications</h3>
                {loading && <p>Chargement...</p>}

                <div className="alerts-section">
                    <h4>Tâches en retard</h4>
                    {alerts.overdueTasks?.length === 0 ? (
                        <p>Aucune tâche en retard</p>
                    ) : (
                           <div className="alert-list">
                               {alerts.overdueTasks.map(t => (
                                   <div key={t.id} className="alert-item overdue-task">
                                       <div className="alert-content">
                                           <div className="alert-title">
                                               Tâche en retard : <strong>"{t.title}"</strong>
                                           </div>
                                           <div className="alert-details">
                                               Attribuée à : <strong>{t.assignedTo ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}` : 'Non assigné'}</strong>
                                               <br />
                                               Échéance dépassée : {new Date(t.dueDate).toLocaleDateString('fr-FR', {
                                                   day: '2-digit',
                                                   month: '2-digit', 
                                                   year: 'numeric',
                                                   hour: '2-digit',
                                                   minute: '2-digit'
                                               })}
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                    )}
                </div>

                <div className="alerts-section">
                    <h4>Utilisateurs en surcharge</h4>
                    {alerts.overloadedUsers?.length === 0 ? (
                        <p>Aucune surcharge détectée</p>
                    ) : (
                        <div className="alert-list">
                            {alerts.overloadedUsers.map(u => (
                                <div key={u.userId} className="alert-item user-overload">
                                    <div className="alert-content">
                                        <div className="alert-title">{u.userName}</div>
                                        <div className="alert-details">
                                            {u.userEmail} • {u.taskCount} tâche{u.taskCount > 1 ? 's' : ''} • 
                                            {u.totalHours}h / {u.maxWorkloadHours}h ({u.workloadPercentage}%)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
