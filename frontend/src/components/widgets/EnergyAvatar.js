import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { FaUserCircle } from 'react-icons/fa';
import { avatarStates } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const EnergyAvatar = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const currentUsage = 65; // Mock usage percentage

  const getAvatarState = (usage) => {
    if (usage >= avatarStates.happy.threshold) return 'happy';
    if (usage >= avatarStates.neutral.threshold) return 'neutral';
    return 'concern';
  };

  const currentState = getAvatarState(currentUsage);
  const stateConfig = avatarStates[currentState];

  return (
    <DashboardCard
      title="Energy Status"
      icon={FaUserCircle}
    >
      <VStack spacing={4}>
        <Box
          fontSize="6xl"
          transition="all 0.3s"
          _hover={{ transform: 'scale(1.1)' }}
        >
          {stateConfig.emoji}
        </Box>
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={currentState === 'happy' ? 'green.500' : currentState === 'neutral' ? 'yellow.500' : 'red.500'}
        >
          {stateConfig.label}
        </Text>
        <Badge
          colorScheme={currentState === 'happy' ? 'green' : currentState === 'neutral' ? 'yellow' : 'red'}
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {currentUsage}% Usage
        </Badge>
        <Text fontSize="sm" color={textColor} textAlign="center">
          {currentState === 'happy'
            ? 'Great job keeping your energy usage low!'
            : currentState === 'neutral'
            ? 'Consider reducing usage to save more'
            : 'High usage detected - check your appliances'}
        </Text>
      </VStack>
    </DashboardCard>
  );
};

export default EnergyAvatar; 