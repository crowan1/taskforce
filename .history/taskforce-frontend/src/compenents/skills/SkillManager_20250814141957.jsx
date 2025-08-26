import React, { useState, useEffect } from 'react';
import CreateSkillModal from './CreateSkillModal';

const SkillManager = () => {
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateSkill, setShowCreateSkill] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const apiCall = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token non trouvé');
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error('Erreur API');
        }

        return response.json();
    };

    const fetchSkills = async () => {
        try {
            const data = await apiCall('http://localhost:8000/api/skills');
            setSkills(data.skills);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await apiCall('http://localhost:8000/api/skills/categories');
            setCategories(data.categories);
        } catch (err) {
            console.error('Erreur lors du chargement des catégories:', err);
        }
    };

    const handleCreateSkill = async (skillData) => {
        try {
            const data = await apiCall('http://localhost:8000/api/skills', {
                method: 'POST',
                body: JSON.stringify(skillData)
            });
            setSkills(prev => [...prev, data.skill]);
            setShowCreateSkill(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        try {
            await apiCall(`http://localhost:8000/api/skills/${skillId}`, {
                method: 'DELETE'
            });
            setSkills(prev => prev.filter(skill => skill.id !== skillId));
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchSkills();
        fetchCategories();
    }, []);

    const filteredSkills = selectedCategory === 'all' 
        ? skills 
        : skills.filter(skill => skill.category === selectedCategory);

    if (loading) {
        return (
            <div className="skill-manager">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Chargement des compétences...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="skill-manager">
                <div className="error-container">
                    <h2>Erreur</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Réessayer</button>
                </div>
            </div>
        );
    }

    return (
        <div className="skill-manager">
            <div className="skill-header">
                <h1>Gestion des Compétences</h1>
                <button 
                    className="btn-create-skill"
                    onClick={() => setShowCreateSkill(true)}
                >
                    + Nouvelle Compétence
                </button>
            </div>

            <div className="skill-filters">
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-filter"
                >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="skills-grid">
                {filteredSkills.map(skill => (
                    <div key={skill.id} className="skill-card">
                        <div className="skill-header">
                            <h3>{skill.name}</h3>
                            <div className="skill-level">
                                Niveau {skill.level}
                            </div>
                        </div>
                        <div className="skill-category">
                            {skill.category}
                        </div>
                        {skill.description && (
                            <p className="skill-description">{skill.description}</p>
                        )}
                        <div className="skill-actions">
                            <button 
                                className="btn-delete-skill"
                                onClick={() => handleDeleteSkill(skill.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSkills.length === 0 && (
                <div className="no-skills">
                    <h2>Aucune compétence trouvée</h2>
                    <p>Créez votre première compétence pour commencer</p>
                </div>
            )}

            {showCreateSkill && (
                <CreateSkillModal 
                    onClose={() => setShowCreateSkill(false)}
                    onCreateSkill={handleCreateSkill}
                    categories={categories}
                />
            )}
        </div>
    );
};

export default SkillManager;
