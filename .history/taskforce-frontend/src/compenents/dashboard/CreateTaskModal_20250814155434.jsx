import React, { useState, useEffect } from 'react';

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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/skills', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSkills(data.skills);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des compétences:', err);
        }
    };

    const fetchColumns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/columns?projectId=${project.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setColumns(data.columns);
                // Définir le statut par défaut sur la première colonne
                if (data.columns.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        status: data.columns[0].identifier
                    }));
                }
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
                        </div>
                    </div>

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
