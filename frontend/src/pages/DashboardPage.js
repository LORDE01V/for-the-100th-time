import React from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { DashboardProvider } from '../context/DashboardContext';
import EnergyModeToggle from '../components/widgets/EnergyModeToggle';
import WeeklyHeatmap from '../components/widgets/WeeklyHeatmap';
import BudgetDial from '../components/widgets/BudgetDial';
import DailyForecast from '../components/widgets/DailyForecast';
import ThemeSwitcher from '../components/widgets/ThemeSwitcher';
import EnergyAvatar from '../components/widgets/EnergyAvatar';
import SolarOutput from '../components/widgets/SolarOutput';
import WidgetLayout from '../components/widgets/WidgetLayout';
import ActivityReport from '../components/widgets/ActivityReport';

function DashboardContent() {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <Box
      minH="100vh"
      backgroundImage="linear-gradient(to bottom right, #FF8C42, #4A00E0)"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
    >
      <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, lg: 8 }} position="relative" zIndex={2}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={() => navigate('/home')}
          >
            Back to Home
          </Button>
        </Flex>

        {/* Dashboard Title */}
        <Heading as="h1" size="xl" color="white" mb={8}>
          Energy Dashboard
        </Heading>

        {/* Dashboard Grid */}
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={{ base: 4, md: 6, lg: 8 }}
          minChildWidth="300px"
        >
          <EnergyModeToggle />
          <WeeklyHeatmap />
          <BudgetDial />
          <DailyForecast />
          <ThemeSwitcher />
          <EnergyAvatar />
          <SolarOutput />
          <WidgetLayout />
          <ActivityReport />
        </SimpleGrid>
      </Box>
    </Box>
  );
}

function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
