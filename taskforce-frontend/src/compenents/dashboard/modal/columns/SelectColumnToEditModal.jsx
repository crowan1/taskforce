import React from 'react';

const SelectColumnToEditModal = ({ isOpen, onClose, columns, onSelectColumn }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Sélectionner une colonne à modifier</h3>
                    <button 
                        className="btn-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <div className="columns-selection">
                        <p className="selection-description">
                            Choisissez la colonne que vous souhaitez modifier :
                        </p>
                        <div className="columns-list">
                            {columns.map(column => (
                                <div 
                                    key={column.id} 
                                    className="column-selection-item"
                                    onClick={() => {
                                        onSelectColumn(column);
                                        onClose();
                                    }}
                                >
                                    <div className="column-info">
                                        <div 
                                            className="column-color-indicator" 
                                            style={{ backgroundColor: column.color }}
                                        ></div>
                                        <div className="column-details">
                                            <h4>{column.name}</h4>
                                            <p>{column.description || 'Aucune description'}</p>
                                            <small>{column.tasks?.length || 0} tâches</small>
                                        </div>
                                    </div>
                                    <div className="column-actions">
                                        <button 
                                            className="btn-select-column"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectColumn(column);
                                                onClose();
                                            }}
                                        >
                                            Sélectionner
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button 
                            className="btn-cancel" 
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectColumnToEditModal;
