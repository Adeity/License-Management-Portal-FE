import { faker } from '@faker-js/faker';
describe('handle package details', () => {
    it('Delete all and then add all three, shows all three', () => {
          cy.visit('localhost:3000')
        // precondition: ECorp CHINA is an existing reseller
        const resellerName = 'ECorp CHINA'

        cy.login("admin@p.com", "Admin123!")
        cy.findOrganizationOrPaginate(resellerName)
        cy.clickOnOrganizationInTable(resellerName)

        cy.contains('button', 'Package Details').should('exist').click()

        cy.deleteAllPackageDetails()

        // there should be three packages to assign
        cy.assignPackage(2000)
        cy.assignPackage(500)
        cy.assignPackage(100)

        cy.contains('button', /assign new package/i).click()
        cy.contains(/There are no packages left to assign to this organization/i).should('exist')
        cy.contains('button', /close/i).click()

        cy.get('table tbody tr').should('have.length', 3)
    })

    it('Delete all then add one package detail with 1 license, log as reseller and be able to create licence with the package, then try again and not be able anymore', () => {
        // precondition: ECorp CHINA is an existing reseller
        const resellerName = 'ECorp CHINA'
        const numOfLicensesToAssign = 2

        cy.visit('localhost:3000')

        cy.login("admin@p.com", "Admin123!")
        cy.findOrganizationOrPaginate(resellerName)
        cy.clickOnOrganizationInTable(resellerName)

        cy.contains('button', 'Package Details').should('exist').click()

        cy.deleteAllPackageDetails()

        // there should be three packages to assign
        cy.assignPackage(numOfLicensesToAssign)

        cy.get('table tbody tr').should('have.length', 1)
        // to be continue, logout and so on
        cy.logout()
        cy.login("reseller1@p.com", "Admin123!")

        cy.location('pathname').should('eq', '/reseller')


        const newOrgName = faker.string.uuid()
        cy.createOrgAsReseller(newOrgName)

        cy.location('pathname').should('eq', '/reseller')
        cy.findOrganizationOrPaginate(newOrgName)
        cy.clickOnOrganizationInTable(newOrgName)

        cy.contains('h4', newOrgName)

        cy.contains('button', /licenses/i).click()

        cy.generateLicense()
        cy.generateLicense()

        cy.contains('button', /create new license/i).click()
        cy.contains(/All license packages have been fully used up/i).should('exist')

    })


    it('Delete all then add one with 1000 licenses, log as reseller, generate three licenses', () => {
        // precondition: ECorp CHINA is an existing reseller
        const resellerName = 'ECorp CHINA'
        const numOfLicensesToAssign = 100

        cy.visit('localhost:3000')

        cy.login("admin@p.com", "Admin123!")
        cy.findOrganizationOrPaginate(resellerName)
        cy.clickOnOrganizationInTable(resellerName)

        cy.contains('button', 'Package Details').should('exist').click()

        cy.deleteAllPackageDetails()

        // there should be three packages to assign
        cy.assignPackage(numOfLicensesToAssign)

        cy.get('table tbody tr').should('have.length', 1)
        // to be continue, logout and so on
        cy.logout()
        cy.login("reseller1@p.com", "Admin123!")

        cy.location('pathname').should('eq', '/reseller')


        const newOrgName = faker.string.uuid()
        cy.createOrgAsReseller(newOrgName)

        cy.location('pathname').should('eq', '/reseller')
        cy.findOrganizationOrPaginate(newOrgName)
        cy.clickOnOrganizationInTable(newOrgName)

        cy.contains('h4', newOrgName)

        cy.contains('button', /licenses/i).click()

        cy.generateLicense()
        cy.generateLicense()
        cy.generateLicense()


        cy.get('table tbody tr').should('have.length', 3)
    })


    it('Delete all log as reseller and be unable to create any license', () => {
        // precondition: ECorp CHINA is an existing reseller
        const resellerName = 'ECorp CHINA'

        cy.visit('localhost:3000')
        cy.login("admin@p.com", "Admin123!")
        cy.findOrganizationOrPaginate(resellerName)
        cy.clickOnOrganizationInTable(resellerName)

        cy.contains('button', 'Package Details').should('exist').click()

        cy.deleteAllPackageDetails()

        cy.get('table tbody tr').should('have.length', 0)

        cy.logout()
        cy.login("reseller1@p.com", "Admin123!")

        cy.location('pathname').should('eq', '/reseller')


        const newOrgName = faker.string.uuid()
        cy.createOrgAsReseller(newOrgName)

        cy.location('pathname').should('eq', '/reseller')
        cy.findOrganizationOrPaginate(newOrgName)
        cy.clickOnOrganizationInTable(newOrgName)

        cy.contains('h4', newOrgName)

        cy.contains('button', /licenses/i).click()
        cy.contains('button', /create new license/i).click()
        cy.contains(/You have not been assigned any licenses package/i).should('exist')
        cy.contains('button', /close/i).click()
    })
})
