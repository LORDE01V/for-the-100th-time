import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DashboardCard = ({
  title,
  icon,
  metric,
  metricLabel,
  footer,
  children,
  bg,
  bgGradient,
  ...props
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = "#333"; // or any color you want

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      p={6}
      bg={bg || cardBg}
      bgGradient={bgGradient}
      borderRadius="xl"
      boxShadow="lg"
      borderWidth="1px"
      borderColor={borderColor}
      height="100%"
      minH="250px"
      display="flex"
      flexDirection="column"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        transition: 'all 0.2s ease-in-out',
      }}
      {...props}
    >
      <Flex direction="column" h="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <Heading
            as="h3"
            size="md"
            color={headingColor}
            fontWeight="semibold"
            isTruncated
          >
            {title}
          </Heading>
          {icon && (
            <Icon 
              as={icon} 
              w={6} 
              h={6} 
              color={props.iconColor || "blue.500"}
            />
          )}
        </Flex>

        {/* Metric Display (if provided) */}
        {metric && (
          <Flex direction="column" mb={4}>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="blue.500"
              lineHeight="1"
            >
              {metric}
            </Text>
            {metricLabel && (
              <Text fontSize="sm" color={textColor} mt={1}>
                {metricLabel}
              </Text>
            )}
          </Flex>
        )}

        {/* Main Content */}
        <Box flex="1" mt={2}>
          {children}
        </Box>

        {/* Footer (if provided) */}
        {footer && (
          <Box mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
            {footer}
          </Box>
        )}
      </Flex>
    </MotionBox>
  );
};

export default DashboardCard; 