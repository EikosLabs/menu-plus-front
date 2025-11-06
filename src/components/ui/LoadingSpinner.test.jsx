import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Cargando información...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Loading data...';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'h-screen', 'items-center', 'justify-center');
  });

  it('renders background pattern', () => {
    const { container } = render(<LoadingSpinner />);
    const bgPattern = container.querySelector('.neo-bg-dots');
    expect(bgPattern).toBeInTheDocument();
  });
});
