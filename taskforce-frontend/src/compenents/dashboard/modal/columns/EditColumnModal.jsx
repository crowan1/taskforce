import React from 'react';

const EditColumnModal = ({ isOpen, onClose, column, onUpdateColumn }) => {
    if (!isOpen || !column) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onUpdateColumn(column.id, {
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color')
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Modifier la colonne</h3>
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
                                defaultValue={column.name}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                defaultValue={column.description}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="color">Couleur</label>
                            <input 
                                type="color" 
                                id="color" 
                                name="color" 
                                defaultValue={column.color}
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-confirm">
                                Modifier
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditColumnModal;
