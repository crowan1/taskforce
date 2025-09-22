import React from 'react';
import { render } from '@testing-library/react';
import KanbanHeader from '../compenents/dashboard/KanbanHeader';

describe('KanbanHeader (smoke)', () => {
  test('renders with minimal props', () => {
    const props = {
      selectedProject: { id: 1, name: 'P1' },
      currentUserRole: 'manager',
      showColumnActionsMenu: false,
      setShowColumnActionsMenu: () => {},
      setShowCreateColumn: () => {},
      setShowSelectColumnToEditModal: () => {},
      setShowSelectColumnToDeleteModal: () => {},
      setShowDeleteProjectModal: () => {},
      setShowCreateTask: () => {},
      setShowDescriptionModal: () => {},
      handleAssignAllTasks: () => {},
      isManager: () => true,
      canDeleteColumns: () => true,
      canDeleteProject: () => true,
    };
    const { container } = render(<KanbanHeader {...props} />);
    expect(container).toBeTruthy();
  });
});


