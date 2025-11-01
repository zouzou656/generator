describe('Authentication', () => {
  it('shows login form', () => {
    cy.visit('/auth/login');
    cy.get('input[formcontrolname="email"]').should('exist');
  });
});





