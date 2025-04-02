import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from '@/app/(dashboard)/reseller/organizations/[id]/page'
import { useParams } from 'next/navigation'
import fireEvent from '@testing-library/user-event'
import useFetchApi from '@/hooks/useFetchApi'

jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
    useRouter: jest.fn(),
}))

jest.mock('@/hooks/useFetchApi')

// jest.mock('@/components/PaginatedTable', () => ({
//     __esModule: true,
//     default: () => <div data-testid="enhanced-table">Mocked Table</div>,
// }))

jest.mock('@/components/GenerateLicenseModal', () => ({
    __esModule: true,
    SimpleDialog: () => <div data-testid="dialog">Mocked Dialog</div>,
}))

describe('HomePage Component', () => {
    const mockUseFetchApi = useFetchApi as jest.Mock;

    beforeEach(() => {
        (useParams as jest.Mock).mockReturnValue({ id: '123' });

        mockUseFetchApi.mockImplementation((fetchFn: any, deps?: any[]) => {
            const fetchType = fetchFn.toString();

            if (fetchType.includes('getOrganizationById')) {
                return {
                    data: {
                        id: '123',
                        name: 'Test Org',
                        organizationType: 'Reseller',
                        parentOrganization: null,
                    },
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            if (fetchType.includes('getLicensesByOrgId')) {
                return {
                    data: { totalCount: 1, items: [] },
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            if (fetchType.includes('getPackageDetails')) {
                return {
                    data: [
                        {
                            packageDetailsId: 1,
                            packageDetailTitle: 'License A',
                            serialNumbersCount: 10,
                        },
                    ],
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            return { data: null, loading: false, error: null, refetch: jest.fn() };
        });
    });

    it('renders organization details correctly', () => {
        render(<HomePage />);

        expect(screen.getByText('Test Org')).toBeInTheDocument();
        expect(screen.getByLabelText('Id')).toHaveValue('123');
        expect(screen.getByLabelText('Name')).toHaveValue('Test Org');
        expect(screen.getByLabelText('Type')).toHaveValue('Reseller');
        expect(screen.getByLabelText('Parent Organization')).toHaveValue('Null');
    });

    it('should allow tab switching even while loading', async () => {
        // Override the default useFetchApi mock to simulate loading
        (useFetchApi as jest.Mock).mockImplementation((fn: any) => {
            return {
                data: null,
                loading: true,
                error: null,
                refetch: jest.fn(),
            }
        })

        render(<HomePage />)

        const detailTabButton = screen.getByRole("tab", { name: /Detail/i })
        const licenseTabButton = screen.getByRole("tab", { name: /Licenses/i })

        const detailTabPanel = screen.getByTestId("tab-panel-0", { hidden: true })
        const licenseTabPanel = screen.getByTestId("tab-panel-1", { hidden: true })

        // Click licenses tab
        await fireEvent.click(licenseTabButton)

        // It should be selected now
        expect(detailTabPanel).toHaveAttribute('hidden')
        expect(licenseTabPanel).not.toHaveAttribute('hidden')

        // Now go back
        await fireEvent.click(detailTabButton)
        // It should be selected now
        expect(detailTabPanel).not.toHaveAttribute('hidden')
        expect(licenseTabPanel).toHaveAttribute('hidden')
    })

    it('shows "Create new license" button when org and package details are loaded but licenses are still loading', async () => {
        mockUseFetchApi.mockImplementation((fetchFn: any) => {
            const name = fetchFn.toString();

            if (name.includes('getOrganizationById')) {
                return {
                    data: {
                        id: '123',
                        name: 'Loaded Org',
                        organizationType: 'Reseller',
                        parentOrganization: null,
                    },
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            if (name.includes('getLicensesByOrgId')) {
                return {
                    data: null,
                    loading: true,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            if (name.includes('getPackageDetails')) {
                return {
                    data: [
                        {
                            packageDetailsId: 1,
                            packageDetailTitle: 'Package X',
                            serialNumbersCount: 5,
                        },
                    ],
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            return { data: null, loading: false, error: null, refetch: jest.fn() };
        });

        render(<HomePage />);

        const licenseTabButton = screen.getByRole('tab', { name: /Licenses/i });

        await fireEvent.click(licenseTabButton);

        expect(await screen.findByRole('button', { name: /Create new license/i })).toBeInTheDocument();
    });

    it('does not show "Create new license" button when org detail is still loading', async () => {
        mockUseFetchApi.mockImplementation((fetchFn: any) => {
            const name = fetchFn.toString();

            if (name.includes('getOrganizationById')) {
                return {
                    data: null,
                    loading: true,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            if (name.includes('getLicensesByOrgId')) {
                return {
                    data: { totalCount: 1, items: [] },
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            if (name.includes('getPackageDetails')) {
                return {
                    data: [
                        {
                            packageDetailsId: 2,
                            packageDetailTitle: 'Package Z',
                            serialNumbersCount: 3,
                        },
                    ],
                    loading: false,
                    error: null,
                    refetch: jest.fn(),
                };
            }

            return { data: null, loading: false, error: null, refetch: jest.fn() };
        });

        render(<HomePage />);

        const licenseTabButton = screen.getByRole('tab', { name: /Licenses/i });

        await fireEvent.click(licenseTabButton);

        const createLicenseButton = await screen.queryByText(/Create new license/i);
        expect(createLicenseButton).not.toBeInTheDocument();
    });
});
