/**
 * Phased Framework - E2E Tests
 * Testing phase transitions, status indicators, and animations
 */

describe('Phased Framework Demo', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for initial animations to complete
    cy.wait(1000);
  });

  describe('Page Load & Initial State', () => {
    it('should load the demo page with header', () => {
      cy.contains('h1', 'Phased').should('be.visible');
      cy.contains('Intent-first interfaces').should('be.visible');
      cy.screenshot('01-initial-load');
    });

    it('should show the status indicator in idle state', () => {
      cy.get('.status-indicator').first().should('be.visible');
      cy.screenshot('02-status-indicator-idle');
    });

    it('should show forensic mode toggle', () => {
      cy.contains('Adaptive Mode').should('be.visible');
      cy.screenshot('03-forensic-toggle');
    });
  });

  describe('Status Indicator States', () => {
    const statusStates = [
      { name: 'idle', label: 'Ready' },
      { name: 'listening', label: 'Listening...' },
      { name: 'thinking', label: 'Analyzing...' },
      { name: 'processing', label: 'Processing' },
      { name: 'success', label: 'Complete' },
      { name: 'warning', label: 'Attention needed' },
      { name: 'error', label: 'Error' },
    ];

    statusStates.forEach((status, index) => {
      it(`should display ${status.name} status with animation`, () => {
        // Find and click the status button
        cy.contains('button', status.label).click();

        // Wait for animation
        cy.wait(500);

        // Verify the status indicator updated
        cy.get('.status-indicator').first()
          .should('have.class', `status-${status.name}`);

        // Take screenshot of each status
        cy.screenshot(`04-status-${String(index + 1).padStart(2, '0')}-${status.name}`);
      });
    });
  });

  describe('Phase Lifecycle Visualization', () => {
    it('should show all five phases', () => {
      cy.contains('Phase Lifecycle').should('be.visible');

      const phases = ['dormant', 'warming', 'surfaced', 'focused', 'dissolving'];
      phases.forEach(phase => {
        cy.contains(phase, { matchCase: false }).should('exist');
      });

      cy.screenshot('05-phase-lifecycle-overview');
    });

    it('should show phase descriptions when clicked', () => {
      // Click on each phase and verify description appears
      cy.contains('button', 'dormant', { matchCase: false }).click();
      cy.contains('Hidden but subscribed to events').should('be.visible');
      cy.screenshot('06-phase-dormant-description');

      cy.contains('button', 'focused', { matchCase: false }).click();
      cy.contains('Primary user attention').should('be.visible');
      cy.screenshot('07-phase-focused-description');
    });
  });

  describe('Transition Animations', () => {
    it('should trigger surface-in animation', () => {
      cy.contains('button', 'Surface In').click();
      cy.wait(600); // Wait for animation
      cy.screenshot('08-animation-surface-in');
    });

    it('should trigger dissolve-out animation', () => {
      cy.contains('button', 'Dissolve Out').click();
      cy.wait(400); // Wait for animation
      cy.screenshot('09-animation-dissolve-out');
    });
  });

  describe('Interactive Phase Components', () => {
    it('should show phase demo cards', () => {
      cy.contains('Interactive Phase Components').should('be.visible');
      cy.contains('File Upload').should('be.visible');
      cy.contains('Entity Selector').should('be.visible');
      cy.screenshot('10-phase-demo-cards');
    });

    it('should transition card through phases', () => {
      // Find the first card (File Upload)
      cy.contains('File Upload')
        .parents('.glass-elevated')
        .as('fileUploadCard');

      // Initial state should be surfaced (after auto-surface)
      cy.get('@fileUploadCard')
        .find('[class*="phase-"]')
        .should('exist');

      cy.screenshot('11-card-surfaced-state');

      // Click Focus button
      cy.get('@fileUploadCard')
        .contains('button', 'Focus')
        .click();

      cy.wait(400);
      cy.screenshot('12-card-focused-state');

      // Click Blur button
      cy.get('@fileUploadCard')
        .contains('button', 'Blur')
        .click();

      cy.wait(400);
      cy.screenshot('13-card-blurred-state');

      // Click Dissolve button
      cy.get('@fileUploadCard')
        .contains('button', 'Dissolve')
        .click();

      cy.wait(600);
      cy.screenshot('14-card-dissolving-state');
    });

    it('should show staggered card appearance', () => {
      // Reload to see staggered animation
      cy.reload();
      cy.wait(200);
      cy.screenshot('15-cards-staggered-01');
      cy.wait(300);
      cy.screenshot('16-cards-staggered-02');
      cy.wait(400);
      cy.screenshot('17-cards-staggered-03');
    });
  });

  describe('Forensic Mode Toggle', () => {
    it('should toggle between adaptive and forensic modes', () => {
      // Initial state is Adaptive
      cy.contains('Adaptive Mode').should('be.visible');
      cy.screenshot('18-adaptive-mode');

      // Click to toggle to Forensic
      cy.contains('Adaptive Mode').click();
      cy.contains('Forensic Mode').should('be.visible');
      cy.screenshot('19-forensic-mode');

      // Toggle back
      cy.contains('Forensic Mode').click();
      cy.contains('Adaptive Mode').should('be.visible');
    });
  });

  describe('Substrate Hint', () => {
    it('should show substrate hint for dissolved components', () => {
      cy.contains('12 more components available on demand').should('be.visible');
      cy.screenshot('20-substrate-hint');
    });
  });

  describe('Full Page Screenshots', () => {
    it('should capture full page in different states', () => {
      // Full page - default state
      cy.screenshot('21-full-page-default', { capture: 'fullPage' });

      // Set to processing status for busy state
      cy.contains('button', 'Processing').click();
      cy.wait(500);
      cy.screenshot('22-full-page-processing', { capture: 'fullPage' });

      // Set to success status
      cy.contains('button', 'Complete').click();
      cy.wait(500);
      cy.screenshot('23-full-page-success', { capture: 'fullPage' });

      // Toggle forensic mode
      cy.contains('Adaptive Mode').click();
      cy.wait(300);
      cy.screenshot('24-full-page-forensic', { capture: 'fullPage' });
    });
  });
});
