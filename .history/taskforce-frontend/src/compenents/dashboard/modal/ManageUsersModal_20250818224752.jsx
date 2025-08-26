import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';

const ManageUsersModal = ({ onClose, project, onUserUpdated }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (project) {
            setUsers(project.users || []);
            // Trouver le rôle de l'utilisateur actuel
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const currentUserInProject = project.users?.find(u => u.id === currentUser.id);
            setCurrentUserRole(currentUserInProject?.role);
        }
    }, [project]);

    useEffect(() => {
        if (showAddUser) {
            fetchAvailableUsers();
        }
    }, [showAddUser]);

    const fetchAvailableUsers = async () => {
        try {
            const data = await dashboardServices.getUsers();
            setAvailableUsers(data.users);
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs:', err);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
    };

    const selectUser = (userEmail) => {
        setEmail(userEmail);
        setShowSuggestions(false);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await dashboardServices.addUserToProject(project.id, email, role);
            setUsers(prev => [...prev, data.user]);
            setEmail('');
            setRole('member');
            setShowAddUser(false);
            if (onUserUpdated) {
                onUserUpdated();
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setLoading(true);
        setError(null);

        try {
            await dashboardServices.updateUserRole(project.id, userId, newRole);
            
            // Mettre à jour la liste locale
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
            
            // Notifier le parent
            if (onUserUpdated) {
                onUserUpdated();
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification du rôle');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur du projet ?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await dashboardServices.removeUserFromProject(project.id, userId);
            
            // Mettre à jour la liste locale
            setUsers(prev => prev.filter(user => user.id !== userId));
            
            // Notifier le parent
            if (onUserUpdated) {
                onUserUpdated();
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    const isCurrentUser = (userId) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        return currentUser && currentUser.id === userId;
    };

    const isCreator = (userId) => {
        return project.createdBy && project.createdBy.id === userId;
    };

    const isAdmin = currentUserRole === 'admin';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Gérer les utilisateurs du projet</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="users-list">
                        {users.length > 0 ? (
                            users.map(user => (
                                <div key={user.id} className="user-item">
                                    <div className="user-info">
                                        <div className="user-name">
                                            {user.firstname} {user.lastname}
                                        </div>
                                        <div className="user-email">{user.email}</div>
                                        <div className="user-role">
                                            <span className={`role-badge role-${user.role}`}>
                                                {user.role === 'admin' ? '👑 Administrateur' : '👤 Membre'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && (
                                        <div className="user-actions">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={loading}
                                                className="role-select"
                                            >
                                                <option value="member">Membre</option>
                                                <option value="admin">Administrateur</option>
                                            </select>
                                            
                                            <button
                                                onClick={() => handleRemoveUser(user.id)}
                                                disabled={loading}
                                                className="btn-remove-user"
                                                title="Supprimer de ce projet"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-users">Aucun utilisateur dans ce projet</p>
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="info-message">
                            Seuls les administrateurs peuvent modifier les rôles et supprimer des utilisateurs.
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn-secondary" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageUsersModal;
