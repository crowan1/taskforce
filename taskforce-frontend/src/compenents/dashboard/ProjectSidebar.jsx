import React from 'react';

const ProjectSidebar = ({
    sidebarOpen,
    setSidebarOpen,
    projects,
    selectedProject,
    setSelectedProject,
    setShowCreateProject,
    isCreator
}) => {
    return (
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            {sidebarOpen ? (
                <>
                    <div className="sidebar-header">
                        <h2>Mes Projets</h2>
                        <button 
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(false)}
                        >
                            ◀
                        </button>
                    </div>
                    
                    <div className="sidebar-content">
                        <button 
                            className="btn-create-project-sidebar"
                            onClick={() => setShowCreateProject(true)}
                        >
                            + Nouveau Projet
                        </button>
                        
                        <div className="projects-list">
                            {projects.map(project => (
                                <div 
                                    key={project.id} 
                                    className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <div className="project-info">
                                        <h3>{project.name}</h3>
                                        <p>{project.description || 'Aucune description'}</p>
                                        <small>{project.taskCount} tâches</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="sidebar-closed">
                    <button 
                        className="sidebar-toggle-closed"
                        onClick={() => setSidebarOpen(true)}
                        title="Ouvrir la liste des projets"
                    >
                        <img src={require('../../assets/icons/fleche-droite.png')} alt="Ouvrir la liste des projets" className="sidebar-toggle-icon" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectSidebar;
