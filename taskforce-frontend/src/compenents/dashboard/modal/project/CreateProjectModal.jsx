import React, { useState } from 'react';

const CreateProjectModal = ({ onClose, onCreateProject }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        
        // Validation
        if (!formData.name.trim()) {
            setErrors({ name: 'Le nom du projet est requis' });
            return;
        }
        
        if (formData.name.length > 50) {
            setErrors({ name: 'Le nom du projet ne peut pas dépasser 50 caractères' });
            return;
        }
        
        onCreateProject(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limiter le nom à 50 caractères
        if (name === 'name' && value.length > 50) {
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Effacer l'erreur quand l'utilisateur corrige
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Créer un nouveau projet</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Nom du projet *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nom du projet (max 50 caractères)"
                            maxLength={50}
                            required
                            className={errors.name ? 'error' : ''}
                        />
                        <div className="char-counter">
                            {formData.name.length}/50
                        </div>
                        {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description du projet"
                            rows="4"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-create">
                            Créer le projet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
