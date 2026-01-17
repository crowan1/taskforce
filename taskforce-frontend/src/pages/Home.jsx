import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Home.scss';
import Header from "../compenents/includes/header";
import Footer from "../compenents/includes/footer";
import Seo from "../compenents/Seo";

const Home = () => {
    const navigate = useNavigate();
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'TaskForce',
        url: 'https://taskforce-app.com',
        logo: 'https://taskforce-app.com/logo512.png',
        description: "Plateforme intelligente de gestion de projets avec assignation automatique des tâches selon les compétences."
    };

    return (
        <div className="home-container">
            <Seo
                title="TaskForce - Gestion de Projets Intelligente"
                description="Organisez vos projets avec la répartition intelligente des tâches, le suivi d'équipe et un tableau de bord clair."
                keywords="gestion projet, kanban, productivité, assignation automatique, collaboration équipe, workflow, tableau de bord"
                path="/"
                jsonLd={jsonLd}
            />
            <Header/>
            <main className="main-content">
                <div className="hero-section">
                    <div className="hero-text">
                        <h1>Organisez, gérez et optimisez vos tâches d'équipe où que vous soyez.</h1>
                        <p>Découvrez la répartition intelligente des tâches. Libérez votre productivité grâce à TaskForce.</p>
                    </div>

                    <div className="signup-form">
                        <input
                            type="email"
                            placeholder="Adresse e-mail"
                            className="email-input"
                        />
                        <button
                            className="signup-button"
                            onClick={() => navigate('/register')}
                        >
                            Inscrivez-vous, c'est gratuit !
                        </button>
                        <p className="privacy-text">
                            En saisissant mon adresse e-mail, j'accepte la{' '}
                            <a href="#" className="privacy-link">politique de confidentialité de TaskForce</a>
                        </p>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="phone-mockup">
                        <div className="phone-screen">
                            <div className="app-header">
                                <span>TaskForce</span>
                                <div className="menu-dots">⋯</div>
                            </div>
                            <div className="task-list">
                                <div className="task-item urgent">
                                    <div className="task-title">Analyse des performances Q4</div>
                                    <div className="task-meta">📊 Marketing • Urgent</div>
                                </div>
                                <div className="task-item normal">
                                    <div className="task-title">Révision du code backend</div>
                                    <div className="task-meta">💻 Développement</div>
                                </div>
                                <div className="task-item normal">
                                    <div className="task-title">Réunion équipe design</div>
                                    <div className="task-meta">🎨 Design • Demain 14h</div>
                                </div>
                                <div className="task-item completed">
                                    <div className="task-title">Documentation API</div>
                                    <div className="task-meta">✅ Terminé</div>
                                </div>
                            </div>
                            <button className="add-task">+ Ajouter une tâche</button>
                        </div>
                    </div>

                    <div className="floating-icons">
                        <div className="icon-item icon-1">📋</div>
                        <div className="icon-item icon-2">⚡</div>
                        <div className="icon-item icon-3">🎯</div>
                        <div className="icon-item icon-4">📊</div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default Home;