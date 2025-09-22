import React from 'react';
import { render } from '@testing-library/react';
import ProjectSidebar from '../compenents/dashboard/ProjectSidebar';

describe('ProjectSidebar (smoke)', () => {
  test('renders with basic props', () => {
    const props = {
      sidebarOpen: true,
      setSidebarOpen: () => {},
      projects: [{ id: 1, name: 'P1' }],
      selectedProject: { id: 1, name: 'P1' },
      setSelectedProject: () => {},
      setShowCreateProject: () => {},
      isCreator: () => true,
    };
    const { container } = render(<ProjectSidebar {...props} />);
    expect(container).toBeTruthy();
  });
});


