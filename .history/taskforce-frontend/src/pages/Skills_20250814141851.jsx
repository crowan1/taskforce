import React from 'react';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import SkillManager from '../compenents/skills/SkillManager';

const Skills = () => {
    return (
        <div className="skills-page">
            <Header />
            <main className="skills-content">
                <SkillManager />
            </main>
            <Footer />
        </div>
    );
};

export default Skills;
