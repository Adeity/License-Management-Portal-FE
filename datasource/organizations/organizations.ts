import {DataModel, DataSource} from "@toolpad/core/Crud";
import {
    createOrganization,
    deleteOrganization,
    getAllOrganizations,
    getOrganizationById,
    updateOrganization
} from "@/api/organizations";
import {GridSingleSelectColDef} from "@mui/x-data-grid";
const orgTypeSelect: GridSingleSelectColDef = {field: 'organizationTypeId', headerName: 'Type', flex: 1, type: "singleSelect", valueOptions: [
        {
            value: 2, label: "Organization"
        },
        {
            value: 1, label: "Reseller"
        },
    ], hideSortIcons: true}

export interface Organization extends DataModel {
    id: number;
    name: string;
    organizationTypeId: string;
    parentOrganization: string;
}

export const organizationsDataSource: DataSource<Organization> = {
    fields: [
        { field: 'id', headerName: 'ID', disableColumnMenu: true, hideSortIcons: true },
        { field: 'name', headerName: 'Name', flex: 1, disableColumnMenu: true, hideSortIcons: true },
        orgTypeSelect,
        { field: 'parentOrganization', headerName: 'Parent organization', flex: 1, disableColumnMenu: true, hideSortIcons: true },
    ],
    getMany: ({ paginationModel, filterModel, sortModel }) => {
        return new Promise<{ items: Organization[]; itemCount: number }>(async (resolve) => {
            let processedorganizations = await getAllOrganizations(paginationModel.page, paginationModel.pageSize)
            const json = await processedorganizations.json()

            const newItems = []
            json.items.forEach(item => {
                let parentOrgName = ""
                if (item.parentOrganization) {
                    parentOrgName = `[${item.parentOrganization.id}] ${item.parentOrganization.name}`
                }
                const member = {
                    ...item,
                    parentOrganization: parentOrgName
                }
                newItems.push(member)
            })

            resolve({
                items: newItems,
                itemCount: json.totalItems,
            });
        });
    },
    getOne: (organizationId) => {
        return new Promise<Organization>(async (resolve, reject) => {
                const organizationToShow = await getOrganizationById(organizationId)
            const json = await organizationToShow.json()

                if (json) {
                    resolve(json);
                } else {
                    reject(new Error('organization not found'));
                }
            }
        )
    },
    createOne: async (data) => {
        const newOrganization = await createOrganization(data)
        if (newOrganization.status === 400) {
            const json = await newOrganization.json();
            const errorsArray = Object.entries(json.errors).flatMap(([field, messages]) =>
                messages.map(message => `${field}: ${message}`)
            );
            const stringErrors = errorsArray.join(', ')
            throw new Error(stringErrors)
        }
        return new Promise((resolve, reject)=>{resolve()});
    },
    updateOne: async (organizationId, data) => {
        const res = await updateOrganization(data);
        if (res.status === 400) {
            const json = await res.json();
            const errorsArray = Object.entries(json.errors).flatMap(([field, messages]) =>
                messages.map(message => `${field}: ${message}`)
            );
            const stringErrors = errorsArray.join(', ')
            throw new Error(stringErrors)
        }
        return new Promise((resolve, reject) => {
            resolve();
        })
    },
    deleteOne: async (organizationId) => {
        const res = await deleteOrganization(organizationId);
    },
    validate: (formValues) => {
        let issues: { message: string; path: [keyof Organization] }[] = [];

        if (!formValues.organizationTypeId) {
            issues = [...issues, { message: 'Organization type is required', path: ['organizationTypeId'] }];
        }
        if (!formValues.name) {
            issues = [...issues, { message: 'Name is required', path: ['name'] }];
        }
        if (formValues.name && formValues.name.length < 3) {
            issues = [
                ...issues,
                {
                    message: 'Title must be at least 3 characters long',
                    path: ['name'],
                },
            ];
        }

        return { issues };
    },
};
