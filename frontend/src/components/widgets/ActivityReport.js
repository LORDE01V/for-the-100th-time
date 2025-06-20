import React from 'react';
import {
  Text,
  Button,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FaFileDownload } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import { activityReportData } from '../../utils/mockData';
import DashboardCard from '../DashboardCard';

const ActivityReport = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yOffset = 20;

    // Add header
    doc.setFontSize(24);
    doc.text('GriddyX Activity Report', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;

    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;

    // Add sections
    const sections = [
      {
        title: 'Top-Ups',
        data: activityReportData.topUps,
        format: (item) => `R${item.amount} on ${item.date}`,
      },
      {
        title: 'Usage',
        data: activityReportData.usage,
        format: (item) => `${item.amount} kWh on ${item.date}`,
      },
      {
        title: 'Savings',
        data: activityReportData.savings,
        format: (item) => `R${item.amount} saved on ${item.date}`,
      },
      {
        title: 'Alerts',
        data: activityReportData.alerts,
        format: (item) => `${item.message} (${item.date})`,
      },
    ];

    sections.forEach((section) => {
      // Add section title
      doc.setFontSize(16);
      doc.text(section.title, margin, yOffset);
      yOffset += 10;

      // Add section content
      doc.setFontSize(12);
      section.data.forEach((item) => {
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(section.format(item), margin + 5, yOffset);
        yOffset += 7;
      });

      yOffset += 10;
    });

    // Add budget progress
    doc.setFontSize(16);
    doc.text('Budget Progress', margin, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Current Progress: ${activityReportData.budgetProgress}%`, margin + 5, yOffset);

    // Save the PDF
    doc.save('griddyx-activity-report.pdf');

    toast({
      title: 'Report Generated',
      description: 'Your activity report has been downloaded.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <DashboardCard
      title="Activity Report"
      icon={FaFileDownload}
    >
      <VStack spacing={4}>
        <Text fontSize="sm" color={textColor} textAlign="center">
          Download a detailed report of your energy usage and activities
        </Text>
        <Button
          leftIcon={<FaFileDownload />}
          colorScheme="blue"
          onClick={generatePDF}
          size="lg"
          w="full"
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