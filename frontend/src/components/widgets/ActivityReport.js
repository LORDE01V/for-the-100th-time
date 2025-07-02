import React, { useState } from 'react';
import {
  Text,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  Select,
  Input,
  HStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaFileDownload } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import { activityReportData } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const ActivityReport = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  // Add state for filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activityType, setActivityType] = useState('All');

  const generatePDF = () => {
    // Filter data based on state
    let filteredData = activityReportData;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (activityType !== 'All') {
      filteredData = {
        ...filteredData,
        topUps: activityType === 'Top-Ups' ? filteredData.topUps : [],
        usage: activityType === 'Usage' ? filteredData.usage : [],
        savings: activityType === 'Savings' ? filteredData.savings : [],
        alerts: activityType === 'Alerts' ? filteredData.alerts : [],
      };
    }

    if (startDate && endDate) {
      const filterByDate = (items) =>
        items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= start && itemDate <= end;
        });
      filteredData = {
        ...filteredData,
        topUps: filterByDate(filteredData.topUps),
        usage: filterByDate(filteredData.usage),
        savings: filterByDate(filteredData.savings),
        alerts: filterByDate(filteredData.alerts),
      };
    }

    // After filtering, calculate summaries for extensive breakdown
    const totalTopUps = filteredData.topUps.reduce((sum, item) => sum + item.amount, 0);
    const totalUsage = filteredData.usage.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = filteredData.savings.reduce((sum, item) => sum + item.amount, 0);
    const numAlerts = filteredData.alerts.length;

    // Check if filtered data is empty
    const hasData = filteredData.topUps.length > 0 || filteredData.usage.length > 0 || filteredData.savings.length > 0 || filteredData.alerts.length > 0;
    if (!hasData) {
      toast({
        title: 'No Data',
        description: '⚠️ No matching activity data found for selected filters.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yOffset = 20;

    // Add placeholder logo and enhanced header
    doc.setFontSize(18);
    doc.text('GriddyX Energy Report', margin, yOffset);  // Placeholder logo text
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Report for: ${startDate} to ${endDate || 'All Dates'}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;

    // Add summary section for extensive breakdown
    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('Summary Breakdown:', margin, yOffset);
    doc.setFont('normal');
    yOffset += 15;
    doc.setFontSize(12);
    doc.text(`Total Top-Ups: R${totalTopUps.toFixed(2)}`, margin + 5, yOffset);
    yOffset += 10;
    doc.text(`Total Usage: ${totalUsage.toFixed(2)} kWh`, margin + 5, yOffset);
    yOffset += 10;
    doc.text(`Total Savings: R${totalSavings.toFixed(2)}`, margin + 5, yOffset);
    yOffset += 10;
    doc.text(`Number of Alerts: ${numAlerts}`, margin + 5, yOffset);
    yOffset += 15;

    const sections = [
      {
        title: 'Top-Ups',
        data: filteredData.topUps,
        format: (item) => `R${item.amount} on ${item.date}`,
      },
      {
        title: 'Usage',
        data: filteredData.usage,
        format: (item) => `${item.amount} kWh on ${item.date}`,
      },
      {
        title: 'Savings',
        data: filteredData.savings,
        format: (item) => `R${item.amount} saved on ${item.date}`,
      },
      {
        title: 'Alerts',
        data: filteredData.alerts,
        format: (item) => `${item.message} (${item.date})`,
      },
    ];

    sections.forEach((section) => {
      if (section.data.length > 0) {
        doc.setFontSize(16);
        doc.setFont('bold');  // Style headers in bold
        doc.text(section.title, margin, yOffset);
        doc.setFont('normal');  // Reset to normal
        yOffset += 15;  // Better spacing

        doc.setFontSize(12);
        section.data.forEach((item) => {
          if (yOffset > 270) {
            doc.addPage();
            yOffset = 20;
          }
          doc.text(section.format(item), margin + 5, yOffset);
          yOffset += 10;  // Improved padding
        });
        yOffset += 10;
      }
    });

    // Add budget progress if available
    if (filteredData.budgetProgress) {
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Budget Progress', margin, yOffset);
      doc.setFont('normal');
      yOffset += 10;
      doc.setFontSize(12);
      doc.text(`Current Progress: ${filteredData.budgetProgress}%`, margin + 5, yOffset);
    }

    doc.save('griddyx-activity-report.pdf');
    toast({
      title: 'Report Generated',
      description: 'Your activity report has been downloaded.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const hasData = activityReportData && (activityReportData.topUps.length > 0 || activityReportData.usage.length > 0 || activityReportData.savings.length > 0 || activityReportData.alerts.length > 0);

  return (
    <DashboardCard
      title="Activity Report"
      icon={FaFileDownload}
    >
      { !activityReportData || !hasData ? (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          No activity data available.
        </Alert>
      ) : null }
      <VStack spacing={4}>
        <HStack spacing={4} w="full">
          <Input
            type="date"
            placeholder="Start Date"
            onChange={(e) => setStartDate(e.target.value)}
            size="sm"
          />
          <Input
            type="date"
            placeholder="End Date"
            onChange={(e) => setEndDate(e.target.value)}
            size="sm"
          />
          <Select
            placeholder="Filter by Activity"
            onChange={(e) => setActivityType(e.target.value)}
            size="sm"
          >
            <option value="All">All</option>
            <option value="Top-Ups">Top-Ups</option>
            <option value="Usage">Usage</option>
            <option value="Savings">Savings</option>
            <option value="Alerts">Alerts</option>
          </Select>
        </HStack>
        <Button
          leftIcon={<FaFileDownload />}
          colorScheme="blue"
          onClick={generatePDF}
          size="lg"
          w="full"
          isDisabled={!hasData}
        >
          Download Report
        </Button>
        <Text fontSize="xs" color={textColor} textAlign="center">
          Includes: Top-ups, Usage, Savings, and Alerts
        </Text>
      </VStack>
    </DashboardCard>
  );
};

export default ActivityReport; 