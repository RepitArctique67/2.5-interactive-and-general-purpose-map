import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        renderWithProviders(<App />);
        // Check for something that should be always present, e.g., loading state or a known element
        // Since App has Suspense, it might show "Loading 3D Globe..." initially
        expect(screen.getByText(/Loading 3D Globe.../i)).toBeInTheDocument();
    });
});
