import React, { useState, useEffect, useRef } from 'react';
import { dashboardServices } from '../../../../services/dashboard/dashboardServices';
import '../../../../assets/styles/Dashboard.scss';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId, projectUsers, projectTasks, autoAssign = false }) => {
    const isSubmitting = useRef(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: '',
        skillIds: [],
        level: 'intermediate',
        estimatedHours: 1,
        dueDate: ''
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
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            const user = JSON.parse(localStorage.getItem('user'));
            setCurrentUser(user);
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
        
        // Protection contre la double soumission
        if (loading || isSubmitting.current) {
            return;
        }
        
        isSubmitting.current = true;
        setLoading(true);
        setError('');

        try {
            const projectSkillsData = await dashboardServices.getAllAvailableProjectSkills(projectId);
            if (!projectSkillsData.hasUsers) {
                setError('Aucun collaborateur n\'est ajouté à ce projet. Veuillez d\'abord ajouter des utilisateurs au projet avant de pouvoir créer des tâches.');
                setLoading(false);
                isSubmitting.current = false;
                return;
            }

            let assignedUserId = null;
            if (autoAssign && projectUsers && projectTasks) {
                const autoAssignedUser = getAutoAssignment(projectTasks, projectUsers, formData.skillIds, formData.estimatedHours);
                assignedUserId = autoAssignedUser ? autoAssignedUser.id : null;
            }

            const taskData = {
                ...formData,
                projectId: parseInt(projectId),
                assignedTo: assignedUserId
            };
            
            const response = await dashboardServices.createTask(taskData);
            
            if (response.success && response.task) {
                onTaskCreated(response.task);
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: '',
                    skillIds: [],
                    level: 'intermediate',
                    estimatedHours: 1,
                    dueDate: ''
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

    const handleCreateProjectSkill = async () => {
        if (!newSkill.name.trim()) {
            setError('Le nom de la compétence est requis');
            return;
        }

        try {
            const response = await dashboardServices.createProjectSkill(projectId, newSkill);
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

    const canManageSkills = () => {
        if (!currentUser) return false;
        return ['responsable_projet', 'manager'].includes(currentUser.role);
    };

    const canDeleteSkill = (skill) => {
        if (!currentUser || !skill.createdBy) return false;
        return skill.type === 'project_skill' && skill.createdBy.id === currentUser.id;
    };

    const getAutoAssignment = (tasks, users, requiredSkills = [], newTaskHours = 1) => {
        if (!users || users.length === 0) return null;
        
        const collaborators = users.filter(user => 
            user.role === 'collaborateur' || user.role === 'Collaborateur'
        );
        
        if (collaborators.length === 0) return null;
        
        const availableCollaborators = collaborators.filter(user => {
            const currentWorkload = getWorkloadForUser(tasks, user.id);
            const maxWorkload = user.maxWorkloadHours;
            return (currentWorkload + newTaskHours) <= maxWorkload;
        });
        
        if (availableCollaborators.length === 0) {
            return getAssignmentByWorkload(tasks, collaborators);
        }
        
        if (!requiredSkills || requiredSkills.length === 0) {
            return getAssignmentByWorkload(tasks, availableCollaborators);
        }
        
        let bestMatch = null;
        let bestScore = -1;
        
        availableCollaborators.forEach(user => {
            const skillScore = calculateSkillMatch(user, requiredSkills);
            
            const currentWorkload = getWorkloadForUser(tasks, user.id);
            const maxWorkload = user.maxWorkloadHours;
            const workloadPercentage = (currentWorkload + newTaskHours) / maxWorkload;
            
            let workloadScore = 0;
            if (workloadPercentage >= 1.0) {
                workloadScore = 0.0;
            } else if (workloadPercentage >= 0.9) {
                workloadScore = 0.1;
            } else if (workloadPercentage >= 0.75) {
                workloadScore = 0.3;
            } else if (workloadPercentage >= 0.5) {
                workloadScore = 0.6;
            } else {
                workloadScore = 1.0;
            }
            
            const totalScore = (skillScore * 0.6) + (workloadScore * 0.4);
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestMatch = user;
            }
        });
        
        return bestMatch || availableCollaborators[0];
    };

    const calculateSkillMatch = (user, requiredSkills) => {
        if (!user.skills || !requiredSkills || requiredSkills.length === 0) return 0.5;
        
        let matchCount = 0;
        
        requiredSkills.forEach(requiredSkillId => {
            const userSkill = user.skills.find(skill => skill.id === requiredSkillId);
            if (userSkill) {
                matchCount++;
            }
        });
        
        return matchCount / requiredSkills.length;
    };

    const getWorkloadForUser = (tasks, userId) => {
        return tasks
            .filter(task => 
                task.assignedTo && 
                (typeof task.assignedTo === 'object' ? task.assignedTo.id === userId : task.assignedTo === userId)
            )
            .reduce((total, task) => total + (task.estimatedHours || 0), 0);
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

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="estimatedHours">Heures estimées *</label>
                            <input
                                type="number"
                                id="estimatedHours"
                                name="estimatedHours"
                                min="0.5"
                                max="200"
                                step="0.5"
                                value={formData.estimatedHours}
                                onChange={handleChange}
                                required
                                placeholder="Ex: 8"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dueDate">Échéance</label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
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
                                        onClick={() => handleSkillChange(skill.id)}
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
                        
                        {canManageSkills() && (
                            <div className="skill-management">
                                {!showCreateSkill ? (
                                    <button
                                        type="button"
                                        className="btn-add-skill"
                                        onClick={() => setShowCreateSkill(true)}
                                    >
                                        + Ajouter une compétence au projet
                                    </button>
                                ) : (
                                    <div className="create-skill-form">
                                        <input
                                            type="text"
                                            placeholder="Nom de la compétence"
                                            value={newSkill.name}
                                            onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Description (optionnel)"
                                            value={newSkill.description}
                                            onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                        <div className="create-skill-actions">
                                            <button
                                                type="button"
                                                onClick={handleCreateProjectSkill}
                                                className="btn-save-skill"
                                            >
                                                Ajouter
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateSkill(false);
                                                    setNewSkill({ name: '', description: '' });
                                                }}
                                                className="btn-cancel-skill"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
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
