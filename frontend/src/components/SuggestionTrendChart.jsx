import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Text } from '@chakra-ui/react';

const SuggestionTrendChart = ({ data, days = 7 }) => {
  const groupedByWeek = {};

  // Filter data by days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filteredData = data.filter(s => {
    const suggestionDate = new Date(s.created_at || Date.now());
    return suggestionDate >= cutoffDate;
  });

  filteredData.forEach(s => {
    const week = new Date(s.created_at || Date.now()).toISOString().split('T')[0];
    groupedByWeek[week] = (groupedByWeek[week] || 0) + 1;
  });

  const chartData = Object.entries(groupedByWeek)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
      fullDate: date
    }));

  // Custom tooltip with exact date and count
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="#23272F" p={3} borderRadius="md" border="1px solid #38B2AC">
          <Text color="#F7FAFC" fontWeight="bold">{label}</Text>
          <Text color="#805AD5">{payload[0].value} suggestions</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData}>
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#F7FAFC', fontSize: 12 }}
          axisLine={{ stroke: '#38B2AC' }}
        />
        <YAxis 
          allowDecimals={false}
          tick={{ fill: '#F7FAFC', fontSize: 12 }}
          axisLine={{ stroke: '#38B2AC' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#805AD5" 
          fill="#D6BCFA"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SuggestionTrendChart; 