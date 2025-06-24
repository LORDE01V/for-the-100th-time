import React from 'react';
import {
  SimpleGrid,
  Box,
  Text,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { FaPalette } from 'react-icons/fa';
import { themePresets } from '../../utils/mockData';
import { useDashboard } from '../../context/DashboardContext';
import DashboardCard from '../DashboardCard';

const ThemeSwitcher = () => {
  const { currentTheme, updateTheme } = useDashboard();
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <DashboardCard
      title="Theme Presets"
      icon={FaPalette}
    >
      <SimpleGrid columns={3} spacing={4}>
        {Object.entries(themePresets).map(([key, theme]) => (
          <Tooltip
            key={key}
            label={`Switch to ${theme.name}`}
            placement="top"
          >
            <Box
              p={2}
              borderRadius="lg"
              bgGradient={theme.gradients.card}
              borderWidth="2px"
              borderColor={currentTheme === key ? theme.colors.primary : 'transparent'}
              cursor="pointer"
              onClick={() => updateTheme(key)}
            >
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={`${key}.700`}
                textAlign="center"
              >
                {theme.name}
              </Text>
              <SimpleGrid columns={3} spacing={1} mt={2}>
                {Object.values(theme.colors).map((color, index) => (
                  <Box
                    key={index}
                    w="100%"
                    h="20px"
                    bg={color}
                    borderRadius="sm"
                  />
                ))}
              </SimpleGrid>
            </Box>
          </Tooltip>
        ))}
      </SimpleGrid>
      <Text mt={4} fontSize="sm" color={textColor} textAlign="center">
        Click a theme to preview and apply
      </Text>
    </DashboardCard>
  );
};

export default ThemeSwitcher; 