import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button and prevents onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner and disables button when loading', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector('svg.animate-spin');

    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeDisabled();
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('neo-btn-primary');
  });
});
