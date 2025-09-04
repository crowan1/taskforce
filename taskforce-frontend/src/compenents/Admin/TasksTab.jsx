import React from 'react';

const TasksTab = ({ projectTasks, onCreateTask, onReassignTask }) => {
    return (
        <div className="tasks-tab">
            <div className="tab-header">
                <h3>Gestion des Tâches</h3>
                <button 
                    className="btn-primary"
                    onClick={onCreateTask}
                >
                    Créer une nouvelle tâche
                </button>
            </div>
            
            <div className="project-tasks">
                <h4>Tâches du projet</h4>
                {projectTasks.length === 0 ? (
                    <p>Aucune tâche trouvée dans ce projet.</p>
                ) : (
                    <div className="tasks-list">
                        {projectTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <div className="task-header">
                                    <h5>{task.title}</h5>
                                    <span className={`priority priority-${task.priority || 'medium'}`}>
                                        {task.priority || 'medium'}
                                    </span>
                                </div>
                                <p className="task-description">{task.description || 'Aucune description'}</p>
                                <div className="task-meta">
                                    <span className="assigned-to">
                                        Assignée à: {task.assignedTo ? (typeof task.assignedTo === 'object' ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}` : task.assignedTo) : 'En attente d\'assignation'}
                                    </span>
                                    <span className="created-at">
                                        Créée le: {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="task-actions">
                                    <button 
                                        className="btn-reassign"
                                        onClick={() => onReassignTask(task)}
                                        title="Réassigner cette tâche"
                                    >
                                     Réassigner
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksTab;
