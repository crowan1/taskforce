import React from 'react';

const ProjectInfoModal = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="description-modal" onClick={onClose}>
      <div className="description-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="description-modal-header">
          <h3>Informations du projet</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="project-info-content">
          <div className="info-section">
            <h4>Nom du projet</h4>
            <p className="project-title">{title}</p>
          </div>
          {description && (
            <div className="info-section">
              <h4>Description</h4>
              <p className="project-description">{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
