import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Flex,
  Grid,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  Textarea,
  Select,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'; // Import the API service

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EventCalendar = () => {
  const toast = useToast();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [eventData, setEventData] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
    eventType: 'meeting'
  });
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Move color mode values to top level
  const dateBg = useColorModeValue('gray.100', 'gray.700');
  const dateColor = useColorModeValue('gray.700', 'gray.200');
  const monthColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const dayColor = useColorModeValue('gray.600', 'gray.300');
  const calendarBg = useColorModeValue('white', 'gray.800');

  // Create color mode values for event types at top level
  const eventTypeColors = {
    meeting: useColorModeValue('blue.500', 'blue.300'),
    maintenance: useColorModeValue('orange.500', 'orange.300'),
    appointment: useColorModeValue('green.500', 'green.300'),
    reminder: useColorModeValue('purple.500', 'purple.300'),
    other: useColorModeValue('gray.500', 'gray.300')
  };

  // Add state for hover tracking
  const [hoveredDay, setHoveredDay] = useState(null);

  // Add color mode values at the top with other style configs
  const hoverCardBg = useColorModeValue('white', 'gray.700');
  const hoverCardText = useColorModeValue('gray.800', 'whiteAlpha.900');

  // Add new state for search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Add new state for filters
  const [activeFilters, setActiveFilters] = useState([]);

  // Add filter toggle function
  const toggleFilter = (eventType) => {
    setActiveFilters(prev => 
      prev.includes(eventType)
        ? prev.filter(f => f !== eventType)
        : [...prev, eventType]
    );
  };

  // Add debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.toLowerCase());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  useEffect(() => {
    // Fetch events from the database when the component mounts
    const fetchEvents = async () => {
      try {
        const response = await api.get('/api/events'); // Replace with your actual endpoint
        setEvents(response.data); // Assuming the API returns events as an object
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error fetching events',
          description: 'Could not load events from the server.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom',
        });
      }
    };

    fetchEvents();
  }, []);

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day) => {
    const key = `${currentYear}-${currentMonth}-${day}`;
    setSelectedDate(key);
    setEventData(events[key] || {
      title: '',
      start: '',
      end: '',
      description: '',
      location: '',
      eventType: 'meeting'
    });
    onOpen();
  };

  const saveEvent = async () => {
    // Validate all required fields
    if (!eventData.title.trim() || 
        !eventData.start || 
        !eventData.end || 
        !eventData.description.trim() || 
        !eventData.location.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all event details',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }

    try {
      const updated = { 
        ...events, 
        [selectedDate]: eventData 
      };

      // Save the event to the database
      await api.post('/events', { date: selectedDate, ...eventData }); // Replace with your actual endpoint

      setEvents(updated);
      onClose();

      toast({
        title: 'Event saved',
        description: 'Your event has been successfully saved to the database.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error saving event',
        description: 'Could not save the event to the server.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  // Add ref for tracking deleted event
  const deletedEventRef = useRef(null);

  // Modify deleteEvent function
  const deleteEvent = () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') return;

    // Store deleted event before removal
    deletedEventRef.current = {
      key: selectedDate,
      event: events[selectedDate]
    };

    const updated = { ...events };
    delete updated[selectedDate];
    setEvents(updated);
    localStorage.setItem('calendarEvents', JSON.stringify(updated));
    
    setDeleteConfirmationText('');
    onDeleteClose();
    onClose();
    
    toast({
      title: 'Event deleted',
      description: 'Click Undo to restore it',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'bottom',
      onCloseComplete: () => {
        // Clear the ref when toast closes
        deletedEventRef.current = null;
      },
      render: ({ onClose }) => (
        <Box
          color="white"
          p={3}
          bg="blue.500"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text>Event deleted. Click Undo to restore it</Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => {
              if (deletedEventRef.current) {
                const { key, event } = deletedEventRef.current;
                setEvents(prev => ({
                  ...prev,
                  [key]: event
                }));
                localStorage.setItem('calendarEvents', 
                  JSON.stringify({
                    ...events,
                    [key]: event
                  })
                );
                deletedEventRef.current = null;
                onClose();
              }
            }}
          >
            Undo
          </Button>
        </Box>
      )
    });
  };

  const renderCalendar = (dateBg, dateColor) => {
    const totalCells = startDay + daysInMonth;
    const weeks = [];
    let dayCounter = 1;

    for (let i = 0; i < totalCells; i++) {
      const isEmpty = i < startDay;
      const key = `${currentYear}-${currentMonth}-${dayCounter}`;
      const event = events[key];
      const isEvent = event && 
        event.title.toLowerCase().includes(debouncedSearchQuery) &&
        (activeFilters.length === 0 || activeFilters.includes(event.eventType));
      
      if (!isEmpty) {
        const currentDay = dayCounter;
        weeks.push(
          <Box
            key={i}
            w="40px"
            h="40px"
            m="1"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="sm"
            transition="0.2s"
            bg={isEvent ? eventTypeColors[event.eventType] : dateBg}
            color={isEvent ? 'white' : dateColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={() => handleDateClick(currentDay)}
            onMouseEnter={() => isEvent && setHoveredDay(key)}
            onMouseLeave={() => setHoveredDay(null)}
            position="relative"
            _hover={{
              transform: 'scale(1.05)',
              boxShadow: 'md'
            }}
          >
            {currentDay}
            {isEvent && (
              <>
                <Box 
                  position="absolute" 
                  bottom="1" 
                  right="1" 
                  bg="red.400" 
                  w="2" 
                  h="2" 
                  borderRadius="full"
                />
                {hoveredDay === key && (
                  <Box
                    position="absolute"
                    bottom="100%"
                    left="50%"
                    transform="translateX(-50%)"
                    bg={hoverCardBg}
                    p={2}
                    boxShadow="xl"
                    borderRadius="md"
                    fontSize="xs"
                    zIndex="tooltip"
                    minWidth="120px"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Text fontWeight="bold" color={hoverCardText}>
                      {event.title}
                    </Text>
                    <Text color={hoverCardText}>
                      {new Date(event.start).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                    <Text color={hoverCardText} textTransform="capitalize">
                      {event.eventType}
                    </Text>
                  </Box>
                )}
              </>
            )}
          </Box>
        );
        dayCounter++;
      } else {
        weeks.push(
          <Box key={i} w="40px" h="40px" m="1" />
        );
      }
    }

    return weeks;
  };

  return (
    <Box 
      bg={calendarBg}
      p={8}
      rounded="lg" 
      shadow="lg" 
      maxW="700px"
      mx="auto"
      color={monthColor}
      position="relative"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          icon={<ChevronLeftIcon />}
          onClick={handlePrev}
          aria-label="Previous month"
          variant="ghost"
        />
        <Text fontSize="xl" fontWeight="bold" color={monthColor}>
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <IconButton
          icon={<ChevronRightIcon />}
          onClick={handleNext}
          aria-label="Next month"
          variant="ghost"
        />
      </Flex>

      {/* Add search input */}
      <Input
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb={4}
        variant="filled"
        _focus={{ borderColor: 'blue.300' }}
      />

      {/* Add filter section */}
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="semibold" mb={2} color={dayColor}>
          Filter by event type
        </Text>
        <Flex wrap="wrap" gap={2}>
          {Object.keys(eventTypeColors).map((eventType) => (
            <Button
              key={eventType}
              size="sm"
              variant={activeFilters.includes(eventType) ? 'solid' : 'outline'}
              colorScheme={eventTypeColors[eventType].split('.')[0]}
              onClick={() => toggleFilter(eventType)}
              textTransform="capitalize"
            >
              {eventType}
            </Button>
          ))}
        </Flex>
      </Box>

      <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
        {days.map((day) => (
          <Text 
            key={day} 
            fontSize="sm" 
            textAlign="center" 
            fontWeight="bold"
            color={dayColor}
          >
            {day}
          </Text>
        ))}
      </Grid>

      <AnimatePresence mode='wait'>
        <motion.div
          key={`${currentYear}-${currentMonth}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Grid templateColumns="repeat(7, 1fr)">
            {renderCalendar(dateBg, dateColor)}
          </Grid>
        </motion.div>
      </AnimatePresence>

      {/* Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Event</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input
                placeholder="Event Title *"
                value={eventData.title}
                onChange={(e) => setEventData({...eventData, title: e.target.value})}
                isRequired
              />
              <Input
                type="datetime-local"
                value={eventData.start}
                onChange={(e) => setEventData({...eventData, start: e.target.value})}
                isRequired
              />
              <Input
                type="datetime-local"
                placeholder="End Date/Time"
                value={eventData.end}
                onChange={(e) => setEventData({...eventData, end: e.target.value})}
                isRequired
              />
              <Textarea
                placeholder="Description"
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
                isRequired
              />
              <Input
                placeholder="Location"
                value={eventData.location}
                onChange={(e) => setEventData({...eventData, location: e.target.value})}
                isRequired
              />
              <Select 
                value={eventData.eventType}
                onChange={(e) => setEventData({...eventData, eventType: e.target.value})}
                isRequired
              >
                <option value="meeting">Meeting</option>
                <option value="maintenance">Maintenance</option>
                <option value="appointment">Appointment</option>
                <option value="reminder">Reminder</option>
                <option value="other">Other</option>
              </Select>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            {events[selectedDate] && (
              <Button 
                colorScheme="red" 
                mr={3} 
                onClick={onDeleteOpen}
              >
                Delete
              </Button>
            )}
            <Button colorScheme="blue" onClick={saveEvent}>
              {events[selectedDate] ? 'Update' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Type "DELETE" to confirm permanent removal of this event:
            </Text>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE here"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              setDeleteConfirmationText('');
              onDeleteClose();
            }}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={deleteEvent}
              isDisabled={deleteConfirmationText.toLowerCase() !== 'delete'}
            >
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventCalendar;