import React, { useState } from 'react';

const CreateColumnModal = ({ onClose, onCreateColumn }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6b7280'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onCreateColumn(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nextValue = value;
        if (name === 'name') {
            nextValue = value.slice(0, 25);
        }
        setFormData(prev => ({
            ...prev,
            [name]: nextValue
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Créer une nouvelle colonne</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nom de la colonne *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ex: En cours, Terminé..."
                            required
                            maxLength={25}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description de la colonne..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="color">Couleur</label>
                        <input
                            type="color"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-create">
                            Créer la colonne
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateColumnModal;
