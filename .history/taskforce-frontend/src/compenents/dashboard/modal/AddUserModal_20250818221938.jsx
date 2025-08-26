import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';

const AddUserModal = ({ onClose, onAddUser, projectId, projectUsers = [] }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await dashboardServices.addUserToProject(projectId, email, role);
            onAddUser(data.user);
            setEmail('');
            setRole('member');
            setError(null);
        } catch (err) {
            console.error('Erreur ajout utilisateur:', err);
            setError(err.message || 'Erreur lors de l\'ajout de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const data = await dashboardServices.getUsers();
            setAvailableUsers(data.users);
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs:', err);
        }
    };

    useEffect(() => {
        fetchAvailableUsers();
    }, []);

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setShowSuggestions(value.length > 0);
    };

    const selectUser = (userEmail) => {
        setEmail(userEmail);
        setShowSuggestions(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Ajouter un utilisateur au projet</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Utilisateurs déjà dans le projet</label>
                        <div className="project-users-list">
                            {projectUsers.length > 0 ? (
                                projectUsers.map(user => (
                                    <div key={user.id} className="project-user-item">
                                        <span className="user-name">{user.firstname} {user.lastname}</span>
                                        <span className="user-email">{user.email}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-users">Aucun utilisateur dans ce projet</p>
                            )}
                        </div>
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="email">Ajouter un nouvel utilisateur *</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="exemple@email.com"
                            required
                        />
                        {showSuggestions && (
                            <div className="user-suggestions">
                                {availableUsers
                                    .filter(user => 
                                        user.email.toLowerCase().includes(email.toLowerCase()) &&
                                        !projectUsers.some(pu => pu.id === user.id)
                                    )
                                    .map(user => (
                                        <div 
                                            key={user.id} 
                                            className="user-suggestion"
                                            onClick={() => selectUser(user.email)}
                                        >
                                            <span className="user-name">{user.firstname} {user.lastname}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                        <small className="form-help">
                            Tapez pour voir les suggestions d'utilisateurs
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Rôle de l'utilisateur</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-control"
                        >
                            <option value="member">Membre</option>
                            <option value="admin">Administrateur</option>
                        </select>
                        <small className="form-help">
                            Les administrateurs peuvent ajouter/supprimer des utilisateurs et modifier les rôles
                        </small>
                    </div>

                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-create" disabled={loading}>
                            {loading ? 'Ajout en cours...' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
