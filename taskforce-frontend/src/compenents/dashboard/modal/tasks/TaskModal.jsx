import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../../services/dashboard/dashboardServices';
import authService from '../../../../services/authServices';
import '../../../../assets/styles/Dashboard.scss';

const TaskModal = ({ task, isOpen, onClose, onTaskUpdate, project, mode = 'view', currentUserRole }) => {
    const [isEditing, setIsEditing] = useState(mode === 'edit');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: '',
        level: 'intermediate',
        estimatedHours: 1,
        dueDate: '',
        skillIds: []
    });
    const [skills, setSkills] = useState([]);
    const [columns, setColumns] = useState([]);
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Général', level: 1 });
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (task) {
            const skillIds = task.requiredSkills ? task.requiredSkills.map(skill => skill.id) : [];
            
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                status: task.status || '',
                level: task.level || 'intermediate',
                estimatedHours: task.estimatedHours || 1,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
                skillIds: skillIds
            });
            setImages(Array.isArray(task?.images) ? task.images : []);
        }
        if (isOpen) {
            fetchSkills();
            fetchColumns();
            const user = JSON.parse(sessionStorage.getItem('user'));
            setCurrentUser(user);
        }
    }, [task, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [isOpen]);

    const fetchSkills = async () => {
        try {
            if (project && project.id) {
                const data = await dashboardServices.getAllAvailableProjectSkills(project.id);
                const projectSkills = data.skills || [];
                
                if (task && task.requiredSkills) {
                    const missingSkills = task.requiredSkills.filter(taskSkill => 
                        !projectSkills.some(projectSkill => projectSkill.id === taskSkill.id)
                    );
                    
                    if (missingSkills.length > 0) {
                        setSkills([...projectSkills, ...missingSkills]);
                    } else {
                        setSkills(projectSkills);
                    }
                } else {
                    setSkills(projectSkills);
                }
            }
        } catch (err) {
            console.error('Erreur lors du chargement des compétences:', err);
        }
    };

    const fetchColumns = async () => {
        try {
            const data = await dashboardServices.getColumns(project.id);
            setColumns(data.columns);
        } catch (err) {
            console.error('Erreur lors du chargement des colonnes:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'estimatedHours' ? parseFloat(value) || 1 : value
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
            const data = await dashboardServices.createProjectSkill(project.id, newSkill);
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

    const deleteSkill = async (skillId) => {
        try {
            await dashboardServices.deleteProjectSkill(skillId);
            setSkills(prev => prev.filter(skill => skill.id !== skillId));
            setFormData(prev => ({
                ...prev,
                skillIds: prev.skillIds.filter(id => id !== skillId)
            }));
        } catch (err) {
            console.error('Erreur lors de la suppression de la compétence:', err);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Le titre est requis');
            return;
        }
        try {
            await onTaskUpdate(task.id, formData);
            setIsEditing(false);
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        await uploadImage(file);
    };

    const uploadImage = async (file) => {
        setUploading(true);
        try {
            const response = await dashboardServices.uploadTaskImage(task.id, file);
            if (response.success) {
                const imagePath = typeof response.image === 'object' ? response.image.path || response.image.filename : response.image;
                setImages(prev => [...prev, imagePath]);
                setMessage('Image ajoutée avec succès');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            setMessage('Erreur lors de l\'upload de l\'image');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (imageIndex) => {
        try {
            const imagePath = images[imageIndex];
            await dashboardServices.deleteTaskImage(task.id, imagePath);
            setImages(prev => prev.filter((_, index) => index !== imageIndex));
            setMessage('Image supprimée avec succès');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage('Erreur lors de la suppression de l\'image');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleFinishTask = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir terminer cette tâche ? Elle sera désassignée et ne comptera plus dans la charge de travail.')) {
            return;
        }

        try {
            const response = await dashboardServices.finishTask(task.id);
            if (response.success) {
                const updatedTask = { 
                    ...task, 
                    isFinished: true, 
                    assignedTo: null 
                };
                onTaskUpdate(updatedTask);
                setMessage('Tâche terminée avec succès');
                setTimeout(() => {
                    setMessage('');
                    onClose();
                }, 2000);
            }
        } catch (error) {
            console.error('Erreur lors de la finalisation de la tâche:', error);
            setMessage('Erreur lors de la finalisation de la tâche');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'Haute';
            case 'medium': return 'Moyenne';
            case 'low': return 'Basse';
            default: return 'Non définie';
        }
    };

    const getLevelLabel = (level) => {
        switch (level) {
            case 'beginner': return 'Débutant';
            case 'intermediate': return 'Intermédiaire';
            case 'advanced': return 'Avancé';
            case 'expert': return 'Expert';
            default: return 'Non défini';
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Modifier la tâche' : 'Détails de la tâche'}</h2>
                    <div className="header-actions">
                        {!isEditing && authService.canModifyTasks(currentUserRole) && (
                            <button 
                                className="btn-edit-modern"
                                onClick={() => setIsEditing(true)}
                                title="Modifier cette tâche"
                            >
                                Modifier
                            </button>
                        )}
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>
                </div>

                {isEditing ? (
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
                                <label htmlFor="status">Statut</label>
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

                        <div className="form-row">
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="dueDate">Date d'échéance</label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Compétences requises</label>
                            {formData.skillIds.length === 0 && (
                                <p className="no-skills-message">
                                    Aucune compétence sélectionnée. Cliquez sur les étiquettes pour les sélectionner.
                                </p>
                            )}
                            <div className="skills-labels-container">
                                {Array.isArray(skills) && skills.map(skill => {
                                    const isSelected = formData.skillIds.includes(skill.id);
                                    const canDelete = canDeleteSkill(skill);
                                    
                                    return (
                                        <div
                                            key={skill.id}
                                            className={`skill-label ${isSelected ? 'selected' : ''} ${skill.type === 'project_skill' ? 'project-skill' : 'user-skill'}`}
                                            onClick={() => toggleSkill(skill.id)}
                                        >
                                            <span className="skill-label-name">{skill.name}</span>
                                            {skill.type === 'project_skill' && (
                                                <span className="skill-type-badge">Projet</span>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    className="skill-delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSkill(skill.id);
                                                    }}
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
                                    {!showAddSkill ? (
                                        <button
                                            type="button"
                                            className="btn-add-skill"
                                            onClick={() => setShowAddSkill(true)}
                                        >
                                            + Ajouter une compétence au projet
                                        </button>
                                    ) : (
                                        <div className="add-skill-form">
                                            <h4>Créer une nouvelle compétence</h4>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Nom de la compétence</label>
                                                    <input
                                                        type="text"
                                                        value={newSkill.name}
                                                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Ex: React, Symfony..."
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Catégorie</label>
                                                    <select
                                                        value={newSkill.category}
                                                        onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                                                    >
                                                        <option value="Général">Général</option>
                                                        <option value="Frontend">Frontend</option>
                                                        <option value="Backend">Backend</option>
                                                        <option value="DevOps">DevOps</option>
                                                        <option value="Design">Design</option>
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
                                            <div className="form-actions">
                                                <button type="button" onClick={createSkill} disabled={!newSkill.name.trim()}>
                                                    Créer
                                                </button>
                                                <button type="button" onClick={() => setShowAddSkill(false)}>
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
                                Enregistrer
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="modal-form">
                        <div className="form-group">
                            <label>Titre</label>
                            <div className="task-display-value">{task.title}</div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <div className="task-display-value">{task.description || 'Aucune description'}</div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Priorité</label>
                                <div className="task-display-value">
                                    <span 
                                        className="priority-badge"
                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                    >
                                        {getPriorityLabel(task.priority)}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Statut</label>
                                <div className="task-display-value">{task.status || 'Non défini'}</div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Niveau requis</label>
                                <div className="task-display-value">
                                    <span className="level-badge">{getLevelLabel(task.level)}</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Heures estimées</label>
                                <div className="task-display-value">
                                    <span className="hours-badge">{task.estimatedHours || 1}h</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Créé le</label>
                                <div className="task-display-value">{formatDate(task.createdAt)}</div>
                            </div>
                            {task.assignedTo && (
                                <div className="form-group">
                                    <label>Assignée à</label>
                                    <div className="task-display-value">
                                        {typeof task.assignedTo === 'object' 
                                            ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}`
                                            : task.assignedTo
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        {task.dueDate && (
                            <div className="form-group">
                                <label>Date d'échéance</label>
                                <div className="task-display-value">
                                    <span className="due-date-badge" style={{
                                        backgroundColor: new Date(task.dueDate) < new Date() ? '#fef2f2' : '#f0f9ff',
                                        color: new Date(task.dueDate) < new Date() ? '#dc2626' : '#0369a1',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        border: `1px solid ${new Date(task.dueDate) < new Date() ? '#fca5a5' : '#93c5fd'}`
                                    }}>
                                        {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        {new Date(task.dueDate) < new Date() && ' (En retard)'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Compétences requises</label>
                            {task.requiredSkills && task.requiredSkills.length > 0 ? (
                                <div className="skills-labels-container">
                                    {task.requiredSkills.map(skill => (
                                        <div
                                            key={skill.id}
                                            className={`skill-label selected ${skill.type === 'project_skill' ? 'project-skill' : 'user-skill'}`}
                                        >
                                            <span className="skill-label-name">{skill.name}</span>
                                            {skill.type === 'project_skill' && (
                                                <span className="skill-type-badge">Projet</span>
                                            )}
                                            <span className="skill-label-check">✓</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="task-display-value">Aucune compétence requise</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Images</label>
                            {images.length > 0 ? (
                                <div className="images-grid">
                                    {images.filter(image => image && typeof image === 'string').map((imagePath, index) => (
                                        <div key={`image-${index}`} className="image-item">
                                            <img 
                                                src={`http://localhost:8000/${imagePath}`} 
                                                alt="Task image"
                                                onClick={() => setSelectedImage(`http://localhost:8000/${imagePath}`)}
                                            />
                                            <button 
                                                className="delete-image-btn"
                                                onClick={() => deleteImage(index)}
                                                title="Supprimer cette image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="task-display-value">Aucune image</div>
                            )}
                            
                            <div className="upload-section">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    id="image-upload"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="image-upload" className="upload-btn">
                                    {uploading ? 'Upload en cours...' : '+ Ajouter une image'}
                                </label>
                            </div>
                        </div>

                        {message && (
                            <div className="message">
                                {message}
                            </div>
                        )}

                        {!task.isFinished && (
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    onClick={handleFinishTask}
                                    className="btn-finish"
                                    style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    TERMINER
                                </button>
                            </div>
                        )}

                        {task.isFinished && (
                            <div className="task-finished-badge" style={{
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                padding: '10px',
                                borderRadius: '5px',
                                textAlign: 'center',
                                fontWeight: '600',
                                marginTop: '15px'
                            }}>
                                ✓ Tâche terminée
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="image-overlay" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Full size" />
                </div>
            )}
        </div>
    );
};

export default TaskModal;
