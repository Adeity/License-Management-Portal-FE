
  "use client";
  import { createTheme } from '@mui/material/styles';
  // import * as BLUIThemes from '@brightlayer-ui/react-themes';

  const theme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true, dark: false },
  });

  // const theme = createTheme()

  export default theme;
  