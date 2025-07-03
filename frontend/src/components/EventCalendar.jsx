import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Stack,
  Textarea,
  Select,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EventCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [eventData, setEventData] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
    eventType: 'meeting'
  });

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
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

  const saveEvent = () => {
    const updated = { 
      ...events, 
      [selectedDate]: eventData 
    };
    setEvents(updated);
    localStorage.setItem('calendarEvents', JSON.stringify(updated));
    onClose();
  };

  const renderCalendar = () => {
    const totalCells = startDay + daysInMonth;
    const weeks = [];
    let dayCounter = 1;

    for (let i = 0; i < totalCells; i++) {
      const isEmpty = i < startDay;
      const key = `${currentYear}-${currentMonth}-${dayCounter}`;
      const isEvent = events[key];
      
      if (!isEmpty) {
        const currentDay = dayCounter;
        weeks.push(
          <Tooltip 
            key={i} 
            label={isEvent ? `
              ${events[key].title}
              Type: ${events[key].eventType}
              Time: ${events[key].start}
              Location: ${events[key].location}
            ` : ''} 
            hasArrow
          >
            <Box
              w="40px"
              h="40px"
              m="1"
              borderRadius="full"
              bg={isEvent ? 'purple.400' : 'gray.100'}
              color={isEvent ? 'white' : 'gray.700'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => handleDateClick(currentDay)}
            >
              {dayCounter++}
            </Box>
          </Tooltip>
        );
      } else {
        weeks.push(
          <Box key={i} w="40px" h="40px" m="1" />
        );
      }
    }

    return weeks;
  };

  return (
    <Box bg="white" p={6} rounded="lg" shadow="lg" maxW="400px" mx="auto">
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          icon={<ChevronLeftIcon />}
          onClick={handlePrev}
          aria-label="Previous month"
          variant="ghost"
        />
        <Text fontSize="xl" fontWeight="bold">
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

      <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
        {days.map((day) => (
          <Text key={day} fontSize="sm" textAlign="center" fontWeight="bold">
            {day}
          </Text>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)">{renderCalendar()}</Grid>

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
              />
              <Textarea
                placeholder="Description"
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
              />
              <Input
                placeholder="Location"
                value={eventData.location}
                onChange={(e) => setEventData({...eventData, location: e.target.value})}
              />
              <Select 
                value={eventData.eventType}
                onChange={(e) => setEventData({...eventData, eventType: e.target.value})}
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
            <Button colorScheme="blue" onClick={saveEvent}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventCalendar;
