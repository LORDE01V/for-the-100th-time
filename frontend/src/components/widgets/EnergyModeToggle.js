import React from 'react';
import {
  Switch,
  FormControl,
  FormLabel,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaLeaf, FaBolt } from 'react-icons/fa';
import { useDashboard } from '../../context/DashboardContext';
import DashboardCard from '../DashboardCard';

export default function EnergyModeToggle() {
  const { energyMode, toggleEnergyMode, currentModeConfig } = useDashboard();
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <DashboardCard
      title="Energy Mode"
      icon={energyMode === 'saver' ? FaLeaf : FaBolt}
      bgGradient={
        energyMode === 'saver'
          ? 'linear(to-br, teal.50, teal.100)'
          : 'linear(to-br, orange.50, orange.100)'
      }
    >
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="energy-mode" mb="0">
          <HStack spacing={4}>
            <Text
              color={textColor}
              fontWeight={energyMode === 'saver' ? 'bold' : 'normal'}
            >
              Saver Mode
            </Text>
            <Switch
              id="energy-mode"
              isChecked={energyMode === 'boost'}
              onChange={toggleEnergyMode}
              colorScheme={currentModeConfig.color}
              size="lg"
            />
            <Text
              color={textColor}
              fontWeight={energyMode === 'boost' ? 'bold' : 'normal'}
            >
              Boost Mode
            </Text>
          </HStack>
        </FormLabel>
      </FormControl>
      <Text mt={2} fontSize="sm" color={textColor}>
        {currentModeConfig.description}
      </Text>
    </DashboardCard>
  );
} 