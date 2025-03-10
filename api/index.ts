import { getOrganizations, getOrganizationsMock } from "./organizations";

const mock = true;
let getOrganizationsFn = getOrganizations;

if (mock) {
    getOrganizationsFn = getOrganizationsMock
}

export {getOrganizationsFn as getOrganizations}