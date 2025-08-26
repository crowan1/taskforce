import React, { useState, useEffect, useRef } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';
import '../../../assets/styles/Dashboard.scss';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId }) => {
    const isSubmitting = useRef(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: '',
        skillIds: [],
        level: 'intermediate'
    });
    const [skills, setSkills] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCreateSkill, setShowCreateSkill] = useState(false);
    const [newSkill, setNewSkill] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, projectId]);

    const fetchData = async () => {
        try {
            const [skillsData, columnsData] = await Promise.all([
                dashboardServices.getSkills(),
                dashboardServices.getColumns(projectId)
            ]);
            

            
            setSkills(skillsData.skills || skillsData || []);
            setColumns(columnsData.columns || columnsData || []);
            
            const columnsArray = columnsData.columns || columnsData || [];
            if (columnsArray.length > 0) {
                setFormData(prev => ({ ...prev, status: columnsArray[0].identifier }));
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Protection contre la double soumission
        if (loading || isSubmitting.current) {
            return;
        }
        
        isSubmitting.current = true;
        setLoading(true);
        setError('');

        try {
            const taskData = {
                ...formData,
                projectId: parseInt(projectId)
            };
            
            const response = await dashboardServices.createTask(taskData);
            
            // Vérifier que la tâche a bien été créée avant d'appeler onTaskCreated
            if (response.success && response.task) {
                onTaskCreated(response.task);
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: '',
                    skillIds: [],
                    level: 'intermediate'
                });
                onClose();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            isSubmitting.current = false;
        }
    };

    const handleCreateSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.name) {
            setError('Le nom de la compétence est requis');
            return;
        }

        try {
            const skillData = {
                name: newSkill.name,
                description: newSkill.description
            };
            
            const response = await dashboardServices.createSkill(skillData);
            const createdSkill = response.skill;
            setSkills(prev => [...prev, createdSkill]);
            setFormData(prev => ({
                ...prev,
                skillIds: [...prev.skillIds, createdSkill.id]
            }));
            
            setNewSkill({ name: '', description: '' });
            setShowCreateSkill(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSkillChange = (skillId) => {
        setFormData(prev => ({
            ...prev,
            skillIds: prev.skillIds.includes(skillId)
                ? prev.skillIds.filter(id => id !== skillId)
                : [...prev.skillIds, skillId]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Créer une tâche</h2>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
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
                            required
                            placeholder="Titre de la tâche..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description de la tâche..."
                            rows="3"
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
                            <label htmlFor="level">Niveau requis</label>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                            >
                                <option value="beginner">Débutant</option>
                                <option value="intermediate">Intermédiaire</option>
                                <option value="advanced">Avancé</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Statut</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            {Array.isArray(columns) && columns.map(column => (
                                <option key={column.id} value={column.identifier}>
                                    {column.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Compétences requises</label>
                        <div className="skills-labels-container">
                            {Array.isArray(skills) && skills.map(skill => {
                                const isSelected = formData.skillIds.includes(skill.id);
                                
                                return (
                                    <div
                                        key={skill.id}
                                        className={`skill-label ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSkillChange(skill.id)}
                                    >
                                        <span className="skill-label-name">{skill.name}</span>
                                        {isSelected && (
                                            <span className="skill-label-check">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {formData.skillIds.length === 0 && (
                            <p className="no-skills-selected">
                                Aucune compétence sélectionnée. Cliquez sur les étiquettes pour les sélectionner.
                            </p>
                        )}
                        
                        {formData.skillIds.length > 0 && (
                            <div className="selected-skills-summary">
                                <span className="selected-count">
                                    {formData.skillIds.length} compétence{formData.skillIds.length > 1 ? 's' : ''} sélectionnée{formData.skillIds.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        
                        <button
                            type="button"
                            className="btn-add-skill"
                            onClick={() => setShowCreateSkill(!showCreateSkill)}
                        >
                            {showCreateSkill ? 'Annuler' : '+ Ajouter une compétence'}
                        </button>

                        {showCreateSkill && (
                            <div className="add-skill-form">
                                <h4>Créer une nouvelle compétence</h4>
                                <div className="form-group">
                                    <label>Nom *</label>
                                    <input
                                        type="text"
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nom de la compétence..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newSkill.description}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Description de la compétence..."
                                        rows="2"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleCreateSkill}
                                >
                                    Créer la compétence
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Création...' : 'Créer la tâche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
