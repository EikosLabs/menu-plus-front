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

  it('applies correct variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('neo-btn-primary');
  });

  it('applies correct size classes', () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('neo-btn-lg');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows loading spinner when loading prop is true', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);

    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with correct button type', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders all variant types correctly', () => {
    const variants = ['primary', 'secondary', 'danger', 'success', 'outline', 'white'];

    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>{variant}</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('passes additional props to button element', () => {
    render(<Button data-testid="test-button" aria-label="Test Button">Test</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });
});
