import React, { useEffect, useState } from 'react';
import { dashboardServices } from '../../../../services/dashboard/dashboardServices';
import '../../../../assets/styles/compenents/Dashboard/TaskDetailModal.scss';

const TaskDetailModal = ({ task, isOpen, onClose, onTaskUpdate }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setImages(Array.isArray(task?.images) ? task.images : []);
    }, [task]);

    useEffect(() => {
        if (isOpen) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        await uploadImage(file);
    };

    const uploadImage = async (file) => {
        setUploading(true);
        try {
            const result = await dashboardServices.uploadTaskImage(task.id, file);
            if (result.success) {
                if (result.imagePath) {
                    setImages(prev => [...prev, result.imagePath]);
                }
                setMessage('Image ajoutée');
                setTimeout(() => setMessage(''), 1500);
                onTaskUpdate();
            }
        } catch (error) {
            console.error('Erreur upload image:', error);
            alert('Erreur lors de l\'upload de l\'image');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                await uploadImage(file);
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
    };

    const handleDeleteImage = async (imagePath) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette image ?')) return;

        try {
            const result = await dashboardServices.deleteTaskImage(task.id, imagePath);
            if (result.success) {
                setImages(prev => prev.filter(p => p !== imagePath));
                setMessage('Image supprimée');
                setTimeout(() => setMessage(''), 1500);
                onTaskUpdate();
            }
        } catch (error) {
            console.error('Erreur suppression image:', error);
            alert('Erreur lors de la suppression de l\'image');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{task.title}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="task-info">
                        <div className="task-description">
                            <h3>Description</h3>
                            <p>{task.description || 'Aucune description'}</p>
                        </div>

 
                        <div className="task-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Statut</span>
                                <span className="detail-value status-badge">{task.status}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Priorité</span>
                                <span className="detail-value priority-badge">{task.priority}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Niveau</span>
                                <span className="detail-value level-badge">{task.level || 'Non défini'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Créé le</span>
                                <span className="detail-value">{formatDate(task.createdAt)}</span>
                            </div>
                            {task.assignedTo && (
                                <div className="detail-item">
                                    <span className="detail-label">Assigné à</span>
                                    <span className="detail-value assigned-user">
                                        {task.assignedTo.firstname} {task.assignedTo.lastname}
                                    </span>
                                </div>
                            )}
                        </div>

       
                        <div className="task-skills">
                            <h3>Compétences requises</h3>
                            <div className="skills-list">
                                {task.requiredSkills && task.requiredSkills.length > 0 ? (
                                    task.requiredSkills.map(skill => (
                                        <span key={skill.id} className="skill-tag">
                                            {skill.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-skills">Aucune compétence requise</p>
                                )}
                            </div>
                        </div>

                        <div className="task-images">
                            <h3>Images</h3>
                            <div className="image-upload-section">
                                <div 
                                    className="drop-zone"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        id="image-upload"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="image-upload" className="upload-button">
                                        {uploading ? 'Upload en cours...' : '+ Ajouter une image'}
                                    </label>
                                    <p className="drop-hint">ou glissez-déposez une image ici</p>
                                </div>
                            </div>

                            {images && images.length > 0 && (
                                <div className="images-grid">
                                    {images.map((imagePath, index) => (
                                        <div key={index} className="image-item">
                                            <img
                                                src={`http://localhost:8000/${imagePath}`}
                                                alt={`Image ${index + 1}`}
                                                onClick={() => setSelectedImage(imagePath)}
                                            />
                                            <button
                                                className="delete-image-btn"
                                                onClick={() => handleDeleteImage(imagePath)}
                                                title="Supprimer l'image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {message && (
                                <p style={{color:'#10b981', marginTop:12}}>{message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {selectedImage && (
                    <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>×</button>
                            <img
                                src={`http://localhost:8000/${selectedImage}`}
                                alt="Image en grand"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetailModal;
