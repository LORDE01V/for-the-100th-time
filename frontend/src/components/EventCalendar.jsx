
import React, { useState, useEffect, useRef, useCallback}  from 'react';
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
import axios from 'axios'; // ADD THIS LINE TO IMPORT AXIOS

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


  // New function to fetch events from the backend
  const fetchEventsFromBackend =useCallback( async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      const response = await axios.get('https://backend-0igj.onrender.com/api/events', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      const fetchedEvents = Object.keys(response.data).reduce((acc, dateKey) => {
        // The backend's structure includes date, title, start, end, description, location, eventType
        const event = response.data[dateKey];
        // Ensure the dateKey used by frontend matches the 'date' field from backend
        // For simplicity, using the dateKey from the backend response as the key in frontend state
        acc[dateKey] = {
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          location: event.location,
          eventType: event.eventType
        };
        return acc;
      }, {});
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch events from server:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch events from server',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
    }
  }, [setEvents, toast]);

  useEffect(() => {
    fetchEventsFromBackend();
  }, [fetchEventsFromBackend]); // Run only once on component mount

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

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
    // Format the date to match backend's expected 'YYYY-MM-DD' if not already
    // Backend's /api/events GET endpoint uses event[0] as date, which is likely 'YYYY-MM-DD'
    const formattedDate = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    // Use events from state (which are now fetched from backend)
    setEventData(events[formattedDate] || {
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
    if (
      !eventData.title.trim() ||
      !eventData.start ||
      !eventData.end ||
      !eventData.description.trim() ||
      !eventData.location.trim()
    ) {
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

    // Combine date with start/end times to create full timestamps
    const startDateTime = `${selectedDate} ${eventData.start}:00`; // Assuming eventData.start is HH:MM
    const endDateTime = `${selectedDate} ${eventData.end}:00`;     // Assuming eventData.end is HH:MM

    const eventPayload = {
      date: selectedDate, // This is YYYY-MM-DD
      title: eventData.title,
      start: startDateTime, // Send full timestamp
      end: endDateTime,     // Send full timestamp
      description: eventData.description,
      location: eventData.location,
      eventType: eventData.eventType,
    };

    console.log('Event Payload:', eventPayload);

    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      await axios.post('https://backend-0igj.onrender.com/api/events', eventPayload, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      toast({
        title: 'Event created',
        description: 'Your event has been successfully saved!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      fetchEventsFromBackend(); // Refresh events from backend after successful save
    } catch (error) {
      console.error('Failed to save event to server:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event to server.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
    }

    onClose();
  };

  // Add ref for tracking deleted event
  const deletedEventRef = useRef(null);

  // Modify deleteEvent function to interact with backend
  const deleteEvent = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') {
      toast({
        title: 'Confirmation Error',
        description: 'Please type "delete" to confirm.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }

    try {
      // Assuming selectedDate is the primary key (date) for deletion
      await axios.delete(`https://backend-0igj.onrender.comm/api/events/${selectedDate}`);
      toast({
        title: 'Event deleted',
        description: 'Event has been successfully deleted from the database.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
        onCloseComplete: () => {
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
            <Text>Event deleted. Click Undo to restore it</Text> {/* This undo won't work with backend deletion unless you add a PUT/PATCH for undo */}
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={() => {
                // If you want an undo feature, you'd need to implement a backend endpoint for it.
                // For now, this button won't restore the event to the database.
                toast({
                  title: 'Undo not supported',
                  description: 'To restore, re-create the event manually.',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                  position: 'bottom',
                });
                onClose();
              }}
            >
              Undo
            </Button>
          </Box>
        ),
      });
      fetchEventsFromBackend(); // Refresh events from backend after deletion
    } catch (error) {
      console.error('Failed to delete event from server:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event from server.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
    }

    setDeleteConfirmationText('');
    onDeleteClose();
    onClose();
  };

  // Remove localStorage.setItem for saving/deleting
  // Remove localStorage.getItem for initial load

  const renderCalendar = (dateBg, dateColor) => {
    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    const numDays = getDaysInMonth(currentMonth, currentYear);
    const calendarDays = [];

    // Fill preceding empty days
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<Box key={`empty-${i}`} />);
    }

    // Fill days with numbers and events
    for (let day = 1; day <= numDays; day++) {
      const dateKey = new Date(currentYear, currentMonth, day).toISOString().split('T')[0]; // Format to YYYY-MM-DD
      const dayEvents = events[dateKey] ? [events[dateKey]] : []; // Get event for the day
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      //const hasEvents = dayEvents.length > 0;

      // Filter events by search query and active filters
      const filteredEvents = dayEvents.filter(event => {
        const matchesSearch = debouncedSearchQuery
          ? (event.title?.toLowerCase().includes(debouncedSearchQuery) ||
             event.description?.toLowerCase().includes(debouncedSearchQuery) ||
             event.location?.toLowerCase().includes(debouncedSearchQuery))
          : true;
        const matchesFilter = activeFilters.length > 0
          ? activeFilters.includes(event.eventType)
          : true;
        return matchesSearch && matchesFilter;
      });
      const showEventDot = filteredEvents.length > 0;

      calendarDays.push(
        <AnimatePresence key={day}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="100%"
              w="100%"
              p={1}
              borderWidth="1px"
              borderRadius="md"
              bg={isToday ? 'blue.100' : dateBg}
              color={isToday ? 'blue.800' : dateColor}
              fontWeight={isToday ? 'bold' : 'normal'}
              position="relative"
              cursor="pointer"
              _hover={{ bg: isToday ? 'blue.200' : 'gray.200' }}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <Text fontSize="md">{day}</Text>
              {showEventDot && (
                <Box
                  position="absolute"
                  bottom="2px"
                  right="2px"
                  h="6px"
                  w="6px"
                  borderRadius="full"
                  bg="red.500"
                  title={filteredEvents.map(e => e.title).join(', ')} // Show event titles on hover
                />
              )}
              {hoveredDay === day && filteredEvents.length > 0 && (
                <Box
                  position="absolute"
                  bottom="20px"
                  left="50%"
                  transform="translateX(-50%)"
                  bg={hoverCardBg}
                  color={hoverCardText}
                  p={2}
                  borderRadius="md"
                  boxShadow="md"
                  zIndex={10}
                  minW="150px"
                >
                  {filteredEvents.map((event, index) => (
                    <Box key={index} mb={1}>
                      <Text fontWeight="bold">{event.title}</Text>
                      <Text fontSize="sm">{event.start} - {event.end}</Text>
                      <Text fontSize="sm">{event.location}</Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Flex>
          </motion.div>
        </AnimatePresence>
      );
    }

    return calendarDays;
  };

  return (
    <Box p={4} borderRadius="lg" bg={calendarBg} boxShadow="xl" width="100%" maxWidth="800px" mx="auto">
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label="Previous Month"
          onClick={handlePrev}
          variant="ghost"
        />
        <Text fontSize="2xl" fontWeight="bold" color={monthColor}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <IconButton
          icon={<ChevronRightIcon />}
          aria-label="Next Month"
          onClick={handleNext}
          variant="ghost"
        />
      </Flex>

      <Flex mb={4}>
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mr={2}
        />
        <Select
          placeholder="Filter by type"
          onChange={(e) => toggleFilter(e.target.value)}
          value={activeFilters.length === 1 ? activeFilters[0] : ''} // Only show if one filter is active
          w="auto"
        >
          {Object.keys(eventTypeColors).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </Select>
      </Flex>

      <Flex justify="space-around" mb={2}>
        {days.map(day => (
          <Box key={day} w="calc(100%/7)" textAlign="center" fontWeight="bold" color={dayColor}>
            {day}
          </Box>
        ))}
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} height="400px">
        {renderCalendar(dateBg, dateColor)}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedDate ? `Events for ${selectedDate}` : 'Add New Event'}</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input
                placeholder="Event Title"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
              <Input
                placeholder="Start Time (e.g., 09:00)"
                value={eventData.start}
                onChange={(e) => setEventData({ ...eventData, start: e.target.value })}
              />
              <Input
                placeholder="End Time (e.g., 10:00)"
                value={eventData.end}
                onChange={(e) => setEventData({ ...eventData, end: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              />
              <Select
                value={eventData.eventType}
                onChange={(e) => setEventData({ ...eventData, eventType: e.target.value })}
              >
                {Object.keys(eventTypeColors).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </Stack>
            {events[selectedDate] && (
              <Box mt={4} p={3} borderWidth="1px" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Existing Event:</Text>
                <Text>Title: {events[selectedDate].title}</Text>
                <Text>Time: {events[selectedDate].start} - {events[selectedDate].end}</Text>
                <Text>Description: {events[selectedDate].description}</Text>
                <Text>Location: {events[selectedDate].location}</Text>
                <Text>Type: {events[selectedDate].eventType}</Text>
                <Button colorScheme="red" size="sm" mt={3} onClick={onDeleteOpen}>Delete Event</Button>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" ml={3} onClick={saveEvent}>Save Event</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <Text mb={3}>Are you sure you want to delete this event?</Text>
            <Text fontWeight="bold" mb={2}>Type "delete" to confirm:</Text>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="delete"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" ml={3} onClick={deleteEvent} isDisabled={deleteConfirmationText.toLowerCase() !== 'delete'}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventCalendar;
