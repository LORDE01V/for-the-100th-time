import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  useColorModeValue,
  Text,
  Textarea,
  useToast,
  Flex,
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

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data for forum topics
  const topics = [
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
  ];

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
      return;
    }

    // Here you would typically send the message to your backend
    toast({
      title: 'Message Posted',
      description: 'Your message has been posted successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setNewMessage('');
  };

  const renderTopicsList = () => (
    <VStack spacing={4} align="stretch">
      {topics.map((topic) => (
        <Box
          key={topic.id}
          {...topicCardStyles}
          onClick={() => setSelectedTopic(topic)}
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
          {selectedTopic ? renderTopicDiscussion() : renderTopicsList()}
        </VStack>
      </Container>
    </Box>
  );
};

export default ForumPage;
