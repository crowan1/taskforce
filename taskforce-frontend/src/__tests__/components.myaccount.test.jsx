import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileInfo from '../compenents/myAccount/ProfileInfo';
import UserSkillsManager from '../compenents/myAccount/UserSkillsManager';
import UserTasksManager from '../compenents/myAccount/UserTasksManager';
import CancelPremiumModal from '../compenents/myAccount/CancelPremiumModal';
import profileService from '../services/profil/profileService';
import stripeService from '../services/stripeService';
import { dashboardServices } from '../services/dashboard/dashboardServices';
import { useAuth } from '../context/AuthContext';

jest.mock('../services/profil/profileService', () => ({
  updateProfile: jest.fn()
}));

jest.mock('../services/stripeService', () => ({
  cancelSubscription: jest.fn(),
  syncSubscription: jest.fn()
}));

jest.mock('../services/dashboard/dashboardServices', () => ({
  dashboardServices: {
    getUserSkills: jest.fn(),
    addUserSkill: jest.fn(),
    deleteUserSkill: jest.fn(),
    getTasks: jest.fn()
  }
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('MyAccount components', () => {
  beforeEach(() => {
    profileService.updateProfile.mockReset();
    stripeService.cancelSubscription.mockReset();
    stripeService.syncSubscription.mockReset();
    dashboardServices.getUserSkills.mockReset();
    dashboardServices.addUserSkill.mockReset();
    dashboardServices.getTasks.mockReset();
    useAuth.mockReset();
  });

  it('edits and saves profile info', async () => {
    const onUpdate = jest.fn();
    profileService.updateProfile.mockResolvedValueOnce({ user: { firstname: 'Ada' } });
    render(<ProfileInfo user={{ email: 'user@test.com', firstname: 'Ada', lastname: 'Lovelace' }} onUpdate={onUpdate} subscriptionStatus={{ is_premium: false }} />);
    fireEvent.click(screen.getByText('Modifier le profil'));
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => expect(profileService.updateProfile).toHaveBeenCalled());
    expect(onUpdate).toHaveBeenCalled();
  });

  it('shows cancel premium modal', () => {
    render(<ProfileInfo user={{ email: 'user@test.com' }} onUpdate={jest.fn()} subscriptionStatus={{ is_premium: true }} />);
    fireEvent.click(screen.getByText("Arrêter d'être Premium"));
    expect(screen.getByText("Annuler l'abonnement Premium")).toBeInTheDocument();
  });

  it('adds a user skill', async () => {
    dashboardServices.getUserSkills.mockResolvedValueOnce({ skills: [] });
    dashboardServices.addUserSkill.mockResolvedValueOnce({ userSkill: { id: 1, name: 'React', description: 'UI' } });
    render(<UserSkillsManager />);
    await waitFor(() => expect(screen.getByText('Mes Compétences')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+ Créer une compétence'));
    fireEvent.change(screen.getByPlaceholderText('Ex: Développement React, Design UI/UX, API REST...'), {
      target: { value: 'React' }
    });
    fireEvent.submit(screen.getByText('Ajouter').closest('form'));
    await waitFor(() => expect(screen.getByText('React')).toBeInTheDocument());
  });

  it('renders assigned tasks for user', async () => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    dashboardServices.getTasks.mockResolvedValueOnce({
      tasks: [{
        id: 9,
        title: 'Tache',
        priority: 'high',
        status: 'todo',
        createdAt: new Date().toISOString(),
        assignedTo: { id: 1 },
        project: { id: 2, name: 'Projet' }
      }]
    });
    render(<UserTasksManager />);
    await waitFor(() => expect(screen.getByText('Mes Tâches Assignées')).toBeInTheDocument());
    expect(screen.getByText('Tache')).toBeInTheDocument();
  });

  it('renders cancel premium modal actions', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<CancelPremiumModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Annuler'));
    fireEvent.click(screen.getByText('Oui, arrêter Premium'));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });
});

