describe('Owner flow', () => {
  it('loads owner dashboard after login', () => {
    cy.visit('/auth/login');
    cy.get('input[formcontrolname="email"]').clear().type('karim@generator.example');
    cy.get('input[formcontrolname="password"]').clear().type('password123');
    cy.get('mat-select[formcontrolname="role"]').click();
    cy.contains('Generator Owner').click();
    cy.contains('Continue').click();
    cy.url().should('include', '/owner');
  });
});





