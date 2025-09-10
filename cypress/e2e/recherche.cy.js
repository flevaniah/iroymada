/// <reference types="cypress" />

describe('Page Recherche - Tests E2E', () => {
  beforeEach(() => {
    // Toujours démarrer sur la page recherche
    cy.visit('http://localhost:3000/recherche');
  });

  it('Affiche le titre et la structure de la page', () => {
    cy.contains("Recherche des services d'urgences").should('be.visible');
    cy.get('button').contains('Liste').should('exist');
    cy.get('button').contains('Carte').should('exist');
    cy.get('select').should('exist'); // tri
  });

  it('Peut changer de vue Liste <-> Carte', () => {
    cy.get('button').contains('Carte').click();
    cy.get('.leaflet-container').should('exist'); // Vérifie que la carte est affichée

    cy.get('button').contains('Liste').click();
    cy.get('.grid').should('exist'); // Vérifie que la liste est affichée
  });

  it('Peut changer le tri', () => {
    cy.get('select').select('distance');
    cy.get('select').should('have.value', 'distance');

    cy.get('select').select('name');
    cy.get('select').should('have.value', 'name');
  });

  it('Affiche un état de chargement', () => {
    cy.intercept('GET', '/api/search*', { delay: 1000 }).as('slowSearch');
    cy.visit('http://localhost:3000/recherche?q=test');
    cy.contains('Recherche en cours...').should('be.visible');
  });

  it('Affiche un message quand aucun résultat', () => {
    cy.intercept('GET', '/api/search*', { body: { centers: [] } }).as('emptySearch');
    cy.visit('http://localhost:3000/recherche?q=vide');

    cy.contains('Aucun centre trouvé').should('be.visible');
    cy.contains('Effacer les filtres').click();
  });

  it('Affiche des résultats en liste', () => {
    cy.intercept('GET', '/api/search*', { fixture: 'search-results.json' }).as('search');
    cy.visit('http://localhost:3000/recherche?q=hopital');

    cy.wait('@search');
    cy.get('.grid').should('exist');
    cy.get('.grid .rounded-lg').should('have.length.greaterThan', 0); 
  });

  it('Navigue avec la pagination', () => {
    cy.intercept('GET', '/api/search*', { fixture: 'search-results.json' }).as('search');
    cy.visit('http://localhost:3000/recherche?q=hopital');

    cy.wait('@search');
    cy.contains('Suivant').click();
    cy.url().should('include', 'page=2');
  });
});
