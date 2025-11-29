import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent, trackPageView, trackError } from './analytics';

describe('Analytics Utility', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('logs event in dev mode', () => {
        trackEvent('TestCategory', 'TestAction', 'TestLabel', 123);
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Analytics] Event: TestCategory | TestAction | TestLabel | 123')
        );
    });

    it('logs page view in dev mode', () => {
        trackPageView('/test-page');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Analytics] Page View: /test-page')
        );
    });

    it('logs error in dev mode', () => {
        trackError('Test Error', true);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Analytics] Error: Test Error (Fatal: true)')
        );
    });
});
