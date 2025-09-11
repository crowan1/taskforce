import React, { useState, useEffect } from 'react';
import { dashboardServices } from '../../../../services/dashboard/dashboardServices';
import '../../../../assets/styles/Dashboard.scss';

const TaskModal = ({ task, isOpen, onClose, onTaskUpdate, project, mode = 'view' }) => {
    const [isEditing, setIsEditing] = useState(mode === 'edit');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: '',
        level: 'intermediate',
        estimatedHours: 1,
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
                skillIds: skillIds
            });
            setImages(Array.isArray(task?.images) ? task.images : []);
        }
        if (isOpen) {
            fetchSkills();
            fetchColumns();
            const user = JSON.parse(localStorage.getItem('user'));
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
                setImages(prev => [...prev, response.image]);
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

    const deleteImage = async (imageId) => {
        try {
            await dashboardServices.deleteTaskImage(task.id, imageId);
            setImages(prev => prev.filter(img => img.id !== imageId));
            setMessage('Image supprimée avec succès');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage('Erreur lors de la suppression de l\'image');
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
                        {!isEditing && (
                            <button 
                                className="btn-edit"
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
                    <div className="modal-body">
                        <div className="task-info">
                            <div className="task-description">
                                <h3>{task.title}</h3>
                                <p>{task.description || 'Aucune description'}</p>
                            </div>

                            <div className="task-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Statut</span>
                                <span className="detail-value status-badge">{task.status || 'Non défini'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Priorité</span>
                                <span 
                                    className="detail-value priority-badge"
                                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                                >
                                    {getPriorityLabel(task.priority)}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Niveau</span>
                                <span className="detail-value level-badge">{getLevelLabel(task.level)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Heures estimées</span>
                                <span className="detail-value hours-badge">{task.estimatedHours || 1}h</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Créé le</span>
                                <span className="detail-value">{formatDate(task.createdAt)}</span>
                            </div>
                            {task.assignedTo && (
                                <div className="detail-item">
                                    <span className="detail-label">Assignée à</span>
                                    <span className="detail-value">
                                        {typeof task.assignedTo === 'object' 
                                            ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}`
                                            : task.assignedTo
                                        }
                                    </span>
                                </div>
                            )}
                        </div>

                        {task.requiredSkills && task.requiredSkills.length > 0 && (
                            <div className="task-skills">
                                <h4>Compétences requises</h4>
                                <div className="skills-container">
                                    {task.requiredSkills.map(skill => (
                                        <span key={skill.id} className="skill-tag">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>

                        <div className="task-images">
                            <h4>Images</h4>
                            {images.length > 0 ? (
                                <div className="images-grid">
                                    {images.map(image => (
                                        <div key={image.id} className="image-item">
                                            <img 
                                                src={image.url} 
                                                alt="Task image"
                                                onClick={() => setSelectedImage(image.url)}
                                            />
                                            <button 
                                                className="delete-image-btn"
                                                onClick={() => deleteImage(image.id)}
                                                title="Supprimer cette image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Aucune image</p>
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
