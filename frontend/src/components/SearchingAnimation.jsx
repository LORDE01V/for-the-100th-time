import React, { useEffect } from 'react';
import { Box, Flex, Icon, Text, Progress } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';

const rotateKeyframes = `
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const bounceKeyframes = `
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
  }
`;

const pulseKeyframes = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const SearchingAnimation = ({ location }) => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = rotateKeyframes + bounceKeyframes + pulseKeyframes;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <Box p={4} bg="gray.700" borderRadius="lg" w="100%" my={2}>
      <Flex align="center" justify="center" mb={3}>
        <Icon as={FaSearch} animation="rotate 2s linear infinite" mr={3} />
        <Text fontWeight="bold" fontSize="sm">Searching for real-time loadshedding information...</Text>
      </Flex>
      {location && <Text textAlign="center" fontSize="sm" color="gray.400" mb={3}>Location: {location}</Text>}
      <Flex align="center" justify="center" mb={3}>
        <Text fontSize="xs" mr={2}>Please wait</Text>
        <Box as="span" animation="bounce 1.4s infinite ease-in-out both" animationDelay="-0.32s" w="8px" h="8px" bg="teal.300" borderRadius="full" />
        <Box as="span" animation="bounce 1.4s infinite ease-in-out both" animationDelay="-0.16s" w="8px" h="8px" bg="teal.300" borderRadius="full" mx={1} />
        <Box as="span" animation="bounce 1.4s infinite ease-in-out both" w="8px" h="8px" bg="teal.300" borderRadius="full" />
      </Flex>
      <Progress size="xs" isIndeterminate colorScheme="teal" bg="gray.600" borderRadius="full" css={{ '& > div': { animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` } }}/>
    </Box>
  );
};

export default SearchingAnimation;
