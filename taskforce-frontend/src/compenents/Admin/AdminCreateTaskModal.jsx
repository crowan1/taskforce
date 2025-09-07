import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../services/dashboard/dashboardServices';

const AdminCreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId, projectUsers, projectTasks }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        skillIds: [],
        level: 'intermediate'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [columns, setColumns] = useState([]);
    const [skills, setSkills] = useState([]);
    const [showCreateSkill, setShowCreateSkill] = useState(false);
    const [newSkill, setNewSkill] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                status: 'todo',
                skillIds: [],
                level: 'intermediate'
            });
        }
    }, [isOpen, projectId]);

    const fetchData = async () => {
        try {
            const [skillsData, columnsData] = await Promise.all([
                dashboardServices.getAllAvailableProjectSkills(projectId),
                dashboardServices.getColumns(projectId)
            ]);
            
            setSkills(skillsData.skills || []);
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
        
        if (loading) return;
        
        setLoading(true);
        setError('');

        try { 
            const projectSkillsData = await dashboardServices.getAllAvailableProjectSkills(projectId);
            if (!projectSkillsData.hasUsers) {
                setError('Aucun collaborateur n\'est ajouté à ce projet. Veuillez d\'abord ajouter des utilisateurs au projet avant de pouvoir créer des tâches.');
                setLoading(false);
                return;
            }

            const autoAssignedUser = getAutoAssignment(projectTasks, projectUsers, formData.skillIds);
            
            const taskData = {
                ...formData,
                projectId: parseInt(projectId),
                assignedTo: autoAssignedUser ? autoAssignedUser.id : null
            };
            
            const response = await dashboardServices.createTask(taskData);
            
            if (response.success && response.task) {
                onTaskCreated();
                onClose();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.name) {
            setError('Le nom de la compétence est requis');
            return;
        }

        try {
            const response = await dashboardServices.createProjectSkill(projectId, newSkill);
            if (response.success && response.skill) {
                setSkills(prev => [...prev, response.skill]);
                setFormData(prev => ({
                    ...prev,
                    skillIds: [...prev.skillIds, response.skill.id]
                }));
                setNewSkill({ name: '', description: '' });
                setShowCreateSkill(false);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSkillToggle = (skillId) => {
        setFormData(prev => ({
            ...prev,
            skillIds: prev.skillIds.includes(skillId)
                ? prev.skillIds.filter(id => id !== skillId)
                : [...prev.skillIds, skillId]
        }));
    };

    const handleDeleteProjectSkill = async (skillId, e) => {
        e.stopPropagation(); 
        
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
            return;
        }

        try { 
            const realSkillId = skillId.replace('project_', '');
            await dashboardServices.deleteProjectSkill(realSkillId);
            
            setSkills(prev => prev.filter(skill => skill.id !== skillId));
            setFormData(prev => ({
                ...prev,
                skillIds: prev.skillIds.filter(id => id !== skillId)
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const canDeleteSkill = (skill) => {
        return skill.type === 'project_skill' && skill.createdBy;
    };

    const getAutoAssignment = (tasks, users, requiredSkills = []) => {
        if (!users || users.length === 0) return null;
        
        const collaborators = users.filter(user => 
            user.role === 'collaborateur' || user.role === 'Collaborateur'
        );
        
        if (collaborators.length === 0) return null;
        
        if (!requiredSkills || requiredSkills.length === 0) {
            return getAssignmentByWorkload(tasks, collaborators);
        }
        
        let bestMatch = null;
        let bestScore = -1;
        
        collaborators.forEach(user => {
            const skillScore = calculateSkillMatch(user, requiredSkills);
            
            const workload = getWorkloadForUser(tasks, user.id);
            const workloadScore = Math.max(0, 10 - workload);
            
            const totalScore = (skillScore * 0.7) + (workloadScore * 0.3);
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestMatch = user;
            }
        });
        
        return bestMatch || collaborators[0];
    };

    const calculateSkillMatch = (user, requiredSkills) => {
        if (!user.skills || !requiredSkills || requiredSkills.length === 0) return 0;
        
        let matchCount = 0;
        
        requiredSkills.forEach(requiredSkillId => {
            const userSkill = user.skills.find(skill => skill.id === requiredSkillId);
            if (userSkill) {
                matchCount++;
            }
        });
        
        const percentageMatch = (matchCount / requiredSkills.length) * 100;
        
        return percentageMatch;
    };

    const getWorkloadForUser = (tasks, userId) => {
        return tasks.filter(task => 
            task.assignedTo && 
            (typeof task.assignedTo === 'object' ? task.assignedTo.id === userId : task.assignedTo === userId)
        ).length;
    };

    const getAssignmentByWorkload = (tasks, collaborators) => {
        const workload = {};
        collaborators.forEach(user => {
            workload[user.id] = getWorkloadForUser(tasks, user.id);
        });
        
        let minWorkload = Infinity;
        let selectedUser = null;
        
        Object.entries(workload).forEach(([userId, count]) => {
            if (count < minWorkload) {
                minWorkload = count;
                selectedUser = collaborators.find(u => u.id == userId);
            }
        });
        
        return selectedUser || collaborators[0];
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content admin-task-modal">
                <div className="modal-header">
                    <h2>Créer une nouvelle tâche</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Titre de la tâche *</label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            placeholder="Entrez le titre de la tâche"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Décrivez la tâche"
                            rows="4"
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority">Priorité</label>
                            <select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
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
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                        <label htmlFor="level">Niveau requis</label>
                        <select
                            id="level"
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                        >
                            <option value="beginner">Débutant</option>
                            <option value="intermediate">Intermédiaire</option>
                            <option value="advanced">Avancé</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Compétences requises</label>
                        <div className="skills-labels-container">
                            {Array.isArray(skills) && skills.map(skill => {
                                const isSelected = formData.skillIds.includes(skill.id);
                                const canDelete = canDeleteSkill(skill);
                                
                                return (
                                    <div
                                        key={skill.id}
                                        className={`skill-label ${isSelected ? 'selected' : ''} ${skill.type === 'project_skill' ? 'project-skill' : 'user-skill'}`}
                                        onClick={() => handleSkillToggle(skill.id)}
                                    >
                                        <span className="skill-label-name">{skill.name}</span>
                                        {skill.type === 'project_skill' && (
                                            <span className="skill-type-badge">Projet</span>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                className="skill-delete-btn"
                                                onClick={(e) => handleDeleteProjectSkill(skill.id, e)}
                                                title="Supprimer cette compétence"
                                            >
                                                ×
                                            </button>
                                        )}
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
                            {showCreateSkill ? 'Annuler' : '+ Ajouter une compétence au projet'}
                        </button>
                    </div>

                    {showCreateSkill && (
                        <div className="add-skill-form">
                            <h4>Créer une nouvelle compétence pour le projet</h4>
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
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="modal-footer">
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

export default AdminCreateTaskModal;
