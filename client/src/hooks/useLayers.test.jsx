import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '../test-utils';
import useLayers from './useLayers';
import layerService from '../services/layerService';

// Mock layerService
vi.mock('../services/layerService', () => ({
    default: {
        getAll: vi.fn(),
    },
}));

describe('useLayers Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and returns layers', async () => {
        const mockLayers = [{ id: '1', name: 'Layer 1' }];
        layerService.getAll.mockResolvedValue({ data: mockLayers });

        const { result } = renderHook(() => useLayers(), {
            wrapper: TestWrapper,
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.layers).toHaveLength(1);
        expect(result.current.layers[0].name).toBe('Layer 1');
    });
});
