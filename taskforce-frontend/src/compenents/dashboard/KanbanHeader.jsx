import React from 'react';

const KanbanHeader = ({
    selectedProject,
    currentUserRole,
    showColumnActionsMenu,
    setShowColumnActionsMenu,
    setShowCreateColumn,
    setShowSelectColumnToEditModal,
    setShowSelectColumnToDeleteModal,
    setShowDeleteProjectModal,
    setShowCreateTask,
    setShowDescriptionModal,
    handleAssignAllTasks,
    isManager,
    canDeleteColumns,
    canDeleteProject,
    canCreateTasks,
    canAssignTasks
}) => {
    if (!selectedProject) {
        return (
            <div className="no-project-selected">
                <h2>Bienvenue sur TaskForce</h2>
                <p>Veuillez sélectionner un projet pour commencer</p>
            </div>
        );
    }

    return (
        <div className="kanban-header">
            <div className="project-info-header">
                <h1 
                    className={selectedProject.name.length > 50 ? 'clickable-title' : ''}
                    onClick={() => {
                        if (selectedProject.name.length > 50) {
                            setShowDescriptionModal(true);
                        }
                    }}
                    title={selectedProject.name.length > 50 ? "Cliquer pour voir le titre complet" : ""}
                >
                    {selectedProject.name.length > 50 ? selectedProject.name.substring(0, 50) + '...' : selectedProject.name}
                </h1>
                {selectedProject.description && (
                    <p 
                        className={selectedProject.description.length > 100 ? 'clickable-description' : ''}
                        onClick={() => {
                            if (selectedProject.description && selectedProject.description.length > 100) {
                                setShowDescriptionModal(true);
                            }
                        }}
                        title={selectedProject.description && selectedProject.description.length > 100 ? "Cliquer pour voir la description complète" : ""}
                    >
                        {selectedProject.description}
                    </p>
                )}
                {currentUserRole && (
                    <div className="current-user-role">
                        <span className="role-indicator">
                            {currentUserRole}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="kanban-actions">
                {canDeleteColumns(currentUserRole) && (
                    <div className="column-actions-dropdown">
                        <button 
                            className="btn-column-actions"
                            onClick={() => setShowColumnActionsMenu(!showColumnActionsMenu)}
                        >
                            ⋮ Gérer les Colonnes
                        </button>
                        
                        {showColumnActionsMenu && (
                            <div className="column-actions-menu">
                                <button 
                                    className="menu-item add-column"
                                    onClick={() => {
                                        setShowCreateColumn(true);
                                        setShowColumnActionsMenu(false);
                                    }}
                                >
                                    Nouvelle Colonne
                                </button>
                                <button 
                                    className="menu-item edit-columns"
                                    onClick={() => {
                                        setShowColumnActionsMenu(false);
                                        setShowSelectColumnToEditModal(true);
                                    }}
                                >
                                    Modifier une Colonne
                                </button>
                                <button 
                                    className="menu-item delete-columns"
                                    onClick={() => {
                                        setShowColumnActionsMenu(false);
                                        setShowSelectColumnToDeleteModal(true);
                                    }}
                                >
                                    Supprimer une Colonne
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                
                {canAssignTasks(currentUserRole) && (
                    <button 
                        className="btn-assign-all"
                        onClick={handleAssignAllTasks}
                        title="Assigner automatiquement toutes les tâches non assignées"
                    >
                         Assigner Toutes
                    </button>
                )}

                {canDeleteProject(currentUserRole) && (
                    <button 
                        className="btn-delete-project" 
                        onClick={() => setShowDeleteProjectModal(true)}
                        title="Seuls les responsables de projet peuvent supprimer des projets"
                    >
                        Supprimer Projet
                    </button>
                )}
                
                {canCreateTasks(currentUserRole) && (
                    <button 
                        className="btn-create-task"
                        onClick={() => setShowCreateTask(true)}
                        title="Créer une nouvelle tâche"
                    >
                        + Nouvelle Tâche
                    </button>
                )}
            </div>
        </div>
    );
};

export default KanbanHeader;
