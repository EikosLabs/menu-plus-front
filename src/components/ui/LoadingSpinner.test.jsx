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
});
