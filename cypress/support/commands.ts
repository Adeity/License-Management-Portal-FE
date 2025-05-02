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
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import { OrganizationType } from "../../enums/OrganizationType"

Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('localhost:3000')
    cy.location('pathname').should('eq', '/login')

    cy.get('#email').type(email) // using id
    cy.get('#password').type(password) // using id

    cy.contains('button', 'Sign In')
        .should('be.visible')
        .click()
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
