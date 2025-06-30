import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import axios from 'axios';
import { Flex } from '@chakra-ui/react';
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

// Import Chakra UI Components
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  Spinner,
  useColorModeValue,
  Text,
  Textarea,
  useToast
} from '@chakra-ui/react';

const ForumPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Move all useColorModeValue hooks to the top level
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const metaTextColor = useColorModeValue('gray.500', 'gray.400');

  // Add missing state declarations, excluding unused ones
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2024-03-15',
      replies: 5
    },
    {
      id: 2,
      title: 'Best Battery Storage Solutions',
      author: 'Jane Smith',
      lastActivity: '2024-03-14',
      replies: 3
    },
    {
      id: 3,
      title: 'Energy Saving Strategies',
      author: 'Mike Johnson',
      lastActivity: '2024-03-13',
      replies: 7
    }
  ]);  // Now topics is a state array for dynamic updates
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);  // Existing state

  // Mock data for dummyTopics
  const dummyTopics = useMemo(() => [
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2024-03-15',
      replies: 5
    },
    {
      id: 2,
      title: 'Best Battery Storage Solutions',
      author: 'Jane Smith',
      lastActivity: '2024-03-14',
      replies: 3
    },
    {
      id: 3,
      title: 'Energy Saving Strategies',
      author: 'Mike Johnson',
      lastActivity: '2024-03-13',
      replies: 7
    }
  ], []);  // Empty dependency array since it's static

  // Pre-define the topic card styles
  const topicCardStyles = {
    p: 6,
    bg: cardBg,
    borderRadius: "lg",
    shadow: "md",
    cursor: "pointer",
    _hover: { transform: 'translateY(-2px)', shadow: 'lg' },
    transition: "all 0.2s"
  };

  // Pre-define text styles
  const authorTextStyle = { color: subTextColor };
  const metaTextStyle = { fontSize: "sm", color: metaTextColor };

  const handlePostMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message before posting',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Simulate posting (you may want to add actual API call here)
      toast({
        title: 'Message Posted',
        description: 'Your message has been posted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewMessage('');
    }
  };

  const fetchTopics = useCallback(async () => {
    try {
      setIsLoadingTopics(true);
      const response = await axios.get('http://localhost:5000/api/forum/topics', {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });
      
      if (response.data.success) {
        const newTopics = response.data.topics.filter(newTopic => 
          !dummyTopics.some(dummyTopic => dummyTopic.id === newTopic.id)
        );
        setTopics(prevTopics => [...dummyTopics, ...newTopics]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [setIsLoadingTopics, setTopics, dummyTopics]);

  useEffect(() => {
    if (auth.getCurrentUser()) {
      fetchTopics();
    }
  }, [fetchTopics]);  // Added fetchTopics to dependency array

  // Fetch specific topic details
  const fetchTopicDetails = async (topicId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/forum/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });
      
      if (response.data.success) {
        setSelectedTopic(response.data.topic);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch topic details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderTopicsList = () => (
    <VStack spacing={4} align="stretch">
      {topics.map((topic) => (
        <Box
          key={topic.id}
          {...topicCardStyles}
          onClick={() => fetchTopicDetails(topic.id)}
        >
          <Heading size="md" mb={2} color={textColor}>
            {topic.title}
          </Heading>
          <Flex justify="space-between">
            <Text {...authorTextStyle}>By {topic.author}</Text>
            <Text {...authorTextStyle}>{topic.replies} replies</Text>
          </Flex>
          <Text {...metaTextStyle}>
            Last activity: {topic.lastActivity}
          </Text>
        </Box>
      ))}
    </VStack>
  );

  const renderTopicDiscussion = () => (
    <Box>
      <Box p={6} bg={cardBg} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="lg" mb={4} color={textColor}>
          {selectedTopic.title}
        </Heading>
        <Text color={subTextColor}>
          Started by {selectedTopic.author}
        </Text>
      </Box>

      {/* Message Input */}
      <Box p={6} bg={cardBg} borderRadius="lg" shadow="md">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your message..."
          mb={4}
        />
        <Button
          rightIcon={<FaPaperPlane />}
          colorScheme="blue"
          onClick={handlePostMessage}
        >
          Post Message
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={8}
          onClick={() => {
            if (selectedTopic) {
              setSelectedTopic(null);
            } else {
              navigate('/home');
            }
          }}
        >
          {selectedTopic ? 'Back to Topics' : 'Back to Home'}
        </Button>

        <VStack spacing={8} align="stretch">
          <Heading size="xl">Community Forum</Heading>
          {selectedTopic 
            ? renderTopicDiscussion() 
            : isLoadingTopics 
              ? <Spinner size="xl" />  // Show spinner while loading topics
              : renderTopicsList()
          }
        </VStack>
      </Container>
    </Box>
  );
};

export default ForumPage;
