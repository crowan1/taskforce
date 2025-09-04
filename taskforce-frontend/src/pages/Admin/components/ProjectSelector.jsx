import React from 'react';

const ProjectSelector = ({ projects, selectedProject, onProjectChange }) => {
    return (
        <div className="project-selector">
            <h2>Sélectionner un projet</h2>
            <select 
                value={selectedProject || ''} 
                onChange={(e) => onProjectChange(e.target.value ? parseInt(e.target.value) : null)}
                className="project-select"
            >
                <option value="">Choisir un projet...</option>
                {projects.map(project => (
                    <option key={project.id} value={project.id}>
                        {project.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ProjectSelector;
