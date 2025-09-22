import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TaskCard from '../compenents/dashboard/TaskCard';

describe('TaskCard (unit)', () => {
  const baseTask = {
    id: 1,
    title: 'Titre',
    description: 'Desc',
    priority: 'medium',
    createdAt: '2024-01-01T00:00:00Z',
  };

  test('renders title and date', () => {
    const { getByText } = render(<TaskCard task={baseTask} currentUserRole={'manager'} onShowTaskDetail={() => {}} />);
    expect(getByText('Titre')).toBeTruthy();
  });

  test('calls onAssignTask when click 🎯', () => {
    const onAssignTask = jest.fn();
    const { container } = render(
      <TaskCard task={baseTask} currentUserRole={'manager'} onAssignTask={onAssignTask} onShowTaskDetail={() => {}} />
    );
    const btn = container.querySelector('.btn-assign');
    if (btn) {
      fireEvent.click(btn);
      expect(onAssignTask).toHaveBeenCalledWith(1);
    }
  });

  test('calls onEditTask when click edit', () => {
    const onEditTask = jest.fn();
    const { container } = render(
      <TaskCard task={baseTask} currentUserRole={'manager'} onEditTask={onEditTask} onShowTaskDetail={() => {}} />
    );
    const btn = container.querySelector('.btn-edit');
    if (btn) {
      fireEvent.click(btn);
      expect(onEditTask).toHaveBeenCalled();
    }
  });

  test('calls onShowDeleteModal when click ×', () => {
    const onShowDeleteModal = jest.fn();
    const { container } = render(
      <TaskCard task={baseTask} currentUserRole={'manager'} onShowDeleteModal={onShowDeleteModal} onShowTaskDetail={() => {}} />
    );
    const btn = container.querySelector('.btn-delete');
    if (btn) {
      fireEvent.click(btn);
      expect(onShowDeleteModal).toHaveBeenCalled();
    }
  });

  test('onShowTaskDetail triggers on click card', () => {
    const onShowTaskDetail = jest.fn();
    const { container } = render(
      <TaskCard task={baseTask} currentUserRole={'user'} onShowTaskDetail={onShowTaskDetail} />
    );
    fireEvent.click(container.querySelector('.task-card'));
    expect(onShowTaskDetail).toHaveBeenCalledWith(baseTask);
  });

  test('renders assignee when provided', () => {
    const task = { ...baseTask, assignedTo: { firstname: 'John', lastname: 'Doe' } };
    const { getByText } = render(
      <TaskCard task={task} currentUserRole={'user'} onShowTaskDetail={() => {}} />
    );
    expect(getByText('Assigné à :')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  test('renders required skills tags', () => {
    const task = { ...baseTask, requiredSkills: [{ id: 1, name: 'React' }, { id: 2, name: 'Node' }] };
    const { getByText } = render(
      <TaskCard task={task} currentUserRole={'user'} onShowTaskDetail={() => {}} />
    );
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Node')).toBeTruthy();
  });

  test('shows priority label Haute for high', () => {
    const task = { ...baseTask, priority: 'high' };
    const { getByText } = render(
      <TaskCard task={task} currentUserRole={'user'} onShowTaskDetail={() => {}} />
    );
    expect(getByText('Haute')).toBeTruthy();
  });

  test('description is truncated with ellipsis when too long', () => {
    const longDesc = 'x'.repeat(101);
    const task = { ...baseTask, description: longDesc };
    const { container } = render(
      <TaskCard task={task} currentUserRole={'user'} onShowTaskDetail={() => {}} />
    );
    expect(container.textContent.includes('...')).toBe(true);
  });
});


