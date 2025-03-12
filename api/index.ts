import { getOrganizationByReseller, getOrganizationsMock } from "./organizations";

const mock = true;
let getOrganizationsFn = getOrganizationByReseller;

if (mock) {
    getOrganizationsFn = getOrganizationsMock
}

export {getOrganizationsFn as getOrganizations}