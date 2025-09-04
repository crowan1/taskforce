import React, { useState } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';

const ReassignTaskModal = ({ isOpen, onClose, task, projectUsers, projectTasks, onTaskReassigned }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUserSelection = (user) => {
        setSelectedUser(user);
    };

    const handleConfirmReassign = async () => {
        if (!selectedUser) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await dashboardServices.updateTask(task.id, {
                assignedTo: selectedUser.id
            });
            
            if (response.success) {
                onTaskReassigned();
            } else {
                setError('Erreur lors de la réassignation');
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la réassignation');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content reassign-modal">
                <div className="modal-header">
                    <h2>Réassigner la tâche</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <div className="task-info">
                    <h3>{task.title}</h3>
                    <p><strong>Actuellement assignée à :</strong> {
                        task.assignedTo ? 
                            (typeof task.assignedTo === 'object' ? 
                                `${task.assignedTo.firstname} ${task.assignedTo.lastname}` : 
                                task.assignedTo
                            ) : 
                            'Personne'
                    }</p>
                </div>

                <div className="reassign-section">
                    <h4>Choisir un nouvel assigné :</h4>
                    <div className="users-list">
                        {projectUsers
                            .filter(user => user.role === 'collaborateur' || user.role === 'Collaborateur')
                            .map(user => (
                                <div 
                                    key={user.id} 
                                    className={`user-option ${selectedUser && selectedUser.id === user.id ? 'selected' : ''} ${
                                        task.assignedTo && 
                                        (typeof task.assignedTo === 'object' ? 
                                            task.assignedTo.id === user.id : 
                                            task.assignedTo === user.id
                                        ) ? 'currently-assigned' : ''
                                    }`}
                                    onClick={() => handleUserSelection(user)}
                                >
                                    <div className="user-info">
                                        <strong>{user.firstname} {user.lastname}</strong>
                                        <span className="user-email">{user.email}</span>
                                        {selectedUser && selectedUser.id === user.id && (
                                            <span className="selection-indicator">✅ Sélectionné</span>
                                        )}
                                    </div>
                                    <div className="user-skills">
                                        {user.skills && user.skills.length > 0 ? (
                                            user.skills.map(skill => (
                                                <span key={skill.id} className="skill-tag">
                                                    {skill.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="no-skills">Aucune compétence</span>
                                        )}
                                    </div>
                                    <div className="user-workload">
                                        <span className="workload-label">Tâches actuelles :</span>
                                        <span className="workload-number">
                                            {projectTasks.filter(task => 
                                                task.assignedTo && 
                                                (typeof task.assignedTo === 'object' ? 
                                                    task.assignedTo.id === user.id : 
                                                    task.assignedTo === user.id
                                                )
                                            ).length}
                                        </span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                    <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={handleConfirmReassign}
                        disabled={!selectedUser || loading}
                    >
                        {loading ? 'Réassignation...' : 'Confirmer la réassignation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReassignTaskModal;
