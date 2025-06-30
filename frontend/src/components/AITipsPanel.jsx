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

const AITipsPanel = ({ tips = [] }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const cardBg = useColorModeValue('white', 'gray.700');
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
      p={4} 
      borderRadius="lg" 
      bg={cardBg}
      boxShadow="md"
      position="relative"
      borderLeft="4px solid"
      borderColor={accentColor}
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
        <Flex align="center" mb={2}>
          <Avatar 
            size="sm" 
            name="AI Tip Icon"
            bg={accentColor}
            color="white"
            mr={3}
            _hover={{ transform: 'scale(1.05)' }}
            transition="transform 0.2s"
          />
          <Text fontWeight="600" color={headingColor}>
            {energyTips[currentTipIndex].title}
          </Text>
        </Flex>
        
        <Text fontSize="sm" lineHeight="tall">
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
