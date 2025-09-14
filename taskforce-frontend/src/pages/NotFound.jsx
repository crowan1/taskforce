import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import '../assets/styles/NotFound.scss';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="not-found-container">
            <Header />
            <main className="not-found-main">
                <div className="not-found-content">
                    <div className="error-code">404</div>
                    <h1>Page non trouvée</h1>
                    <p>Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
                    <div className="not-found-actions">
                        <button className="btn-primary" onClick={handleGoHome}>
                            Retour à l'accueil
                        </button>
                        <button className="btn-secondary" onClick={handleGoBack}>
                            Page précédente
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
