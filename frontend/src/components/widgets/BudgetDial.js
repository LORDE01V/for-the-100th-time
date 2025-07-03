import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  Circle,
  VStack,
} from '@chakra-ui/react';
import { FaChartPie } from 'react-icons/fa';
import { budgetData } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const BudgetDial = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const progressColor = useColorModeValue('blue.500', 'blue.300');
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  const percentage = (budgetData.current / budgetData.max) * 100;

  return (
    <DashboardCard
      title="Monthly Budget"
      icon={FaChartPie}
      metric={budgetData.current}
      metricLabel={`of ${budgetData.max} ${budgetData.unit}`}
    >
      <VStack spacing={4} align="center">
        <Box position="relative" w="120px" h="120px">
          {/* Background circle */}
          <Circle
            size="120px"
            position="absolute"
            border="8px solid"
            borderColor={bgColor}
          />
          
          {/* Progress circle */}
          <Circle
            size="120px"
            position="absolute"
            border="8px solid"
            borderColor={progressColor}
            borderStyle="solid"
            borderWidth="8px"
            borderTop="8px solid transparent"
            borderLeft="8px solid transparent"
            transform="rotate(-45deg)"
            transition="all 0.3s ease"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`,
              transform: `rotate(${percentage * 3.6}deg)`,
            }}
          />

          {/* Center text */}
          <Circle
            size="100px"
            position="absolute"
            top="10px"
            left="10px"
            bg="white"
            shadow="md"
          >
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color={progressColor}>
                {percentage.toFixed(0)}%
              </Text>
              <Text fontSize="xs" color={textColor}>
                Used
              </Text>
            </VStack>
          </Circle>
        </Box>

        <Text fontSize="sm" color={textColor} textAlign="center">
          {budgetData.current} {budgetData.unit} used this month
        </Text>
      </VStack>
    </DashboardCard>
  );
};

export default BudgetDial; 