import React, { useState } from 'react';

const CreateSkillModal = ({ onClose, onCreateSkill, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Général',
        level: 1
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onCreateSkill(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Créer une nouvelle compétence</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nom de la compétence *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ex: JavaScript, Design, Gestion de projet..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description de la compétence..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Catégorie</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Général">Général</option>
                                <option value="Développement">Développement</option>
                                <option value="Design">Design</option>
                                <option value="Gestion">Gestion</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Communication">Communication</option>
                                <option value="Technique">Technique</option>
                                {categories.filter(cat => !['Général', 'Développement', 'Design', 'Gestion', 'Marketing', 'Communication', 'Technique'].includes(cat)).map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="level">Niveau (1-5)</label>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                            >
                                <option value={1}>1 - Débutant</option>
                                <option value={2}>2 - Intermédiaire</option>
                                <option value={3}>3 - Avancé</option>
                                <option value={4}>4 - Expert</option>
                                <option value={5}>5 - Maître</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-create">
                            Créer la compétence
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSkillModal;
