import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Heading, Text } from '@chakra-ui/react';

const SavingsChart = ({ data, onBarClick }) => {
  // Sort data by highest savings and calculate total
  const sortedData = [...data]
    .sort((a, b) => (b.estimated_savings || 0) - (a.estimated_savings || 0))
    .map(s => ({
      name: s.title.length > 12 ? s.title.slice(0, 12) + '...' : s.title,
      savings: s.estimated_savings || 0,
      originalData: s // Keep reference to original data for modal
    }));

  const totalSavings = sortedData.reduce((sum, item) => sum + item.savings, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="#23272F" p={3} borderRadius="md" border="1px solid #38B2AC">
          <Text color="#F7FAFC" fontWeight="bold">{label}</Text>
          <Text color="#48BB78">R{payload[0].value.toFixed(2)}</Text>
          {onBarClick && (
            <Text color="#38B2AC" fontSize="sm" mt={1}>Click for details</Text>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Total Savings Display */}
      <Heading size="sm" mb={4} color="#F7FAFC" textAlign="center">
        💰 Total Potential Savings: R{totalSavings.toFixed(2)}
      </Heading>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={sortedData}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#F7FAFC', fontSize: 12 }}
            axisLine={{ stroke: '#38B2AC' }}
          />
          <YAxis 
            tick={{ fill: '#F7FAFC', fontSize: 12 }}
            axisLine={{ stroke: '#38B2AC' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="savings" 
            fill="url(#gradient)"
            radius={[4, 4, 0, 0]}
            onClick={(data) => {
              if (onBarClick && data.originalData) {
                onBarClick(data.originalData);
              }
            }}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48BB78" />
              <stop offset="100%" stopColor="#38A169" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SavingsChart; 