import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { FaSun } from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { solarOutputData } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const SolarOutput = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const chartData = solarOutputData.history.map((value, index) => ({
    hour: index,
    output: value,
  }));

  return (
    <DashboardCard
      title="Solar Output"
      icon={FaSun}
      metric={solarOutputData.current}
      metricLabel="Current Efficiency"
    >
      <Box h="200px" mt={4}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFA500" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickFormatter={(value) => `${value}:00`}
              tick={{ fontSize: 12, fill: textColor }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: textColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => [`${value}%`, 'Output']}
              labelFormatter={(label) => `Hour ${label}:00`}
            />
            <Area
              type="monotone"
              dataKey="output"
              stroke="#FFA500"
              fillOpacity={1}
              fill="url(#colorOutput)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={4} textAlign="center">
        <Badge
          colorScheme={solarOutputData.current >= 70 ? 'green' : 'yellow'}
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {solarOutputData.current >= 70 ? 'Optimal' : 'Sub-optimal'} Performance
        </Badge>
        <Text mt={2} fontSize="sm" color={textColor}>
          Peak output: {solarOutputData.peak}%
        </Text>
      </Box>
    </DashboardCard>
  );
};

export default SolarOutput; 