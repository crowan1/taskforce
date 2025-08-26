import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';

const AddSkillsModal = ({ onClose, onAddSkills, taskId }) => {
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const data = await dashboardServices.getSkills();
            setSkills(data.skills);
        } catch (err) {
            console.error('Erreur lors du chargement des compétences:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSkills.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            await dashboardServices.addSkillsToTask(taskId, selectedSkills);
            onAddSkills(selectedSkills);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSkill = (skillId) => {
        setSelectedSkills(prev => 
            prev.includes(skillId) 
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Ajouter des compétences à la tâche</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Sélectionner les compétences requises</label>
                        <div className="skills-list">
                            {skills.map(skill => (
                                <label key={skill.id} className="skill-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill.id)}
                                    />
                                    <span className="skill-name">{skill.name}</span>
                                    <span className="skill-category">({skill.category})</span>
                                </label>
                            ))}
                        </div>
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
                        <button type="submit" className="btn-create" disabled={loading || selectedSkills.length === 0}>
                            {loading ? 'Ajout en cours...' : `Ajouter ${selectedSkills.length} compétence(s)`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSkillsModal;
