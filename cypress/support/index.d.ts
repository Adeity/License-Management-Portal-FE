/// <reference types="cypress" />

import {OrganizationTypeNumeric} from "@/enums/OrganizationTypeNumeric";

declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command login
         * @example cy.login('a@a.com', 'password')
         */
        login(email: string, password: string): Chainable<Element>;

        /**
         * @example cy.createOrgAsAdmin('org name', 'Reseller')
         */
        createOrgAsAdmin(name: string, type: OrganizationTypeNumeric, parentOrgName?: string): Chainable<Element>;
    }
}