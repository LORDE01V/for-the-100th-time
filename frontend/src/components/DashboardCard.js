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
import { useDashboard } from '../context/DashboardContext';

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

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
  const { currentThemeConfig } = useDashboard();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      p={6}
      bg={bg || cardBg}
      bgGradient={bgGradient || currentThemeConfig.gradients.card}
      borderRadius="xl"
      boxShadow="xl"
      borderWidth="1px"
      borderColor={borderColor || currentThemeConfig.colors.accent}
      height="100%"
      minH="250px"
      display="flex"
      flexDirection="column"
      _hover={{
        transform: 'translateY(-2px)',
        transition: 'all 0.2s',
      }}
      {...props}
    >
      <Flex direction="column" h="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <Heading
            as="h3"
            size="md"
            color={currentThemeConfig.colors.primary}
            fontWeight="semibold"
            isTruncated
          >
            <Icon 
              as={icon} 
              w={6} 
              h={6} 
              color={props.iconColor || "blue.500"}
              mr={2}
            />
            {title}
          </Heading>
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
        <Box flex="1" mt={2} color={currentThemeConfig.colors.text}>
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