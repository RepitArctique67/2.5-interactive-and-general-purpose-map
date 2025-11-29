import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

export const TestWrapper = ({ children }) => {
    const testQueryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    );
};

export function renderWithProviders(ui, { ...options } = {}) {
    return render(ui, { wrapper: TestWrapper, ...options });
}

export * from '@testing-library/react';
