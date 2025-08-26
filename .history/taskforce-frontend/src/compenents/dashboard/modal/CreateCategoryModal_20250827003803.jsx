import React, { useState } from 'react';
import { dashboardServices } from '../../../services/dashboard/dashboardServices';
import '../../../assets/styles/Dashboard.scss';

const CreateCategoryModal = ({ isOpen, onClose, onCategoryCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#007bff'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const colors = [
        '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
        '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#6c757d'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const newCategory = await dashboardServices.createCategory(formData);
            onCategoryCreated(newCategory);
            setFormData({ name: '', description: '', color: '#007bff' });
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Créer une catégorie</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Nom de la catégorie *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Développement, Design, Marketing..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description de la catégorie..."
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Couleur</label>
                        <div className="color-picker">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                />
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Création...' : 'Créer la catégorie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCategoryModal;
