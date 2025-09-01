import React from 'react';

const AddColumnAfterModal = ({ isOpen, onClose, columnToAddAfter, onCreateColumn }) => {
    if (!isOpen || !columnToAddAfter) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onCreateColumn({
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color'),
            identifier: formData.get('identifier')
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Ajouter une colonne après "{columnToAddAfter.name}"</h3>
                    <button 
                        className="btn-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Nom de la colonne</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                placeholder="Ex: En cours"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="identifier">Identifiant</label>
                            <input 
                                type="text" 
                                id="identifier" 
                                name="identifier" 
                                placeholder="Ex: en-cours"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                placeholder="Description de la colonne"
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="color">Couleur</label>
                            <input 
                                type="color" 
                                id="color" 
                                name="color" 
                                defaultValue="#6b7280"
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-confirm">
                                Créer la colonne
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddColumnAfterModal;
