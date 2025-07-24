import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  IconButton,
  Flex,
  useColorModeValue,
  Badge,
  Avatar,
  VStack,
  HStack,
  Divider
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiDollarSign, FiSun, FiBattery } from 'react-icons/fi';
import PropTypes from 'prop-types';
import ActivityReport from './widgets/ActivityReport';

const AITipsPanel = ({ tips = [] }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const headingColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const energyTips = [
    {
      title: "Peak Hour Optimization",
      content: "Shift high-energy activities to off-peak hours (10PM-6AM) to reduce costs by up to 30%",
      category: "Savings",
      icon: FiDollarSign,
      badgeColor: "green"
    },
    {
      title: "Solar Utilization",
      content: "Increase solar self-consumption by scheduling pool pumps and appliances during daylight hours",
      category: "Efficiency",
      icon: FiSun,
      badgeColor: "orange"
    },
    {
      title: "Battery Management",
      content: "Maintain battery charge between 20-80% for optimal lifespan and performance",
      category: "Maintenance",
      icon: FiBattery,
      badgeColor: "blue"
    }
  ];

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % energyTips.length);
  };

  const handlePrevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + energyTips.length) % energyTips.length);
  };

  return (
    <Box
      bg={useColorModeValue('linear-gradient(to bottom right, #EBF8FF, #BEE3F8)', 'linear-gradient(to bottom right, #1A202C, #2D3748)')}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.700', 'gray.600')}
      height="100%"
      minHeight="250px"
      display="flex"
      flexDirection="column"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color={headingColor}>
          AI Energy Tips
        </Heading>
        <Badge colorScheme="blue" variant="subtle">
          {currentTipIndex + 1}/{energyTips.length}
        </Badge>
      </Flex>

      <VStack spacing={4} align="stretch">
        <Flex alignItems="center" mb={2}>
          <Avatar 
            size="sm" 
            name="AI Tip Icon"
            bg={accentColor}
            color="white"
            mr={3}
            _hover={{ transform: 'scale(1.05)' }}
            transition="transform 0.2s"
          />
          <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
            {energyTips[currentTipIndex].title}
          </Text>
        </Flex>
        
        <Text fontSize="md" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')} lineHeight="tall">
          {energyTips[currentTipIndex].content}
        </Text>

        <Divider />

        <Flex justify="space-between" align="center" pt={2}>
          <Badge 
            colorScheme={energyTips[currentTipIndex].badgeColor} 
            variant="subtle"
            fontSize="xs"
          >
            {energyTips[currentTipIndex].category}
          </Badge>
          
          <HStack>
            <IconButton
              icon={<FiChevronLeft />}
              size="sm"
              variant="ghost"
              onClick={handlePrevTip}
              aria-label="Previous tip"
              _hover={{ color: accentColor }}
            />
            <IconButton
              icon={<FiChevronRight />}
              size="sm"
              variant="ghost"
              onClick={handleNextTip}
              aria-label="Next tip"
            />
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
};

AITipsPanel.propTypes = {
  tips: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      badgeColor: PropTypes.string.isRequired
    })
  )
};

export default AITipsPanel;
