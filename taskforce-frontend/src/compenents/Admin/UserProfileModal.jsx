import React, { useState } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';

const UserProfileModal = ({ isOpen, onClose, user, projectId, projectUsers, projectTasks, onUserUpdated }) => {
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRoleChange = async () => {
        if (selectedRole === user.role) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await dashboardServices.updateUserRole(projectId, user.id, selectedRole);

            if (response.success) {
                setSuccess('Rôle mis à jour avec succès');
                onUserUpdated();
            } else {
                setError(response.error || 'Erreur lors de la mise à jour du rôle');
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour du rôle');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTask = async (taskId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

        setLoading(true);
        setError('');

        try {
            const response = await dashboardServices.deleteTask(taskId);

            if (response.success) {
                setSuccess('Tâche supprimée avec succès');
                onUserUpdated();
            } else {
                setError(response.error || 'Erreur lors de la suppression de la tâche');
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression de la tâche');
        } finally {
            setLoading(false);
        }
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'responsable_projet':
                return 'Responsable de Projet';
            case 'manager':
                return 'Manager';
            case 'collaborateur':
                return 'Collaborateur';
            default:
                return role;
        }
    };

    const userTasks = projectTasks.filter(task =>
        task.assignedTo &&
        (typeof task.assignedTo === 'object' ?
            task.assignedTo.id === user.id :
            task.assignedTo === user.id
        )
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content user-profile-modal">
                <div className="modal-header">
                    <h2>Profil de {user.firstname} {user.lastname}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="user-profile-content">
                    <div className="user-info-section">
                        <div className="user-basic-info">
                            <h3>Informations personnelles</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Nom complet:</label>
                                    <span>{user.firstname} {user.lastname}</span>
                                </div>
                                <div className="info-item">
                                    <label>Email:</label>
                                    <span>{user.email}</span>
                                </div>
                                <div className="info-item">
                                    <label>Rôle actuel:</label>
                                    <span className={`role-badge role-${user.role}`}>
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label>Date d'adhésion:</label>
                                    <span>{new Date(user.joinedAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="user-role-management">
                            <h3>Gestion du rôle</h3>
                            <div className="role-selector">
                                <label htmlFor="role-select">Changer le rôle:</label>
                                <select
                                    id="role-select"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="collaborateur">Collaborateur</option>
                                    <option value="manager">Manager</option>
                                    <option value="responsable_projet">Responsable de Projet</option>
                                </select>
                                <button
                                    className="btn-primary"
                                    onClick={handleRoleChange}
                                    disabled={loading || selectedRole === user.role}
                                >
                                    {loading ? 'Mise à jour...' : 'Mettre à jour le rôle'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="user-skills-section">
                        <h3>Compétences</h3>
                        <div className="skills-list">
                            {user.skills && user.skills.length > 0 ? (
                                user.skills.map(skill => (
                                    <span key={skill.id} className="skill-tag">
                                        {skill.name}
                                    </span>
                                ))
                            ) : (
                                <p className="no-skills">Aucune compétence définie</p>
                            )}
                        </div>
                    </div>

                    <div className="user-tasks-section">
                        <h3>Tâches assignées ({userTasks.length})</h3>
                        {userTasks.length === 0 ? (
                            <p className="no-tasks">Aucune tâche assignée</p>
                        ) : (
                            <div className="tasks-list">
                                {userTasks.map(task => (
                                    <div key={task.id} className="task-item">
                                        <div className="task-header">
                                            <h4>{task.title}</h4>
                                            <span className={`priority priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <p className="task-description">{task.description || 'Aucune description'}</p>
                                        <div className="task-meta">
                                            <span className="task-status">Statut: {task.status}</span>
                                            <span className="task-created">
                                                Créée le: {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="task-actions">
                                            <button
                                                className="btn-danger btn-small"
                                                onClick={() => handleRemoveTask(task.id)}
                                                disabled={loading}
                                                title="Supprimer cette tâche"
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="user-stats-section">
                        <h3>Statistiques</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number">{userTasks.length}</span>
                                <span className="stat-label">Tâches assignées</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">
                                    {userTasks.filter(task => task.status === 'completed').length}
                                </span>
                                <span className="stat-label">Tâches terminées</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">
                                    {user.skills ? user.skills.length : 0}
                                </span>
                                <span className="stat-label">Compétences</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
