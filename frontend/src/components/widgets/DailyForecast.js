import React from 'react';
import {
  Text,
  SimpleGrid,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';
import { dailyForecast } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const DailyForecast = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const currentHour = new Date().getHours();

  const getIcon = (icon) => {
    switch (icon) {
      case 'sun':
        return FaSun;
      case 'moon':
        return FaMoon;
      case 'sunrise':
      case 'sunset':
        return FaCloudSun;
      default:
        return FaSun;
    }
  };

  const isCurrentTimeSlot = (hour) => {
    const [startHour] = hour.split(':').map(Number);
    return currentHour >= startHour && currentHour < startHour + 6;
  };

  return (
    <DashboardCard
      title="Daily Energy Forecast"
      icon={FaSun}
    >
      <SimpleGrid columns={5} spacing={4}>
        {dailyForecast.map((slot) => {
          const Icon = getIcon(slot.icon);
          const isCurrent = isCurrentTimeSlot(slot.hour);

          return (
            <VStack
              key={slot.hour}
              p={3}
              bg={isCurrent ? 'blue.50' : 'transparent'}
              borderRadius="lg"
              borderWidth={isCurrent ? '2px' : '1px'}
              borderColor={isCurrent ? 'blue.500' : 'gray.200'}
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            >
              <Icon size="24px" color={isCurrent ? 'blue.500' : 'gray.500'} />
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                {slot.hour}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {slot.usage}%
              </Text>
            </VStack>
          );
        })}
      </SimpleGrid>
      <Text mt={4} fontSize="sm" color={textColor} textAlign="center">
        Best usage time: 12:00 - 16:00
      </Text>
    </DashboardCard>
  );
};

export default DailyForecast; 