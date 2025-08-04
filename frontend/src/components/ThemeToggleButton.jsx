import React from 'react';
import { IconButton, useColorMode } from '@chakra-ui/react';
import { FaRegSun, FaRegMoon } from 'react-icons/fa';

const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle Theme"
      icon={colorMode === 'light' ? <FaRegMoon /> : <FaRegSun />}
      onClick={toggleColorMode}
      position="fixed"
      bottom="90px" // Position above the chatbot button (24px offset + 56px button size + 10px gap = 90px)
      right="24px" // Corrected to match Supportbot's right position
      zIndex="9999"
      isRound // Makes the button perfectly round
      boxSize="56px" // Explicitly set box size to match chatbot
      fontSize="2xl" // Explicitly set font size to match chatbot
      boxShadow="lg"
      bg="gray.600" // A neutral background for the theme toggle
      color="white"
      border="4px solid white"
      _hover={{ bg: "gray.700" }}
    />
  );
};

export default ThemeToggleButton; 