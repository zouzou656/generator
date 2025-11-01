describe('Public portal', () => {
  it('navigates to check bill flow', () => {
    cy.visit('/');
    cy.contains('Check my bill', { matchCase: false }).click();
    cy.url().should('include', '/check-bill');
  });
});





