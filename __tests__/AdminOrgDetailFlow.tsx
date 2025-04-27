import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useParams, useRouter} from 'next/navigation';
import { useCustomSession } from '@/context/SessionContext';
import {deleteOrganizationPackageDetails} from "@/api/organizations";
import useFetchApi from '@/hooks/useFetchApi';
import { useOrganizationByIdHook } from '@/hooks/useOrganizationById';
import {createOrganizationPackageDetails} from "@/api/organizations";



jest.mock('@/hooks/useOrganizationById', () => ({
    useOrganizationByIdHook: jest.fn(),
}));

jest.mock('@/hooks/useFetchApi', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('next/navigation', () => {
    const actual = jest.requireActual('next/navigation');
    return {
        ...actual,
        useRouter: jest.fn(),
        useParams: jest.fn()
    };
});

jest.mock('@/context/SessionContext', () => {
    const actual = jest.requireActual('@/context/SessionContext');
    return {
        ...actual,
        useCustomSession: jest.fn(),
    };
});

// Mock the loginPost API
jest.mock('@/api/login', () => ({
    loginPost: jest.fn(),
}));

// Mock the  API
jest.mock('@/api/organizations', () => ({
    getAllOrganizationsPaginated: jest.fn(),
    createOrganization: jest.fn(),
    deleteOrganizationPackageDetails: jest.fn(),
    createOrganizationPackageDetails: jest.fn(),
}));

jest.mock('@/hooks/availableOrganizationTypesHook', () => ({
    useAvailableOrganizationTypes: jest.fn(() => (
        {
        data: [
                { id: 1, name: 'Reseller' },
                { id: 2, name: 'Organization' },
            ],
            loading: false,
            error: null
        }
    )),
}))

jest.mock('@toolpad/core', () => {
    const actual = jest.requireActual('@toolpad/core');
    return {
        ...actual,
        useActivePage: jest.fn(),
    };
});


jest.mock('@/hooks/getResellersHook', () => ({
    getResellersHook: jest.fn(() => (
        {

            data:
                [
                    {
                        "name": "Reseller 1",
                        "parentOrganizationId": null,
                        "id": 3,
                        "organizationTypeId": 1,
                    },
                    {
                        "name": "Reseller 2",
                        "parentOrganizationId": null,
                        "id": 4,
                        "organizationTypeId": 1,
                    }
                ],
            loading: false,
            error: null
        }
    )),
}))

import { loginPost } from '@/api/login';
import LoginPage from "@/app/login/page";
import OrganizationListPage from "@/app/(dashboard)/(adminPages)/organizations/page";
import {getAllOrganizationsPaginated} from "@/api/organizations";
import CreateOrganizationPage from "@/app/(dashboard)/(adminPages)/organizations/create/page";
import OrganizationDetailPage from "@/app/(dashboard)/(adminPages)/organizations/[id]/page";

describe('Assign package flow, redirects unauthenticated users to login, admin logs in', () => {
    const mockPush = jest.fn();
    const mockSetCustomSession = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useParams as jest.Mock).mockReturnValue({ id: 1 });

        // Mock session hook to simulate unauthenticated state initially
        (useCustomSession as jest.Mock).mockReturnValue({
            customSession: null,
            setCustomSession: mockSetCustomSession,
        });

        (useOrganizationByIdHook as jest.Mock).mockReturnValue({
            data: {
                id: 1,
                name: 'Test Organization',
                organizationType: 'Reseller',
                organizationTypeId: 1,  // Important for tab rendering
                isDeleted: false,
                parentOrganization: 'Parent Org',
                organizationPackageDetails: [
                    {
                        id: 10,
                        packageDetailTitle: 'Package 1',
                        serialNumbersCount: 100,
                        packageDetailId: 123,
                    },
                ],
            },
            loading: false,
            error: null,
            refetch: jest.fn(),
        });

        (useFetchApi as jest.Mock).mockImplementation((fetchFn) => {
            return {
                data: [
                    {
                        id: 123,
                        title: 'Package 1',
                        productNumber: 'PN-001',
                        productName: 'Product Name 1',
                    },
                    {
                        id: 124,
                        title: 'Package 2',
                        productNumber: 'PN-002',
                        productName: 'Product Name 2',
                    },
                ],
                loading: false,
                error: null,
                refetch: jest.fn(),
            };
        });

        localStorage.clear();
        jest.clearAllMocks();
    });

    it('delete an assigned package detail belonging to a reseller', async () => {
        // Setup loginPost to succeed and return user info
        (loginPost as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => ({
                email: 'admin@example.com',
                role: 'Admin',
                id: 1,
            }),
        });

        const { rerender, container } = render(
            <LoginPage />
        );

        // Should be on login page
        expect(await screen.findByText(/sign in/i, {selector: "h1"})).toBeInTheDocument()

        // Fill the form
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const signInButton = screen.getByRole('button', { name: /sign in/i });

        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(signInButton);

        // Should call setCustomSession with expected user data
        await waitFor(() => {
            expect(mockSetCustomSession).toHaveBeenCalledWith({
                user: {
                    email: 'admin@example.com',
                    role: 'Admin',
                    id: 1,
                },
            });
        });

        // Should save session to localStorage
        expect(localStorage.getItem('user')).toContain('"role":"Admin"');

        // Should redirect to /organizations

        expect(mockPush).toHaveBeenCalledWith('/organizations');


        (getAllOrganizationsPaginated as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => (
                {
                    items: [
                        {
                            id: 1,
                            name: "bla",
                            organizationType: "Reseller",
                            parentOrganization: "Reseller 1"
                        }],
                    totalItems: 1,
                    pageNumber: 1,
                    pageSize: 10,
                    nextPage: false,
                    previousPage: false,
                    totalPages: 1
                }
            ),
        });

        rerender(<OrganizationListPage />)
        await waitFor(() => {
            expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Reseller 1/i)).toBeInTheDocument();
        });

        // click on the first organization
        const firstOrg = await screen.getByText("Reseller 1")
        await userEvent.click(firstOrg);

        expect(mockPush).toHaveBeenCalledWith('/organizations/1');

        rerender(<OrganizationDetailPage />)

        expect(screen.getByText(/Edit/i)).toBeInTheDocument();

        const packageDetailsTab = screen.getByRole('tab', { name: /Package Details/i });
        await userEvent.click(packageDetailsTab);
        expect(screen.getByText(/Package 1/i)).toBeInTheDocument();


        const actionsButton = screen.getByTestId('actions-button');
        await userEvent.click(actionsButton);

        await userEvent.click(screen.getByText(/Delete/i))

        await waitFor(async () => await expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument())

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        await userEvent.click(cancelButton);
        await waitFor(() => expect(screen.queryByText(/Confirm Deletion/i)).toBeNull())


        await userEvent.click(actionsButton);
        await userEvent.click(screen.getByText(/Delete/i))

        await waitFor(async () => await expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument())
        const confirmDeletButton = screen.getByRole('button', { name: /Delete/i });
        await userEvent.click(confirmDeletButton);

        expect(deleteOrganizationPackageDetails).toHaveBeenCalled();

    });


    it('flow to assign a package detail to a reseller', async () => {
        // Setup loginPost to succeed and return user info
        (loginPost as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => ({
                email: 'admin@example.com',
                role: 'Admin',
                id: 1,
            }),
        });

        const { rerender, container } = render(
            <LoginPage />
        );

        // Should be on login page
        expect(await screen.findByText(/sign in/i, {selector: "h1"})).toBeInTheDocument()

        // Fill the form
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const signInButton = screen.getByRole('button', { name: /sign in/i });

        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(signInButton);

        // Should call setCustomSession with expected user data
        await waitFor(() => {
            expect(mockSetCustomSession).toHaveBeenCalledWith({
                user: {
                    email: 'admin@example.com',
                    role: 'Admin',
                    id: 1,
                },
            });
        });

        // Should save session to localStorage
        expect(localStorage.getItem('user')).toContain('"role":"Admin"');

        // Should redirect to /organizations

        expect(mockPush).toHaveBeenCalledWith('/organizations');


        (getAllOrganizationsPaginated as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => (
                {
                    items: [
                        {
                            id: 1,
                            name: "bla",
                            organizationType: "Reseller",
                            parentOrganization: "Reseller 1"
                        }],
                    totalItems: 1,
                    pageNumber: 1,
                    pageSize: 10,
                    nextPage: false,
                    previousPage: false,
                    totalPages: 1
                }
            ),
        });

        rerender(<OrganizationListPage />)
        await waitFor(() => {
            expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Reseller 1/i)).toBeInTheDocument();
        });

        // click on the first organization
        const firstOrg = await screen.getByText("Reseller 1")
        await userEvent.click(firstOrg);

        expect(mockPush).toHaveBeenCalledWith('/organizations/1');

        rerender(<OrganizationDetailPage />)

        expect(screen.getByText(/Edit/i)).toBeInTheDocument();

        const packageDetailsTab = screen.getByRole('tab', { name: /Package Details/i });
        await userEvent.click(packageDetailsTab);
        expect(screen.getByText(/Package 1/i)).toBeInTheDocument();


        // under div role presentation


        const assignNewPackageModalButton = screen.getByText(/Assign new package/i);
        await userEvent.click(assignNewPackageModalButton);

        const assignPackageModal = screen.getByTestId('assign-package-modal');

        expect(await within(assignPackageModal).findByText(/Assign Package/i)).toBeInTheDocument();
        const confirmButton = await within(assignPackageModal).findByRole('button', { name: /Assign/i });
        expect(confirmButton).toBeDisabled();


        const packageSelect = within(assignPackageModal).getByRole('combobox', { name: /Package/i });
        await waitFor(async () => {
            const packageOptionOne = within(packageSelect).getAllByRole('option')
            await expect(packageOptionOne[1]).toBeInTheDocument()
            console.log('got here')
            console.log(packageOptionOne[1].textContent)
            await userEvent.selectOptions(packageSelect, packageOptionOne[1].textContent);
        })

        // set number of licenses
        const numberOfLicensesInput = within(assignPackageModal).getByLabelText(/Number of licenses/i);
        await userEvent.clear(numberOfLicensesInput);
        await userEvent.type(numberOfLicensesInput, '20000');

        await waitFor(() => expect(confirmButton).not.toBeDisabled());

        await userEvent.click(confirmButton)

        expect(await within(assignPackageModal).findByText(/Please enter a number between 1 and 2000/i)).toBeInTheDocument();

        await userEvent.clear(numberOfLicensesInput);
        await userEvent.type(numberOfLicensesInput, '500');

        await userEvent.click(confirmButton)

        expect(await within(assignPackageModal).queryByText(/Please enter a number between 1 and 2000/i)).not.toBeInTheDocument();

        await waitFor(() => expect(createOrganizationPackageDetails).toHaveBeenCalled());
    });


    it('flow to see that reseller already has all available package details', async () => {
        // Setup loginPost to succeed and return user info
        (loginPost as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => ({
                email: 'admin@example.com',
                role: 'Admin',
                id: 1,
            }),
        });

        const { rerender, container } = render(
            <LoginPage />
        );

        // Should be on login page
        expect(await screen.findByText(/sign in/i, {selector: "h1"})).toBeInTheDocument()

        // Fill the form
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const signInButton = screen.getByRole('button', { name: /sign in/i });

        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(signInButton);

        // Should call setCustomSession with expected user data
        await waitFor(() => {
            expect(mockSetCustomSession).toHaveBeenCalledWith({
                user: {
                    email: 'admin@example.com',
                    role: 'Admin',
                    id: 1,
                },
            });
        });

        // Should save session to localStorage
        expect(localStorage.getItem('user')).toContain('"role":"Admin"');

        // Should redirect to /organizations

        expect(mockPush).toHaveBeenCalledWith('/organizations');


        (getAllOrganizationsPaginated as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => (
                {
                    items: [
                        {
                            id: 123,
                            name: "Package 1",
                            organizationType: "Reseller",
                            parentOrganization: "Reseller 1"
                        },
                        {
                            id: 124,
                            title: 'Package 2',
                            productNumber: 'PN-002',
                            productName: 'Product Name 2',
                        },
                        ],
                    totalItems: 1,
                    pageNumber: 1,
                    pageSize: 10,
                    nextPage: false,
                    previousPage: false,
                    totalPages: 1
                }
            ),
        });

        rerender(<OrganizationListPage />)
        await waitFor(() => {
            expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Reseller 1/i)).toBeInTheDocument();
        });

        // click on the first organization
        const firstOrg = await screen.getByText("Reseller 1")
        await userEvent.click(firstOrg);

        expect(mockPush).toHaveBeenCalledWith('/organizations/123');

        rerender(<OrganizationDetailPage />)

        expect(screen.getByText(/Edit/i)).toBeInTheDocument();

        const packageDetailsTab = screen.getByRole('tab', { name: /Package Details/i });
        await userEvent.click(packageDetailsTab);
        expect(screen.getByText(/Package 1/i)).toBeInTheDocument();


        const assignNewPackageModalButton = screen.getByText(/Assign new package/i);
        await userEvent.click(assignNewPackageModalButton);

        const assignPackageModal = screen.getByTestId('assign-package-modal');

        expect(await within(assignPackageModal).findByText(/Assign Package/i)).toBeInTheDocument();
        const confirmButton = await within(assignPackageModal).findByRole('button', { name: /Assign/i });
        expect(confirmButton).toBeDisabled();

        expect(within(assignPackageModal).findByText(/There are no packages left to assign to this organization/i))

    });
});
