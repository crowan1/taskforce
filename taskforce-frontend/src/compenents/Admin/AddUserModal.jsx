import React, { useState } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';

const AddUserModal = ({ isOpen, onClose, projectId, onUserAdded }) => {
    const [newUser, setNewUser] = useState({
        email: '',
        role: '',
        message: ''
    });
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [addUserError, setAddUserError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newUser.email || !newUser.role) {
            setAddUserError('Email et rôle sont requis');
            return;
        }
        
        setAddUserLoading(true);
        setAddUserError('');
        
        try {
            const response = await dashboardServices.addUserToProject(projectId, newUser.email, newUser.role);
            
            if (response.success) {
                onUserAdded();
                
                setNewUser({ email: '', role: '', message: '' });
            } else {
                setAddUserError(response.error || 'Erreur lors de l\'ajout de l\'utilisateur');
            }
        } catch (err) {
            setAddUserError(err.message || 'Erreur lors de l\'ajout de l\'utilisateur');
        } finally {
            setAddUserLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content add-user-modal">
                <div className="modal-header">
                    <h2>Ajouter un utilisateur au projet</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="add-user-form">
                    <div className="form-group">
                        <label htmlFor="email">Email de l'utilisateur *</label>
                        <input
                            type="email"
                            id="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            placeholder="exemple@email.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="role">Rôle dans le projet *</label>
                        <select
                            id="role"
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            required
                        >
                            <option value="">Sélectionner un rôle</option>
                            <option value="collaborateur">Collaborateur</option>
                            <option value="manager">Manager</option>
                            <option value="responsable_projet">Responsable de Projet</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="message">Message d'invitation (optionnel)</label>
                        <textarea
                            id="message"
                            value={newUser.message}
                            onChange={(e) => setNewUser({...newUser, message: e.target.value})}
                            placeholder="Message personnalisé pour l'invitation..."
                            rows="3"
                        />
                    </div>
                    
                    {addUserError && (
                        <div className="error-message">{addUserError}</div>
                    )}
                    
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary" disabled={addUserLoading}>
                            {addUserLoading ? 'Ajout...' : 'Ajouter l\'utilisateur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
