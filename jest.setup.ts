import '@testing-library/jest-dom'

import { configure } from '@testing-library/react';

// Set global waitFor timeout to 10 seconds (10000 ms)
configure({
    asyncUtilTimeout: 10000,
});