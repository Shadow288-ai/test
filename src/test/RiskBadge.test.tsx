import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RiskBadge } from '../components/RiskBadge';

describe('RiskBadge', () => {
 
  afterEach(() => {
    cleanup();
  });

  it('renders Low Risk with success styling', () => {
    render(<RiskBadge level="Low" />);
    const badge = screen.getByText('Low Risk');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-success');
  });

  it('renders Medium Risk with warning styling', () => {
    render(<RiskBadge level="Medium" />);
    const badge = screen.getByText('Medium Risk');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-warning');
  });

  it('renders High Risk with destructive styling', () => {
    render(<RiskBadge level="High" />);
    const badge = screen.getByText('High Risk');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-destructive');
  });

  it('accepts additional className props', () => {
    
    const { container } = render(<RiskBadge level="Low" className="mt-4 custom-test-class" />);
    
    const badge = container.firstChild as HTMLElement;
    
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('Low Risk');
    expect(badge.className).toContain('mt-4');
    expect(badge.className).toContain('custom-test-class');
  });
});
