import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';
import '../../../assets/styles/Dashboard.scss';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: '',
        skillIds: []
    });
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCreateSkill, setShowCreateSkill] = useState(false);
    const [newSkill, setNewSkill] = useState({
        name: '',
        description: '',
        categoryId: '',
        level: 1
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, projectId]);

    const fetchData = async () => {
        try {
            const [skillsData, categoriesData, columnsData] = await Promise.all([
                dashboardServices.getSkills(),
                dashboardServices.getCategories(),
                dashboardServices.getColumns(projectId)
            ]);
            
            setSkills(skillsData.skills || skillsData || []);
            setCategories(categoriesData || []);
            setColumns(columnsData.columns || columnsData || []);
            
            if (columnsData.length > 0) {
                setFormData(prev => ({ ...prev, status: columnsData[0].identifier }));
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const taskData = {
                ...formData,
                projectId: parseInt(projectId)
            };
            
            const newTask = await dashboardServices.createTask(taskData);
            onTaskCreated(newTask);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                status: '',
                skillIds: []
            });
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.name || !newSkill.categoryId) {
            setError('Le nom et la catégorie sont requis');
            return;
        }

        try {
            const category = categories.find(c => c.id === parseInt(newSkill.categoryId));
            if (!category) {
                setError('Catégorie non trouvée');
                return;
            }
            const skillData = {
                name: newSkill.name,
                description: newSkill.description,
                categoryId: category.id,
                level: newSkill.level
            };
            
            const response = await dashboardServices.createSkill(skillData);
            const createdSkill = response.skill;
            setSkills(prev => [...prev, createdSkill]);
            setFormData(prev => ({
                ...prev,
                skillIds: [...prev.skillIds, createdSkill.id]
            }));
            
            setNewSkill({ name: '', description: '', categoryId: '', level: 1 });
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
                    <button className="modal-close" onClick={onClose}>×</button>
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
                        <div className="skills-section">
                            {Array.isArray(categories) && categories.map(category => (
                                <div key={category.id} className="category-skills">
                                    <h4 style={{ color: category.color }}>{category.name}</h4>
                                    <div className="skills-list">
                                        {Array.isArray(skills) && skills
                                            .filter(skill => skill.category?.name === category.name || skill.category === category.name)
                                            .map(skill => (
                                                <label key={skill.id} className="skill-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.skillIds.includes(skill.id)}
                                                        onChange={() => handleSkillChange(skill.id)}
                                                    />
                                                    <span>{skill.name}</span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
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
                                <div className="form-row">
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
                                        <label>Catégorie *</label>
                                        <select
                                            value={newSkill.categoryId}
                                            onChange={(e) => setNewSkill(prev => ({ ...prev, categoryId: e.target.value }))}
                                        >
                                            <option value="">Choisir une catégorie</option>
                                            {Array.isArray(categories) && categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                                <div className="form-group">
                                    <label>Niveau</label>
                                    <select
                                        value={newSkill.level}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                                    >
                                        <option value={1}>Débutant</option>
                                        <option value={2}>Intermédiaire</option>
                                        <option value={3}>Avancé</option>
                                        <option value={4}>Expert</option>
                                        <option value={5}>Maître</option>
                                    </select>
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
