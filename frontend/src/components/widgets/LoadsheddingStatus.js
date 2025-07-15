import React, { useState, useEffect, useContext } from 'react';
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
import DashboardCard from '../DashboardCard';
import { DashboardContext } from '../../context/DashboardContext'; // Ensure this import is present
import OneSignal from 'react-onesignal'; // Import OneSignal

const LoadsheddingStatus = () => {
    // console.log('LoadsheddingStatus component is rendering'); // Keep for general debugging
    const { selectedEskomArea } = useContext(DashboardContext);
    const [loadsheddingData, setLoadsheddingData] = useState(null); // This will hold the data from EskomSePush
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const textColor = useColorModeValue('gray.700', 'gray.300');
    const cardBg = useColorModeValue('white', 'gray.700');

    // Effect to fetch loadshedding data when selectedEskomArea changes
    useEffect(() => {
        if (selectedEskomArea && selectedEskomArea.id) {
            setLoading(true);
            setError(null);
            setLoadsheddingData(null); // Clear previous data when area changes

            console.log('Fetching loadshedding data for area:', selectedEskomArea.id);
            console.log('Using REACT_APP_ESKOMSEPUSH_API_KEY:', process.env.REACT_APP_ESKOMSEPUSH_API_KEY ? 'Loaded' : 'Not Loaded');

            // This is the fetch directly to EskomSePush as per your request
            fetch(`https://developer.sepush.co.za/business/2.0/area?id=${selectedEskomArea.id}`, {
                headers: {
                    'Token': process.env.REACT_APP_ESKOMSEPUSH_API_KEY
                }
            })
            .then(response => {
                if (!response.ok) {
                    // Attempt to read error message from response body if available
                    return response.json().then(err => { throw new Error(err.error || 'Network response was not ok'); });
                }
                return response.json();
            })
            .then(data => {
                console.log('EskomSePush Data:', data);
                setLoadsheddingData(data);
            })
            .catch(err => {
                console.error('Error fetching EskomSePush data:', err);
                setError(`Failed to fetch loadshedding data: ${err.message}. Check API key or network.`);
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            // No area selected, clear data and stop loading
            setLoadsheddingData(null);
            setLoading(false);
            setError(null);
        }
    }, [selectedEskomArea]); // Dependency array: re-run effect when selectedEskomArea changes

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

    const handleSendTestNotification = async () => {
        // Check if push notifications are enabled
        const isPushEnabled = await OneSignal.isPushNotificationsEnabled();

        if (!isPushEnabled) {
            console.log('Push notifications not enabled. Showing slidedown prompt.');
            OneSignal.showSlidedownPrompt();
            alert('Please enable push notifications in the prompt to receive test notifications.');
            return;
        }

        const message = `Loadshedding for ${selectedEskomArea?.name || 'your area'}: Stage ${loadsheddingData?.status?.stage || 'Unknown'}. Next event: ${loadsheddingData?.events?.[0] ? `${loadsheddingData.events[0].start} - ${loadsheddingData.events[0].end}` : 'N/A'}`;
        const heading = "Loadshedding Update";

        try {
            console.log('Attempting to send test notification via backend...');
            const response = await fetch('http://localhost:5000/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, heading }),
            });

            if (response.ok) {
                alert('Test notification sent successfully!');
                console.log('Test notification API response:', await response.json());
            } else {
                const errorData = await response.json();
                console.error('Failed to send test notification (backend response):', errorData);
                alert(`Failed to send test notification: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error sending test notification (frontend fetch):', error);
            alert('Error sending test notification. Check console for details.');
        }
    };

    // Render logic
    if (!selectedEskomArea) {
        return (
            <DashboardCard title="Loadshedding Status" icon={FaInfoCircle}>
                <Text color={textColor}>Please select a location using the selector above to see loadshedding status.</Text>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard title={`Loadshedding for ${selectedEskomArea.name}`} icon={FaInfoCircle}>
            <VStack spacing={4} align="stretch">
                {loading && (
                    <VStack py={4}>
                        <Spinner size="md" />
                        <Text>Loading loadshedding data...</Text>
                    </VStack>
                )}

                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && !error && loadsheddingData ? (
                    <Box p={2} borderWidth="1px" borderRadius="md" bg={cardBg}>
                        <VStack align="flex-start" spacing={2}>
                            <Text fontSize="md" fontWeight="semibold">Current Stage:</Text>
                            <Tag size="lg" colorScheme={getStageColor(loadsheddingData.status?.stage)} borderRadius="full">
                                <TagLabel>{loadsheddingData.status?.stage || 'Unknown Stage'}</TagLabel>
                            </Tag>
                            <Text fontSize="sm" color={textColor}>
                                Next Event: {loadsheddingData.events?.[0] ?
                                    `${loadsheddingData.events[0].start} - ${loadsheddingData.events[0].end} (Stage ${loadsheddingData.events[0].stage})` :
                                    'No upcoming events.'
                                }
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                                Data Source: EskomSePush
                            </Text>
                            {/* Display today's loadshedding schedule if available */}
                            {loadsheddingData.schedule && loadsheddingData.schedule.days && loadsheddingData.schedule.days.length > 0 && (
                                (() => {
                                    const todayIdx = new Date().getDay(); // 0 for Sunday, 1 for Monday
                                    const todayObj = loadsheddingData.schedule.days.find(day => day.index === todayIdx);
                                    
                                    if (todayObj && todayObj.stages && todayObj.stages.length > 0) {
                                        return (
                                            <Box mt={4} pt={2} borderTopWidth="1px" borderColor="gray.200" width="100%">
                                                <Text fontSize="md" fontWeight="semibold">Today's Schedule ({todayObj.name}):</Text>
                                                <VStack align="flex-start" spacing={1} mt={2}>
                                                    {todayObj.stages.map((stage, sIdx) => (
                                                        <Box key={sIdx} width="100%">
                                                            <Text fontWeight="medium" fontSize="sm">Stage {stage.stage}:</Text>
                                                            {stage.periods && stage.periods.length > 0 ? (
                                                                <VStack align="flex-start" spacing={0} pl={4}>
                                                                    {stage.periods.map((period, pIdx) => (
                                                                        <Text key={pIdx} fontSize="sm">{period.start} - {period.end}</Text>
                                                                    ))}
                                                                </VStack>
                                                            ) : (
                                                                <Text fontSize="sm" pl={4}>No periods scheduled for this stage.</Text>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        );
                                    } else {
                                        return (
                                            <Text fontSize="sm" mt={4}>No detailed schedule available for today.</Text>
                                        );
                                    }
                                })()
                            )}
                        </VStack>
                        <Button
                            mt={4}
                            colorScheme="teal"
                            leftIcon={<FaBell />}
                            onClick={handleSendTestNotification}
                            size="sm"
                        >
                            Send Test Notification
                        </Button>
                    </Box>
                ) : (
                    !loading && !error && (
                        <Alert status="info">
                            <AlertIcon />
                            <AlertTitle>No loadshedding data available.</AlertTitle>
                            <AlertDescription>Select an area or wait for data to load.</AlertDescription>
                        </Alert>
                    )
                )}
            </VStack>
        </DashboardCard>
    );
};

export default LoadsheddingStatus;
