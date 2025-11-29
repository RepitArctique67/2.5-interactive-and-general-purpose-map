describe('User Journey', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('loads the application', () => {
        cy.contains('Ligne temporelle').should('be.visible');
        cy.contains('Couches').should('be.visible');
    });

    it('allows toggling layers', () => {
        // Wait for layers to load (mocked or real)
        // Assuming real backend is not running, we might need to intercept
        // But for now let's assume we test against a running env or mock it here

        // Mock API response if backend not running
        cy.intercept('GET', '/api/v1/layers*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Test Layer', is_active: true, type: 'geojson' }
                ]
            }
        }).as('getLayers');

        cy.wait('@getLayers');

        cy.contains('Test Layer').should('be.visible');
        cy.get('input[type="checkbox"]').first().click();
        // Verify state change if possible
    });

    it('allows changing timeline year', () => {
        cy.get('.timeline-slider').invoke('val', 2000).trigger('change');
        cy.contains('2000').should('be.visible');
    });
});
