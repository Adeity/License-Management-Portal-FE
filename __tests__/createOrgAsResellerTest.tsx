import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CreateOrganizationPage from '@/app/(dashboard)/reseller/organizations/create/page';
import useFetchApi from '@/hooks/useFetchApi';
import { createOrganization } from '@/api/organizations';
import { useRouter } from 'next/navigation';

jest.mock('@/hooks/useFetchApi');
jest.mock('@/api/organizations');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('CreateOrganizationPage', () => {
    const mockUseFetchApi = useFetchApi as jest.Mock;
    const mockCreateOrganization = createOrganization as jest.Mock;
    const pushMock = jest.fn();

    beforeEach(() => {
        mockUseFetchApi.mockReturnValue({
            data: { id: '999', name: 'Reseller Corp' },
            loading: false,
            error: null,
        });
    });

    it('renders initial form state', () => {
        render(<CreateOrganizationPage />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Organization Type')).toHaveValue('Organization');
        expect(screen.getByLabelText('Parent Organization')).toHaveValue('Reseller Corp');
    });

    it('shows validation error for short name', async () => {
        render(<CreateOrganizationPage />);

        const button = screen.getByRole('button', { name: /Create Organization/i });
        await userEvent.click(button);

        expect(await screen.findByText('Name is required')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('Name'), 'AB');
        await userEvent.click(button);

        expect(await screen.findByText('Name must be at least 3 characters long')).toBeInTheDocument();
    });

    it('shows success message on successful creation', async () => {
        mockCreateOrganization.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<CreateOrganizationPage />);

        await userEvent.type(screen.getByLabelText('Name'), 'New Org');
        await userEvent.click(screen.getByRole('button', { name: /Create Organization/i }));

        expect(await screen.findByText('Organization created successfully.')).toBeInTheDocument();
    });

    it('shows error message on failed creation', async () => {
        mockCreateOrganization.mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'API failed' }),
        });

        render(<CreateOrganizationPage />);

        await userEvent.type(screen.getByLabelText('Name'), 'New Org');
        await userEvent.click(screen.getByRole('button', { name: /Create Organization/i }));

        expect(await screen.findByText('API failed')).toBeInTheDocument();
    });

    it('disables form elements while loading or creating', () => {
        mockUseFetchApi.mockReturnValueOnce({ data: null, loading: true, error: null });
        render(<CreateOrganizationPage />);

        expect(screen.getByRole('button', { name: /Create Organization/i })).toBeDisabled();
        expect(screen.queryByLabelText('Parent Organization')).not.toBeInTheDocument();
    });
});