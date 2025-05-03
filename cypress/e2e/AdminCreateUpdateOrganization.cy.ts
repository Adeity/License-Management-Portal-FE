import {faker} from '@faker-js/faker';
import {OrganizationType} from "../../enums/OrganizationType";

describe('(admin) create update organization', () => {
  //
  it('can update the name of a reseller', () => {
          cy.visit('')
    cy.login("admin@p.com", "Admin123!")

    const newOrgName = faker.string.uuid()
    cy.createOrgAsAdmin(newOrgName, OrganizationType.Reseller)

    cy.contains('td', newOrgName)
        .closest('tr')
        .click()

    cy.contains('button', 'General').should('exist')
    cy.contains('button', 'Package Details').should('exist')

    const updatedOrgName = faker.string.uuid()
    cy.contains('button', /edit/i).click()

    cy.contains('button', /submit changes/i).should('be.disabled')

    cy.get('[data-cy-test="name-input"] input').clear()

    cy.contains('button', /submit changes/i).should('not.be.disabled')
    cy.contains('button', /submit changes/i).click()

    cy.contains('Name is required').should('exist')

    cy.get('[data-cy-test="name-input"] input').type(updatedOrgName)

    cy.contains('button', /submit changes/i).click()
    cy.wait(500)

    cy.get('[data-cy-test="detail-parent-organization"]').should('not.exist')
    cy.contains(newOrgName).should('not.exist')
    cy.contains(updatedOrgName).should('exist')
  })


  it('can create organization and edit his parent organization', () => {
          cy.visit('')
    cy.login("admin@p.com", "Admin123!")

    const reseller1 = faker.string.uuid()
    const reseller2 = faker.string.uuid()
    const organization = faker.string.uuid()
    cy.createOrgAsAdmin(reseller1, OrganizationType.Reseller)
    cy.createOrgAsAdmin(reseller2, OrganizationType.Reseller)
    cy.createOrgAsAdmin(organization, OrganizationType.Organization, reseller1)

    cy.contains('td', organization)
        .closest('tr')
        .click()
    cy.contains('button', 'General').should('not.exist')
    cy.contains('button', 'Package Details').should('not.exist')

    cy.contains('button', /edit/i).click()

    cy.contains('button', /submit changes/i).should('be.disabled')

    cy.get('[data-cy-test="parent-organization-select"] select').select(reseller2)

    cy.contains('button', /submit changes/i).should('not.be.disabled')
    cy.contains('button', /submit changes/i).click()
    cy.wait(500)

    cy.get('[data-cy-test="detail-parent-organization"]').should('exist')
    cy.contains(reseller1).should('not.exist')
    cy.contains(reseller2).should('exist')
  })
  it('delete and restore organization', () => {
    cy.visit('')
    cy.login("admin@p.com", "Admin123!")

    const newOrgName = faker.string.uuid()
    cy.createOrgAsAdmin(newOrgName, OrganizationType.Reseller)

    cy.contains('td', newOrgName)
        .closest('tr')
        .click()

    cy.contains('button', /delete/i)
        .click()

    cy.contains('This organization has been deleted').should('exist')

    cy.contains('button', /restore/i)
        .click()

    cy.wait(1000)

    cy.contains('button', 'General').should('exist')
    cy.contains('This organization has been deleted').should('not.exist')

  })
})