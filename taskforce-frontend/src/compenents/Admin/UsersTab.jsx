import React, { useState } from 'react';
import UserProfileModal from './UserProfileModal';
import '../../assets/styles/compenents/admin/UserProfileModal.scss';

const UsersTab = ({ projectUsers, projectTasks, onAddUser, onUserUpdated, selectedProject }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);

    const getRoleDisplayName = (role) => {
        if (!role) return 'Non défini';
        
        const roleStr = typeof role === 'string' ? role : String(role);
        
        switch (roleStr) {
            case 'Responsable de Projet':
            case 'responsable_projet':
                return 'Responsable de Projet';
            case 'Manager':
            case 'manager':
                return 'Manager';
            case 'Collaborateur':
            case 'collaborateur':
                return 'Collaborateur';
            default:
                return roleStr;
        }
    };

    return (
        <div className="users-tab">
            <div className="tab-header">
                <h3>Gestion des Utilisateurs</h3>
                <div className="tab-actions">
                    <button 
                        className="btn-primary"
                        onClick={onAddUser}
                    >
                        + Ajouter un utilisateur
                    </button>
                </div>
            </div>
            
            <div className="project-users-detailed">
                <h4>Utilisateurs du projet</h4>
                {projectUsers.length === 0 ? (
                    <p>Aucun utilisateur trouvé dans ce projet.</p>
                ) : (
                    <div className="users-detailed-list">
                                                            {projectUsers.map(user => (
                                        <div 
                                            key={user.id} 
                                            className="user-detailed-item clickable"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowUserProfile(true);
                                            }}
                                            title="Cliquer pour voir le profil détaillé"
                                        >
                                <div className="user-header">
                                    <div className="user-info">
                                        <strong>{user.firstname} {user.lastname}</strong>
                                        <span className="user-email">{user.email}</span>
                                    </div>
                                    <span className={`user-role role-${user.role}`}>
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                </div>
                                
                                <div className="user-details">
                                    <div className="user-section">
                                        <h5>Tâches assignées</h5>
                                        <div className="user-tasks">
                                            {projectTasks.filter(task => 
                                                task.assignedTo && 
                                                (typeof task.assignedTo === 'object' ? 
                                                    task.assignedTo.id === user.id : 
                                                    task.assignedTo === user.id)
                                            ).length === 0 ? (
                                                <p className="no-tasks">Aucune tâche assignée</p>
                                            ) : (
                                                projectTasks.filter(task => 
                                                    task.assignedTo && 
                                                    (typeof task.assignedTo === 'object' ? 
                                                        task.assignedTo.id === user.id : 
                                                        task.assignedTo === user.id)
                                                ).map(task => (
                                                    <div key={task.id} className="user-task-item">
                                                        <span className="task-title">{task.title}</span>
                                                        <span className={`task-priority priority-${task.priority}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className="task-status">{task.status}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="user-section">
                                        <h5>Compétences</h5>
                                        <div className="user-skills">
                                            {user.skills && user.skills.length > 0 ? (
                                                user.skills.map(skill => (
                                                    <span key={skill.id} className="skill-tag">
                                                        {skill.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="no-skills">Aucune compétence définie</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="user-section">
                                        <h5>Statistiques</h5>
                                        <div className="user-stats">
                                            <div className="stat-item">
                                                <span className="stat-number">
                                                    {projectTasks.filter(task => 
                                                        task.assignedTo && 
                                                        (typeof task.assignedTo === 'object' ? 
                                                            task.assignedTo.id === user.id : 
                                                            task.assignedTo === user.id)
                                                    ).length}
                                                </span>
                                                <span className="stat-label">Tâches</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-number">
                                                    {user.skills ? user.skills.length : 0}
                                                </span>
                                                <span className="stat-label">Compétences</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showUserProfile && selectedUser && selectedProject && (
                <UserProfileModal
                    isOpen={showUserProfile}
                    onClose={() => {
                        setShowUserProfile(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    projectId={selectedProject.id}
                    projectUsers={projectUsers}
                    projectTasks={projectTasks}
                    onUserUpdated={onUserUpdated}
                />
            )}
        </div>
    );
};

export default UsersTab;
