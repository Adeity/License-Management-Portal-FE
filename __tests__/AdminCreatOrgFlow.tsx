import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useCustomSession } from '@/context/SessionContext';
import {createOrganization} from "@/api/organizations";

jest.mock('next/navigation', () => {
    const actual = jest.requireActual('next/navigation');
    return {
        ...actual,
        useRouter: jest.fn(),
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
import OrganizationListPage from "@/app/(dashboard)/organizations/page";
import {getAllOrganizationsPaginated} from "@/api/organizations";
import CreateOrganizationPage from "@/app/(dashboard)/organizations/create/page";

describe('Creating organization flow, redirects unauthenticated users to login, admin logs in', () => {
    const mockPush = jest.fn();
    const mockSetCustomSession = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        // Mock session hook to simulate unauthenticated state initially
        (useCustomSession as jest.Mock).mockReturnValue({
            customSession: null,
            setCustomSession: mockSetCustomSession,
        });

        localStorage.clear();
        jest.clearAllMocks();
    });

    it('creates organization type reseller', async () => {
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
                            parentOrganization: "Eaton china"
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
            expect(screen.getByText(/Eaton china/i)).toBeInTheDocument();
        });

        const createButton = screen.getByText(/Create/i);
        expect(createButton).toBeInTheDocument();
        await userEvent.click(createButton);

        expect(mockPush).toHaveBeenCalledWith('/organizations/create');

        rerender(<CreateOrganizationPage />)
        await waitFor(() => {
            expect(screen.getByText(/Create New Organization/i)).toBeInTheDocument();
        });

        (createOrganization as jest.Mock).mockResolvedValueOnce({
            ok: true,
        });

        // Fill the name field (valid case)
        const nameInput = screen.getByLabelText(/name/i, { selector: 'input' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'New Org Name');

        // Select the organization type
        const orgTypeSelect = screen.getByLabelText(/Organization Type/i);
        await userEvent.click(orgTypeSelect);
        await waitFor(async () => {
            const resellerOption = within(orgTypeSelect).getByText("Reseller");
            await expect(resellerOption).toBeInTheDocument()
            await userEvent.selectOptions(orgTypeSelect, "Reseller");
        })

        // Click "Create Organization"
        const submitButton = screen.getByRole('button', { name: /create organization/i });
        await userEvent.click(submitButton);

        // Assert createOrganization was called with correct payload
        await waitFor(() => {
            expect(createOrganization).toHaveBeenCalledWith({
                name: 'New Org Name',
                organizationTypeId: 1, // "Reseller" type ID from your mock
                parentOrganizationId: null, // "Reseller 1" ID
            });
        });

        // Should be redirected after successful creation
        expect(mockPush).toHaveBeenCalledWith('/organizations');
    });

    it('creates organization type organization with first putting in invalid values', async () => {
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
                            parentOrganization: "Eaton china"
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
            expect(screen.getByText(/Eaton china/i)).toBeInTheDocument();
        });

        const createButton = screen.getByText(/Create/i);
        expect(createButton).toBeInTheDocument();
        await userEvent.click(createButton);

        expect(mockPush).toHaveBeenCalledWith('/organizations/create');

        rerender(<CreateOrganizationPage />)
        await waitFor(() => {
            expect(screen.getByText(/Create New Organization/i)).toBeInTheDocument();
        });

        (createOrganization as jest.Mock).mockResolvedValueOnce({
            ok: true,
        });

        const submitButton = screen.getByRole('button', { name: /create organization/i });
        await userEvent.click(submitButton);
        await expect(screen.getByText("Name is required")).toBeInTheDocument()
        await expect(screen.getByText("Parent organization is required")).toBeInTheDocument()

        // Fill the name field (valid case)
        const nameInput = screen.getByLabelText(/name/i, { selector: 'input' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'New Org Name');

        // Select the organization type
        const orgTypeSelect = screen.getByLabelText(/Organization Type/i);
        await userEvent.click(orgTypeSelect);
        await waitFor(async () => {
            const resellerOption = within(orgTypeSelect).getByText("Organization");
            await expect(resellerOption).toBeInTheDocument()
            await userEvent.selectOptions(orgTypeSelect, "Organization");
        })

        // Select the parent organization
        const parentOrgSelect = screen.getByLabelText(/Parent Organization/i);
        await userEvent.click(parentOrgSelect);
        await waitFor(async () => {
            const resellerOption = within(parentOrgSelect).getByText("Reseller 1");
            await expect(resellerOption).toBeInTheDocument()
            await userEvent.selectOptions(parentOrgSelect, "Reseller 1");
        })

        // Click "Create Organization"
        await userEvent.click(submitButton);
        await expect(screen.queryByText("Name is required")).toBeNull();
        await expect(screen.queryByText("Parent organization is required")).toBeNull();

        // Assert createOrganization was called with correct payload
        await waitFor(() => {
            expect(createOrganization).toHaveBeenCalledWith({
                name: 'New Org Name',
                organizationTypeId: 2, // "Reseller" type ID from your mock
                parentOrganizationId: 3, // "Reseller 1" ID
            });
        });

        // Should be redirected after successful creation
        expect(mockPush).toHaveBeenCalledWith('/organizations');
    });
});
