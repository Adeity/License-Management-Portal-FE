import {faker} from "@faker-js/faker";

describe('moving license', () => {

    it('assign package, create two orgs, generate license, move license', () => {
        const numOfLicensesToAssign = 100

        cy.assignToResellerPackageDetails(numOfLicensesToAssign)

        cy.logoutAndLoginReseller()

        const newOrgName1 = faker.string.uuid()
        const newOrgName2 = faker.string.uuid()
        cy.createOrgAsReseller(newOrgName1)
        cy.createOrgAsReseller(newOrgName2)

        cy.visitResellersChildOrganizationDetail(newOrgName1)
        cy.contains('button', /licenses/i).click()

        cy.generateLicense()
        cy.generateLicense()
        cy.generateLicense()

        cy.get('table tbody tr').should('have.length', 3)

        // visit other org to see he has no licenses
        cy.visit('reseller')
        cy.visitResellersChildOrganizationDetail(newOrgName2)
        cy.contains('button', /licenses/i).click()

        cy.get('table tbody tr').should('have.length', 0)

        cy.visit('reseller')
        cy.visitResellersChildOrganizationDetail(newOrgName1)
        cy.contains('button', /licenses/i).click()

        cy.get('table tbody tr').should('have.length', 3)

        cy.moveLicense(newOrgName2)
        cy.get('table tbody tr').should('have.length', 2)

        cy.moveLicense(newOrgName2)
        cy.get('table tbody tr').should('have.length', 1)

        cy.visit('reseller')
        cy.visitResellersChildOrganizationDetail(newOrgName2)
        cy.contains('button', /licenses/i).click()
        cy.get('table tbody tr').should('have.length', 2)
    })
})
