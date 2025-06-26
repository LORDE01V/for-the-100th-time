import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';

function AnomalyDetection({ usageData }) {
  const [anomaly, setAnomaly] = useState(null);

  // Analyze usage data to detect anomalies
  useEffect(() => {
    if (usageData && usageData.length > 0) {
      const averageUsage = usageData.reduce((sum, usage) => sum + usage, 0) / usageData.length;
      const latestUsage = usageData[usageData.length - 1];

      // Detect anomaly: usage is 40% higher than average
      if (latestUsage > averageUsage * 1.4) {
        setAnomaly({
          type: 'high',
          message: `Your usage is ${Math.round(((latestUsage - averageUsage) / averageUsage) * 100)}% higher than usual – something may be wrong.`,
        });
      } else if (latestUsage < averageUsage * 0.6) {
        setAnomaly({
          type: 'low',
          message: `Your usage is ${Math.round(((averageUsage - latestUsage) / averageUsage) * 100)}% lower than usual – check if something is off.`,
        });
      } else {
        setAnomaly(null); // No anomaly detected
      }
    }
  }, [usageData]);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.400');

  return (
    <Box p={6} borderWidth="1px" borderRadius="md" bg={bgColor}>
      <Heading size="md" mb={4} color={textColor}>
        Anomaly Detection
      </Heading>
      {anomaly ? (
        <Alert status={anomaly.type === 'high' ? 'warning' : 'info'} borderRadius="md">
          <AlertIcon />
          {anomaly.message}
        </Alert>
      ) : (
        <Text color={textColor}>Your electricity usage is normal.</Text>
      )}
    </Box>
  );
}

export default AnomalyDetection;