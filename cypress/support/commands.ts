/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare global {
  namespace Cypress {
    interface Chainable {
      // login(email: string, password: string): Chainable<void>
      // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>

        /**
         * Custom command login
         * @example cy.login('a@a.com', 'password')
         */
        login(email: string, password: string): Chainable<Element>;
        loginAdmin(): Chainable<Element>;
        loginReseller(): Chainable<Element>;
        logoutAndLoginReseller(): Chainable<Element>;
        logout(): Chainable<Element>;

        /**
         * @example cy.createOrgAsAdmin('org name', 'Reseller')
         */
        createOrgAsAdmin(name: string, type: OrganizationType, parentOrgName?: string): Chainable<Element>;
        createOrgAsReseller(name: string): Chainable<Element>;

        visitResellersChildOrganizationDetail(name: string): Chainable<Element>;

        loadNextPage(): Chainable<Element>;
        findOrganizationOrPaginate(name: string): Chainable<Element>;
        clickOnOrganizationInTable(name: string): Chainable<Element>;
        deleteAllPackageDetails(): Chainable<Element>;
        moveLicense(targetOrg: string): Chainable<Element>;
        assignPackage(quantity: number): Chainable<Element>;
        generateLicense(): Chainable<Element>;
        assignToResellerPackageDetails(quantity: number): Chainable<Element>;

    }
  }
}

import { OrganizationType } from "../../enums/OrganizationType"

const resellerName = "ECorp CHINA"

Cypress.Commands.add('login', (email: string, password: string) => {
    cy.location('pathname').should('eq', '/login')

    cy.get('#email').type(email) // using id
    cy.get('#password').type(password) // using id

    cy.contains('button', 'Sign In')
        .should('be.visible')
        .click()
})

Cypress.Commands.add('loginAdmin', () => {
    cy.login("admin@p.com", "Admin123!")
})
Cypress.Commands.add('loginReseller', () => {
    cy.login("reseller1@p.com", "Admin123!")
})
Cypress.Commands.add('logoutAndLoginReseller', () => {
    cy.logout();
    cy.login("reseller1@p.com", "Admin123!")
})

Cypress.Commands.add('logout', () => {
    cy.get('button[aria-label="Current User"]').click()
    cy.contains('button', /sign out/i)
        .should('be.visible')
        .click()
    cy.location('pathname').should('eq', '/login')
})

Cypress.Commands.add('createOrgAsAdmin', (name: string, type: OrganizationType, parentOrgName?: string) => {
    cy.contains('button', /create/i)
        .should('be.visible')
        .click()

    cy.get('[data-cy-test="name-input"] input').type(name)
    cy.get('#organization-type-select').select(type.toString())
    if (type === OrganizationType.Organization && parentOrgName) {
        cy.get('#parent-org-select').select(parentOrgName)
    }

    cy.contains('button', /create organization/i).click()

    cy.location('pathname').should('eq', '/organizations')
})

Cypress.Commands.add('createOrgAsReseller', (name: string) => {
    cy.contains('button', /create/i)
        .should('be.visible')
        .click()

    cy.get('[data-cy-test="name-input"] input').type(name)

    cy.contains('button', /create organization/i).click()

    cy.location('pathname').should('eq', '/reseller')
})


Cypress.Commands.add('visitResellersChildOrganizationDetail', (name: string) => {
    cy.location('pathname').should('eq', '/reseller')
    cy.findOrganizationOrPaginate(name)
    cy.clickOnOrganizationInTable(name)
    cy.contains('h4', name)
})

Cypress.Commands.add('loadNextPage', () => {
    cy.get('button[aria-label="Go to next page"]')
        .should('not.be.disabled')
        .click()

    cy.get('table tbody tr', { timeout: 10000 }).should('exist')
})


Cypress.Commands.add('findOrganizationOrPaginate', (name: string) => {
    cy.get('td[data-cy-test="name"]').then(($cells) => {
        const found = $cells.toArray().some(cell => cell.textContent.trim() === name)

        if (found) {
            cy.log('✅ Organization found', name)
        } else {
            cy.log('➡️ Not found, loading next page...')
            cy.loadNextPage().then(() => {
                cy.findOrganizationOrPaginate(name)
            })
        }
    })
})


Cypress.Commands.add('clickOnOrganizationInTable', (name: string) => {
    cy.contains('td[data-cy-test="name"]', name).click()
})

Cypress.Commands.add('deleteAllPackageDetails', () => {
    cy.get('body').then(($body) => {
        if ($body.find('button[data-testid="actions-button"]').length) {
            // Button exists — perform the delete sequence
            cy.get('button[data-testid="actions-button"]').first().click();
            cy.contains('div', /delete/i).click();
            cy.contains('button', /delete/i).click();
            cy.contains('Package detail deleted successfully').should('exist');
            cy.contains('button', /close/i).click();

            // Wait briefly for UI to update
            cy.wait(500);

            // Recurse: check again
            cy.deleteAllPackageDetails();
        } else {
            cy.log('✅ No more actions buttons — stopping.');
        }
    });
})

// login as admin and assign to reseller
Cypress.Commands.add('assignToResellerPackageDetails', (quantity: number) => {
    cy.visit('')
    cy.loginAdmin()
    cy.findOrganizationOrPaginate(resellerName)
    cy.clickOnOrganizationInTable(resellerName)

    cy.contains('button', 'Package Details').should('exist').click()

    cy.deleteAllPackageDetails()

    // there should be three packages available
    cy.assignPackage(quantity)

    cy.get('table tbody tr').should('have.length', 1)
})


Cypress.Commands.add('moveLicense', (targetOrg: string) => {
    cy.get('button[data-testid="actions-button"]').first().click();
    cy.contains('li', /move/i).click()
    cy.contains('h2', /move license/i).should('exist')
    cy.get('#move-license-select').select(targetOrg)
    cy.get('button[data-cy-test="confirm-move-license-button"]').should('not.be.disabled')
    cy.get('button[data-cy-test="confirm-move-license-button"]').click()
    cy.contains(/license moved successfully/i).should('exist')
    cy.contains('button', /close/i).click()
})

Cypress.Commands.add('assignPackage', (quantity: number) => {

    cy.contains('button', /assign new package/i).click()
    cy.contains('h2', /assign new package/i).should('exist')

    cy.get('[data-cy-test="license-count-input"]').should('exist').clear()
    cy.get('[data-cy-test="license-count-input"]').type('2000001')

    cy.get('button[data-cy-test="confirm-assign-package-button"]').should('be.disabled')

    cy.get('#package-detail-select').select(1)

    cy.get('button[data-cy-test="confirm-assign-package-button"]').should('not.be.disabled')
    cy.get('button[data-cy-test="confirm-assign-package-button"]').click()

    cy.contains('Please enter a number between 1 and 2000').should('exist')


    cy.get('[data-cy-test="license-count-input"]').clear()
    cy.get('[data-cy-test="license-count-input"]').type(quantity.toString())

    cy.get('button[data-cy-test="confirm-assign-package-button"]').click()

    cy.contains(/Successfully assigned/i)
    cy.contains('button', /close/i).click()
})


Cypress.Commands.add('generateLicense', () => {
    cy.contains('button', /create new license/i).click()

    cy.get('#license-type-select').should('exist').select(1)
    cy.get('#tos-checkbox').should('exist').click();

    cy.contains('button', /confirm/i).click()
    cy.contains('License created successfully').should('exist')

    cy.contains('button', /continue/i).click()
})
