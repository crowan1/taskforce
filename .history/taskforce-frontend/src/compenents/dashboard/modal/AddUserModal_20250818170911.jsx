import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';

const AddUserModal = ({ onClose, onAddUser, projectId }) => {
    const [email, setEmail] = useState('');
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
            const data = await dashboardServices.addUserToProject(projectId, email);
            onAddUser(data.user);
            onClose();
        } catch (err) {
            setError(err.message);
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
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="email">Email de l'utilisateur *</label>
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
                                        user.email.toLowerCase().includes(email.toLowerCase())
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
