import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  useColorModeValue,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { FaInfoCircle, FaBell } from 'react-icons/fa';
import DashboardCard from '../DashboardCard'; // Corrected import path

const LoadsheddingStatus = ({ selectedArea }) => {
  const [loadsheddingData, setLoadsheddingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const textColor = useColorModeValue('gray.700', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Function to fetch loadshedding status
  useEffect(() => {
    const fetchLoadsheddingStatus = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      let areaIdToFetch = null;

      try {
        if (selectedArea && selectedArea.name && (!selectedArea.id || (typeof selectedArea.id === 'string' && selectedArea.id.trim() === ''))) {
          // If selectedArea has a name but no valid ID, search for the area
          console.log(`Searching for area: ${selectedArea.name}`);
          const searchResponse = await fetch(`http://localhost:5000/api/areas_search?query=${encodeURIComponent(selectedArea.name)}`);
          if (!searchResponse.ok) {
            throw new Error(`Failed to search for area: ${searchResponse.status} - ${await searchResponse.text()}`);
          }
          const searchData = await searchResponse.json();
          if (searchData && searchData.length > 0) {
            areaIdToFetch = searchData[0].id; // Use the ID of the first result
            console.log(`Found area ID ${areaIdToFetch} for ${selectedArea.name}`);
          } else {
            setError("No area found for that name.");
            setLoadsheddingData(null); // Clear previous data
            setLoading(false);
            return; // Stop execution if no area is found
          }
        } else if (selectedArea && selectedArea.id && (typeof selectedArea.id === 'string' && selectedArea.id.trim() !== '' || typeof selectedArea.id === 'number' && selectedArea.id > 0)) {
          areaIdToFetch = typeof selectedArea.id === 'string' ? parseInt(selectedArea.id.trim(), 10) : selectedArea.id;
        }

        let url;
        let logMessage;
        if (areaIdToFetch) {
          url = `http://localhost:5000/api/loadshedding?area_id=${areaIdToFetch}`;
          logMessage = `Attempting to fetch loadshedding status for area ID: ${areaIdToFetch} from backend...`;
        } else {
          url = `http://localhost:5000/api/loadshedding/national-status`;
          logMessage = `Attempting to fetch national loadshedding status from backend...`;
        }

        console.log(logMessage);
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text(); // Get raw error text
          console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`Failed to fetch loadshedding status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Successfully fetched Loadshedding Status:", data); // Debugging log
        setLoadsheddingData(data);
      } catch (e) {
        console.error("Error in fetchLoadsheddingStatus (frontend):", e.message); // Log the specific error message
        setError(`Failed to load loadshedding status: ${e.message}. Please check backend or API.`);
      } finally {
        setLoading(false);
      }
    };

    fetchLoadsheddingStatus();

    // Optional: Fetch status periodically (e.g., every 5 minutes)
    const intervalId = setInterval(fetchLoadsheddingStatus, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [selectedArea]); // Add selectedArea to dependency array

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Stage 1': return 'green';
      case 'Stage 2': return 'yellow';
      case 'Stage 3': return 'orange';
      case 'Stage 4':
      case 'Stage 5':
      case 'Stage 6': return 'red';
      case 'Stage 7':
      case 'Stage 8': return 'purple';
      default: return 'gray';
    }
  };

  const handleSendTestPushNotification = async () => {
    try {
      console.log('Attempting to send test push notification via backend...');
      const response = await fetch('http://localhost:5000/api/notify/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Test push notification sent successfully!');
        console.log('Test push notification API response:', await response.json());
      } else {
        const errorData = await response.json();
        console.error('Failed to send test push notification (backend response):', errorData);
        alert(`Failed to send test push notification: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending test push notification (frontend fetch):', error);
      alert('Error sending test push notification. Check console for details.');
    }
  };

  const handleSendTestEmailNotification = async () => {
    try {
      console.log('Attempting to send test email notification via backend...');
      const response = await fetch('http://localhost:5000/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Test email notification sent successfully!');
        console.log('Test email notification API response:', await response.json());
      } else {
        const errorData = await response.json();
        console.error('Failed to send test email notification (backend response):', errorData);
        alert(`Failed to send test email notification: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending test email notification (frontend fetch):', error);
      alert('Error sending test email notification. Check console for details.');
    }
  };

  return (
    <DashboardCard title={selectedArea ? `Loadshedding Status for ${selectedArea.name}` : "National Loadshedding Status"} icon={FaInfoCircle}>
      <VStack spacing={4} align="stretch">
         {loading ? (
          <VStack py={4}>
            <Spinner size="md" />
            <Text>Loading national status...</Text>
          </VStack>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : loadsheddingData ? (
          <Box p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
            <VStack align="flex-start" spacing={2}>
              <Text fontSize="md" fontWeight="semibold">Current Stage:</Text>
              <Tag size="lg" colorScheme={getStageColor(loadsheddingData?.status?.stage)} borderRadius="full">
                <TagLabel>{loadsheddingData?.status?.stage || 'Unknown Stage'}</TagLabel>
              </Tag>
              <Text fontSize="sm" color={textColor}>
                Next Event: {loadsheddingData?.events?.[0] ?
                  `${loadsheddingData.events[0].stage} from ${new Date(loadsheddingData.events[0].start).toLocaleString()} to ${new Date(loadsheddingData.events[0].end).toLocaleString()}` :
                  'No upcoming events.'
                }
              </Text>
              <Text fontSize="sm" color={textColor}>
                Data Source: loadshedding-api.co.za
              </Text>
            </VStack>
            <HStack mt={4} spacing={2}>
              <Button
                colorScheme="teal"
                leftIcon={<FaBell />}
                onClick={handleSendTestPushNotification}
                size="sm"
              >
                Send Test Push
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<FaBell />}
                onClick={handleSendTestEmailNotification}
                size="sm"
              >
                Send Test Email
              </Button>
            </HStack>
          </Box>
        ) : (
          <VStack py={4} align="center" justify="center" height="100%">
            <Text fontSize="lg" color={textColor}>
              No loadshedding data available for this area.
            </Text>
            <Text fontSize="sm" color={textColor}>
              Please ensure the backend is running and connected to the API.
            </Text>
          </VStack>
        )}
      </VStack>
    </DashboardCard>
  );
};

export default LoadsheddingStatus;
