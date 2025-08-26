import React, { useState, useEffect } from 'react';

const WorkloadAnalysis = ({ projectId }) => {
    const [workloadData, setWorkloadData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiCall = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token non trouvé');
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error('Erreur API');
        }

        return response.json();
    };

    const fetchWorkloadData = async () => {
        try {
            const data = await apiCall(`http://localhost:8000/api/task-assignment/workload-analysis?projectId=${projectId}`);
            setWorkloadData(data.workloadData);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchWorkloadData();
        }
    }, [projectId]);

    const getWorkloadStatus = (taskCount) => {
        if (taskCount === 0) return { status: 'libre', color: '#10b981' };
        if (taskCount <= 2) return { status: 'normal', color: '#3b82f6' };
        if (taskCount <= 4) return { status: 'chargé', color: '#f59e0b' };
        return { status: 'surchargé', color: '#ef4444' };
    };

    if (loading) {
        return (
            <div className="workload-analysis">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Analyse de la charge...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="workload-analysis">
                <div className="error-message">
                    <h4>Erreur d'analyse</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="workload-analysis">
            <h4>Analyse de la charge de travail</h4>
            
            <div className="workload-summary">
                <div className="summary-stats">
                    <div className="stat-card">
                        <span className="stat-number">{workloadData.length}</span>
                        <span className="stat-label">Membres d'équipe</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {workloadData.reduce((total, user) => total + user.taskCount, 0)}
                        </span>
                        <span className="stat-label">Tâches totales</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {workloadData.filter(user => user.taskCount === 0).length}
                        </span>
                        <span className="stat-label">Membres libres</span>
                    </div>
                </div>
            </div>

            <div className="workload-grid">
                {workloadData.map(user => {
                    const workloadStatus = getWorkloadStatus(user.taskCount);
                    return (
                        <div key={user.userId} className="user-workload-card">
                            <div className="user-info">
                                <h5>{user.firstname} {user.lastname}</h5>
                                <p className="user-email">{user.email}</p>
                            </div>
                            
                            <div className="workload-status">
                                <div 
                                    className="status-indicator"
                                    style={{ backgroundColor: workloadStatus.color }}
                                >
                                    {workloadStatus.status}
                                </div>
                                <span className="task-count">
                                    {user.taskCount} tâche{user.taskCount > 1 ? 's' : ''}
                                </span>
                            </div>

                            {user.skills && user.skills.length > 0 && (
                                <div className="user-skills">
                                    <h6>Compétences:</h6>
                                    <div className="skills-list">
                                        {user.skills.map(skill => (
                                            <span key={skill.id} className="skill-badge">
                                                {skill.name} (N{skill.level})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {workloadData.length === 0 && (
                <div className="no-data">
                    <p>Aucune donnée de charge disponible</p>
                </div>
            )}
        </div>
    );
};

export default WorkloadAnalysis;
