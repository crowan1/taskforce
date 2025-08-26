import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';

const CreateTaskModal = ({ onClose, onCreateTask, project }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: '',
        skillIds: []
    });
    const [skills, setSkills] = useState([]);
    const [columns, setColumns] = useState([]);
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Général', level: 1 });
    const [showAddSkill, setShowAddSkill] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Le titre est requis');
            return;
        }
        onCreateTask(formData);
    };

    const fetchSkills = async () => {
        try {
            const data = await dashboardServices.getSkills();
            setSkills(data.skills);
        } catch (err) {
            console.error('Erreur lors du chargement des compétences:', err);
        }
    };

    const fetchColumns = async () => {
        try {
            const data = await dashboardServices.getColumns(project.id);
            setColumns(data.columns);
            // Définir le statut par défaut sur la première colonne
            if (data.columns.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    status: data.columns[0].identifier
                }));
            }
        } catch (err) {
            console.error('Erreur lors du chargement des colonnes:', err);
        }
    };

    useEffect(() => {
        fetchSkills();
        fetchColumns();
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleSkill = (skillId) => {
        setFormData(prev => ({
            ...prev,
            skillIds: prev.skillIds.includes(skillId)
                ? prev.skillIds.filter(id => id !== skillId)
                : [...prev.skillIds, skillId]
        }));
    };

    const createSkill = async () => {
        try {
            const data = await dashboardServices.createSkill(newSkill);
            setSkills(prev => [...prev, data.skill]);
            setFormData(prev => ({
                ...prev,
                skillIds: [...prev.skillIds, data.skill.id]
            }));
            setNewSkill({ name: '', category: 'Général', level: 1 });
            setShowAddSkill(false);
        } catch (err) {
            console.error('Erreur lors de la création de la compétence:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Créer une nouvelle tâche</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title">Titre *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Titre de la tâche"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description de la tâche"
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority">Priorité</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="low">Basse</option>
                                <option value="medium">Moyenne</option>
                                <option value="high">Haute</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Statut initial</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {columns.map(column => (
                                    <option key={column.id} value={column.identifier}>
                                        {column.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Compétences requises</label>
                        <div className="skills-list">
                            {skills.map(skill => (
                                <label key={skill.id} className="skill-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.skillIds.includes(skill.id)}
                                        onChange={() => toggleSkill(skill.id)}
                                    />
                                    <span className="skill-name">{skill.name}</span>
                                    <span className="skill-category">({skill.category})</span>
                                </label>
                            ))}
                            <button 
                                type="button" 
                                className="btn-add-skill"
                                onClick={() => setShowAddSkill(true)}
                            >
                                + Ajouter une compétence
                            </button>
                        </div>
                    </div>

                    {showAddSkill && (
                        <div className="add-skill-form">
                            <h4>Créer une nouvelle compétence</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nom de la compétence</label>
                                    <input
                                        type="text"
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Ex: JavaScript, Design..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Catégorie</label>
                                    <select
                                        value={newSkill.category}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option value="Général">Général</option>
                                        <option value="Développement">Développement</option>
                                        <option value="Design">Design</option>
                                        <option value="Gestion">Gestion</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Niveau</label>
                                    <select
                                        value={newSkill.level}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                                    >
                                        <option value={1}>1 - Débutant</option>
                                        <option value={2}>2 - Intermédiaire</option>
                                        <option value={3}>3 - Avancé</option>
                                        <option value={4}>4 - Expert</option>
                                        <option value={5}>5 - Maître</option>
                                    </select>
                                </div>
                            </div>
                            <div className="skill-actions">
                                <button type="button" onClick={createSkill} disabled={!newSkill.name.trim()}>
                                    Créer
                                </button>
                                <button type="button" onClick={() => setShowAddSkill(false)}>
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-create">
                            Créer la tâche
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
