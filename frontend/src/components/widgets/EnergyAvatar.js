import React from 'react';
import {
  Text,
  useColorModeValue,
  VStack,
  Badge,
  Avatar,
  Center,
} from '@chakra-ui/react';
import { FaUserCircle, FaUser } from 'react-icons/fa';
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
        <Center h="100%">
          <Avatar 
            size="2xl" 
            src="/assets/images/default-avatar.png"
            bg="brand.100"
            icon={<FaUser size={40} />}
          />
        </Center>
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

export function AvatarImage({ src, alt }) {
  return (
    <img 
      src={src || '/assets/images/default-avatar.png'}
      alt={alt}
      style={{ borderRadius: '50%', width: '40px', height: '40px' }}
    />
  );
} 