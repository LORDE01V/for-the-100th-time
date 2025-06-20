import React from 'react';
import {
  Box,
  Text,
  Tooltip,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaCalendarDay } from 'react-icons/fa';
import { weeklyHeatmapData } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const WeeklyHeatmap = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (value) => {
    if (value < 25) return 'green.100';
    if (value < 50) return 'yellow.100';
    if (value < 75) return 'orange.100';
    return 'red.100';
  };

  return (
    <DashboardCard
      title="Weekly Energy Usage"
      icon={FaCalendarDay}
    >
      <Box overflowX="auto">
        <SimpleGrid columns={25} spacing={1}>
          {/* Header row */}
          <Box />
          {hours.map((hour) => (
            <Text
              key={hour}
              fontSize="xs"
              textAlign="center"
              color={textColor}
            >
              {hour}
            </Text>
          ))}

          {/* Data rows */}
          {days.map((day, dayIndex) => (
            <React.Fragment key={day}>
              <Text fontSize="xs" color={textColor}>
                {day}
              </Text>
              {hours.map((hour) => (
                <Tooltip
                  key={`${day}-${hour}`}
                  label={`${day} ${hour}:00 - ${weeklyHeatmapData[dayIndex][hour]}% usage`}
                >
                  <Box
                    w="100%"
                    h="20px"
                    bg={getColor(weeklyHeatmapData[dayIndex][hour])}
                    borderRadius="sm"
                    transition="all 0.2s"
                    _hover={{ transform: 'scale(1.1)' }}
                  />
                </Tooltip>
              ))}
            </React.Fragment>
          ))}
        </SimpleGrid>
      </Box>

      {/* Legend */}
      <SimpleGrid columns={4} spacing={2} mt={4}>
        <Box>
          <Box w="100%" h="10px" bg="green.100" borderRadius="sm" />
          <Text fontSize="xs" color={textColor}>Low</Text>
        </Box>
        <Box>
          <Box w="100%" h="10px" bg="yellow.100" borderRadius="sm" />
          <Text fontSize="xs" color={textColor}>Medium</Text>
        </Box>
        <Box>
          <Box w="100%" h="10px" bg="orange.100" borderRadius="sm" />
          <Text fontSize="xs" color={textColor}>High</Text>
        </Box>
        <Box>
          <Box w="100%" h="10px" bg="red.100" borderRadius="sm" />
          <Text fontSize="xs" color={textColor}>Peak</Text>
        </Box>
      </SimpleGrid>
    </DashboardCard>
  );
};

export default WeeklyHeatmap; 