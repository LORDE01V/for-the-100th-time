import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    brand: {
      primary: '#3182CE',
      secondary: '#2C5282',
      accent: '#2C5282',
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'md'
          }
        }
      }
    }
  }
});

export default theme; 