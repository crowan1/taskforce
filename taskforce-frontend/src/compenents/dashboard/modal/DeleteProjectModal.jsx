import React from 'react';

const DeleteProjectModal = ({ onClose, onConfirm, project }) => {
    return (
        <div className="delete-modal-overlay" onClick={onClose}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-modal-header">
                    <h3>Confirmerr la suppression</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="delete-modal-body">
                    <p>Êtes-vous sûr de vouloir supprimer le projet <strong>{project.name}</strong> ?</p>
                    <p className="warning">Cette action est irréversible et supprimera tout.</p>
                </div>
                <div className="delete-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Annuler</button>
                    <button className="btn-danger" onClick={onConfirm}>Supprimer définitivement</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProjectModal;
