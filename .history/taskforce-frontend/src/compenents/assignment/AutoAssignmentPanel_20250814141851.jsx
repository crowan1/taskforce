import React, { useState } from 'react';
import WorkloadAnalysis from './WorkloadAnalysis';

const AutoAssignmentPanel = ({ projectId, onAssignmentComplete }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showWorkload, setShowWorkload] = useState(false);

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

    const handleAutoAssignAll = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await apiCall('http://localhost:8000/api/task-assignment/auto-assign-all', {
                method: 'POST',
                body: JSON.stringify({ projectId })
            });

            setResult(data);
            if (onAssignmentComplete) {
                onAssignmentComplete();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAssignSingle = async (taskId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await apiCall(`http://localhost:8000/api/task-assignment/auto-assign/${taskId}`, {
                method: 'POST'
            });

            setResult(data);
            if (onAssignmentComplete) {
                onAssignmentComplete();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auto-assignment-panel">
            <div className="panel-header">
                <h3>Assignation Automatique</h3>
                <p>Répartition intelligente des tâches basée sur les compétences</p>
            </div>

            <div className="assignment-actions">
                <button 
                    className="btn-auto-assign-all"
                    onClick={handleAutoAssignAll}
                    disabled={loading}
                >
                    {loading ? 'Assignation en cours...' : 'Assigner toutes les tâches'}
                </button>

                <button 
                    className="btn-workload-analysis"
                    onClick={() => setShowWorkload(!showWorkload)}
                >
                    {showWorkload ? 'Masquer' : 'Afficher'} l'analyse de charge
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <h4>Erreur d'assignation</h4>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="assignment-result">
                    <h4>Résultat de l'assignation</h4>
                    <div className="result-stats">
                        <div className="stat-item">
                            <span className="stat-label">Tâches assignées:</span>
                            <span className="stat-value">{result.totalAssigned}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Erreurs:</span>
                            <span className="stat-value">{result.totalErrors}</span>
                        </div>
                    </div>

                    {result.assignments && result.assignments.length > 0 && (
                        <div className="assignments-list">
                            <h5>Tâches assignées:</h5>
                            <ul>
                                {result.assignments.map((assignment, index) => (
                                    <li key={index}>
                                        <strong>{assignment.taskTitle}</strong> → 
                                        {assignment.assignedTo.firstname} {assignment.assignedTo.lastname}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.errors && result.errors.length > 0 && (
                        <div className="errors-list">
                            <h5>Erreurs:</h5>
                            <ul>
                                {result.errors.map((error, index) => (
                                    <li key={index}>
                                        <strong>{error.taskTitle}</strong> - {error.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {showWorkload && (
                <WorkloadAnalysis projectId={projectId} />
            )}
        </div>
    );
};

export default AutoAssignmentPanel;
