import {render, screen, fireEvent, within, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import { GenerateLicenseModal } from '@/components/GenerateLicenseModal'
import userEvent from "@testing-library/user-event";

describe('GenerateLicenseModal', () => {
    const baseProps = {
        open: true,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        organizationAccountName: 'Test Org',
        packageDetails: [
            {
                packageDetailsId: 2063,
                packageDetailTitle: 'TechAssist Professional',
                serialNumbersCount: 5,
            },
        ],
        generatingLicense: false,
        generatingResult: '',
        generatingError: null,
    }

    it('renders form fields correctly and disables Confirm until terms are accepted', async () => {
        render(<GenerateLicenseModal {...baseProps} />)

        // Form labels
        expect(screen.getByDisplayValue('Test Org')).toBeInTheDocument()
        expect(screen.getByLabelText('License Type')).toBeInTheDocument()
        expect(screen.getByText(/remaining 5/)).toBeInTheDocument()

        // Confirm should be disabled initially
        const confirmButton = screen.getByRole('button', { name: /Confirm/i })
        expect(confirmButton).toBeDisabled()

        const licenseTypeSelect = screen.getByRole('combobox', { name: /License Type/i });
        licenseTypeSelect.click()
        await waitFor(async () => {
            const packageOptionOne = within(licenseTypeSelect).getAllByRole('option')
            await userEvent.selectOptions(licenseTypeSelect, packageOptionOne[1].textContent);
        })

        // Check terms and confirm is enabled
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
        expect(confirmButton).toBeEnabled()
    })

    it('calls onSubmit when Confirm is clicked and terms accepted', async () => {
        render(<GenerateLicenseModal {...baseProps} />)

        const licenseTypeSelect = screen.getByRole('combobox', { name: /License Type/i });
        licenseTypeSelect.click()
        await waitFor(async () => {
            const packageOptionOne = within(licenseTypeSelect).getAllByRole('option')
            await userEvent.selectOptions(licenseTypeSelect, packageOptionOne[1].textContent);
        })
        fireEvent.click(screen.getByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: /Confirm/i }))

        expect(baseProps.onSubmit).toHaveBeenCalledWith(2063, 1)
    })

    it('displays loading state', () => {
        render(<GenerateLicenseModal {...baseProps} generatingLicense={true} />)

        expect(screen.getByText('Generating license...')).toBeInTheDocument()
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('displays success state', () => {
        render(
            <GenerateLicenseModal
                {...baseProps}
                generatingResult="123456"
            />
        )

        expect(screen.getByText('✅ License created successfully')).toBeInTheDocument()
        expect(screen.getByText((content, element) => {
            return element?.textContent === 'License number: 123456'
        })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument()
    })

    it('displays error state', () => {
        render(
            <GenerateLicenseModal
                {...baseProps}
                generatingError="WCF call failed"
            />
        )

        expect(screen.getByText('❌ Failed to create license')).toBeInTheDocument()
        expect(screen.getByText('WCF call failed')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument()
    })
})
