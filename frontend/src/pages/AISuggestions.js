import React, { useState } from 'react';
import { Box, Heading, Text, Button, useToast, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';  // Import for animations

const AISuggestions = () => {
  const allSuggestions = Array.from({ length: 1000 }, (_, index) => `Save energy by optimizing device usage, such as turning off unused appliances. Suggestion variation: Try ${index + 1}.`);  // Generate 1000 mock suggestions without numbering

  function getRandomSuggestions() {
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  const toast = useToast();
  const [displayedSuggestions, setDisplayedSuggestions] = useState(getRandomSuggestions());

  const handleRefresh = () => {
    setDisplayedSuggestions(getRandomSuggestions());
    toast({
      title: 'Suggestions refreshed.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={5} bg="white" borderRadius="md" boxShadow="md">  {/* Match home page style with background, shadow, and rounding */}
      <Heading as="h1" size="xl" mb={4}>AI Suggestions</Heading>
      <Text mb={4}>Here are smart tips from our AI engine to help you save energy and manage your finances better.</Text>
      <Button mt={4} onClick={handleRefresh}>Refresh Suggestions</Button>
      <SimpleGrid columns={1} spacing={4} mt={4}>
        {displayedSuggestions.map((suggestion, index) => (
          <motion.Box
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            bg="gray.50"
          >
            <Text>{suggestion}</Text>
          </motion.Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default AISuggestions;