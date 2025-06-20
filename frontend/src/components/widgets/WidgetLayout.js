import React from 'react';
import {
  Box,
  Text,
  Switch,
  VStack,
  useColorModeValue,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { FaCog } from 'react-icons/fa';
import { useDashboard } from '../../context/DashboardContext';
import DashboardCard from '../DashboardCard';

const WidgetLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { widgetLayout, toggleWidget } = useDashboard();
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const widgetLabels = {
    energyMode: 'Energy Mode Toggle',
    weeklyHeatmap: 'Weekly Heatmap',
    budgetDial: 'Budget Dial',
    dailyForecast: 'Daily Forecast',
    themeSwitcher: 'Theme Switcher',
    energyAvatar: 'Energy Avatar',
    solarOutput: 'Solar Output',
  };

  return (
    <>
      <DashboardCard
        title="Widget Layout"
        icon={FaCog}
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" color={textColor}>
            Customize your dashboard layout
          </Text>
          <Button
            leftIcon={<FaCog />}
            colorScheme="blue"
            variant="outline"
            onClick={onOpen}
          >
            Configure Widgets
          </Button>
        </VStack>
      </DashboardCard>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Widget Configuration</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {Object.entries(widgetLayout).map(([key, isVisible]) => (
                <Box
                  key={key}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontSize="sm" color={textColor}>
                    {widgetLabels[key]}
                  </Text>
                  <Switch
                    isChecked={isVisible}
                    onChange={() => toggleWidget(key)}
                    colorScheme="blue"
                  />
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default WidgetLayout; 