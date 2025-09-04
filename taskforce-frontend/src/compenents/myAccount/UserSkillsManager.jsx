import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';
import '../../assets/styles/compenents/MyAccount/UserSkillsManager.scss';

const UserSkillsManager = () => {
    const [userSkills, setUserSkills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userSkillsData = await dashboardServices.getUserSkills();
            setUserSkills(userSkillsData.skills || []);
        } catch (err) {
            setError('Erreur lors du chargement des compétences');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.name) return;

        try {
            const response = await dashboardServices.addUserSkill(newSkill);
            setUserSkills(prev => [...prev, response.userSkill]);
            setNewSkill({ name: '', description: '' });
            setShowAddSkill(false);
        } catch (err) {
            setError('Erreur lors de la création de la compétence');
        }
    };

    const handleDeleteSkill = async (skillId) => {
        if (!window.confirm('voulez vous supprimer cette compétence ?')) {
            return;
        }

        try {
            await dashboardServices.deleteUserSkill(skillId);
            setUserSkills(prev => prev.filter(skill => skill.id !== skillId));
        } catch (err) {
            setError('Erreur lors de la suppression de la compétence');
        }
    };

    if (loading) {
        return (
            <div className="user-skills-manager">
                <div className="loading-spinner"></div>
                <p>Chargement des compétences...</p>
            </div>
        );
    }

    return (
        <div className="user-skills-manager">
            <div className="skills-header">
                <h3>Mes Compétences</h3>
                <button 
                    className="btn-add-skill"
                    onClick={() => setShowAddSkill(true)}
                >
                    + Créer une compétence
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {showAddSkill && (
                <div className="add-skill-modal">
                    <div className="modal-content">
                        <h4>Créer une nouvelle compétence</h4>
                        <form onSubmit={handleAddSkill}>
                            <div className="form-group">
                                <label>Nom de la compétence</label>
                                <input 
                                    type="text"
                                    value={newSkill.name}
                                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Développement React, Design UI/UX, API REST..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (optionnel)</label>
                                <textarea 
                                    value={newSkill.description}
                                    onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Décrivez votre expérience dans ce domaine..."
                                    rows="3"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Ajouter
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => setShowAddSkill(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="skills-list">
                {userSkills.length === 0 ? (
                    <div className="no-skills">
                        <p>Aucune compétence ajoutée</p>
                        <p>Ajoutez vos compétences pour permettre l'assignation automatique des tâches</p>
                    </div>
                ) : (
                    userSkills.map(userSkill => (
                        <div key={userSkill.id} className="skill-item">
                            <div className="skill-info">
                                <h4>{userSkill.name}</h4>
                                <p>{userSkill.description}</p>
                            </div>

                            <button 
                                className="btn-delete-skill"
                                onClick={() => handleDeleteSkill(userSkill.id)}
                                title="Supprimer cette compétence"
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>

            {userSkills.length > 0 && (
                <div className="skills-info">
                    <p>
                        <strong>Note :</strong> Vos compétences sont utilisées pour l'assignation automatique des tâches. 
                        Plus vos compétences correspondent aux exigences d'une tâche, plus vous avez de chances d'être assigné.
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserSkillsManager;
