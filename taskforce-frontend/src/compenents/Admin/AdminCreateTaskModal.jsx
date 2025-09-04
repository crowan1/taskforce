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
        
        if (loading) return;
        
        setLoading(true);
        setError('');

        try {
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
            const response = await dashboardServices.createSkill(newSkill);
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
                        <div className="skills-container">
                            {skills.map(skill => (
                                <label key={skill.id} className="skill-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.skillIds.includes(skill.id)}
                                        onChange={() => handleSkillToggle(skill.id)}
                                    />
                                    <span className="skill-name">{skill.name}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="btn-add-skill"
                            onClick={() => setShowCreateSkill(true)}
                        >
                            + Ajouter une compétence
                        </button>
                    </div>

                    {showCreateSkill && (
                        <div className="create-skill-section">
                            <h4>Créer une nouvelle compétence</h4>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Nom de la compétence"
                                    value={newSkill.name}
                                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <textarea
                                    placeholder="Description de la compétence"
                                    value={newSkill.description}
                                    onChange={(e) => setNewSkill({...newSkill, description: e.target.value})}
                                    rows="2"
                                />
                            </div>
                            <div className="skill-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowCreateSkill(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleCreateSkill}
                                >
                                    Créer
                                </button>
                            </div>
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
