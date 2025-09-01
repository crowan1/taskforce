import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';

const AddUserModal = ({ isOpen, onClose, projectId, onUserAdded }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('collaborateur');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await dashboardServices.addUserToProject(projectId, email, role);
            onUserAdded(data.user);
            setEmail('');
            setRole('collaborateur');
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Ajouter un utilisateur au projet</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email de l'utilisateur</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@email.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Rôle de l'utilisateur</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="collaborateur">collaborateur</option>
                                <option value="manager">Manager</option>
                                <option value="responsable_projet">Responsable de Projet</option>
                            </select>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-confirm" disabled={loading}>
                                {loading ? 'Ajout en cours..' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;
