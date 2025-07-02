/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaComments } from 'react-icons/fa';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Textarea,
  VStack,
  Spinner, // Ensure Spinner is imported only once
  useColorModeValue,
  useToast,
  Collapse,
  UnorderedList,
  ListItem,
  SimpleGrid,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import api from '../services/api';

const ForumPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const metaTextColor = useColorModeValue('gray.500', 'gray.400');
  
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(17, 25, 40, 0.75)');
  const glassBorderColor = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)');
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState({});
  const [tone, setTone] = useState(null);
  const [isCheckingTone, setIsCheckingTone] = useState(false);

  // Mock data for dummyTopics
  const dummyTopics = useMemo(() => [
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2024-03-15',
      replies: 5,
      posts: [
        'Post 1: Regular cleaning of panels is essential for efficiency.',
        'Post 2: Check for dust buildup every month.',
        'Post 3: Use mild soap for washing to avoid damage.',
        'Post 4: Inspect wiring for any signs of wear.',
        'Post 5: Angle adjustments based on seasons help.',
        'Post 6: Monitor for shading issues from nearby trees.',
        'Post 7: Professional inspections recommended annually.',
        'Post 8: Avoid high-pressure water on panels.',
        'Post 9: Keep an eye on inverter connections.',
        'Post 10: Use protective covers during storms.',
        'Post 11: Track performance with monitoring apps.',
        'Post 12: Replace damaged panels promptly.',
        'Post 13: Ensure proper grounding for safety.',
        'Post 14: Clean edges and frames carefully.',
        'Post 15: Test output regularly with a multimeter.'
      ]
    },
    {
      id: 2,
      title: 'Best Battery Storage Solutions',
      author: 'Jane Smith',
      lastActivity: '2024-03-14',
      replies: 3,
      posts: [
        'Post 1: Lithium-ion batteries are reliable for home use.',
        'Post 2: Consider lead-acid for cost-effective options.',
        'Post 3: Flow batteries offer long-duration storage.',
        'Post 4: Saltwater batteries are eco-friendly alternatives.',
        'Post 5: Hybrid systems combine solar and battery tech.',
        'Post 6: Capacity should match your daily energy needs.',
        'Post 7: Check for depth of discharge ratings.',
        'Post 8: Maintenance involves regular charging cycles.',
        'Post 9: Integrate with smart home systems for efficiency.',
        'Post 10: Cost per kWh is a key factor in selection.',
        'Post 11: Look for warranties over 10 years.',
        'Post 12: Tesla Powerwall is popular for residential setups.',
        'Post 13: Ensure proper ventilation for safety.',
        'Post 14: Monitor battery health via apps.',
        'Post 15: Scalability allows adding more units later.',
        'Post 16: Compare efficiency ratings before buying.',
        'Post 17: Grid-tied vs. off-grid compatibility matters.',
        'Post 18: Recycling programs for old batteries are important.',
        'Post 19: User reviews help in decision-making.',
        'Post 20: Future-proof with expandable systems.'
      ]
    },
    {
      id: 3,
      title: 'Energy Saving Strategies',
      author: 'Mike Johnson',
      lastActivity: '2024-03-13',
      replies: 7,
      posts: [
        'Post 1: Turn off lights when not in use.',
        'Post 2: Use LED bulbs for lower energy consumption.',
        'Post 3: Unplug devices to avoid phantom power.',
        'Post 4: Upgrade to energy-efficient appliances.',
        'Post 5: Insulate your home to reduce heating needs.',
        'Post 6: Install programmable thermostats.',
        'Post 7: Optimize water heater settings.',
        'Post 8: Use natural light during the day.',
        'Post 9: Seal drafts around windows and doors.',
        'Post 10: Monitor energy usage with smart meters.',
        'Post 11: Adjust AC temperatures slightly.',
        'Post 12: Choose energy-star rated products.',
        'Post 13: Implement rainwater harvesting for savings.',
        'Post 14: Carpool or use public transport.',
        'Post 15: Plant trees for natural shading.',
        'Post 16: Maintain HVAC systems regularly.',
        'Post 17: Switch to renewable energy sources.',
        'Post 18: Educate family on conservation habits.'
      ]
    }
  ], []);

  const mockSummarize = (posts) => {
    // Simple mock function to generate a bullet-point summary from posts
    return posts.map((post, index) => `- Point ${index + 1}: ${post}`).join('\n');
  };

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

    const userName = localStorage.getItem('forumUserName') || 'You';
    const topicId = selectedTopic.id;

    const newReplies = { ...replies };
    if (!newReplies[topicId]) newReplies[topicId] = [];
    newReplies[topicId].push({
      name: userName,
      message: newMessage,
      timestamp: Date.now(),
    });

    setReplies(newReplies);

    toast({
      title: 'Message Posted',
      description: 'Your message has been posted successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setNewMessage('');
  };

  const handleSummarize = () => {
    if (!selectedTopic || !selectedTopic.posts || selectedTopic.posts.length === 0) {
      toast({
        title: 'No Posts',
        description: 'There are no posts to summarize.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const mockedSummary = mockSummarize(selectedTopic.posts);
      setSummary(mockedSummary);
    } catch (error) {
      toast({
        title: 'Error',
        description: '⚠️ Failed to summarize thread. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckTone = async () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Please enter some text to check the tone.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsCheckingTone(true);
    setTone(null);
    try {
      const response = await api.post('/api/ai/sentiment', { text: newMessage });
      setTone(response.data.tone);
    } catch (error) {
      toast({
        title: 'Failed to check tone. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCheckingTone(false);
    }
  };

  const renderTone = () => {
    if (!tone) return null;
    let color = 'gray.400', label = 'Neutral', emoji = '😐';
    if (tone === 'positive') { color = 'green.400'; label = 'Positive'; emoji = '😊'; }
    if (tone === 'negative') { color = 'red.400'; label = 'Negative'; emoji = '😞'; }
    return (
      <Tooltip label={label}>
        <Text ml={2} color={color} fontWeight="bold" as="span" fontSize="lg">
          {emoji}
        </Text>
      </Tooltip>
    );
  };

  const renderTopicsList = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w='full'>
      {dummyTopics.map((topic) => (
        <Box
          key={topic.id}
          p={6}
          bg={glassBg}
          backdropFilter='blur(10px)'
          borderWidth='1px'
          borderRadius='lg'
          boxShadow='lg'
          borderColor={glassBorderColor}
          transition='all 0.3s ease-in-out'
          _hover={{ boxShadow: 'xl', transform: 'translateY(-5px)' }}
        >
          <Flex align='center' mb={2}>
            <Icon as={FaComments} mr={2} />
            <Heading size='md' color={textColor}>
              {topic.title}
            </Heading>
          </Flex>
          <Text color={subTextColor}>By {topic.author}</Text>
          <Text color={subTextColor}>{topic.replies} replies</Text>
          <Text color={metaTextColor}>Last activity: {topic.lastActivity}</Text>
          <Button onClick={() => setSelectedTopic(topic)} mt={4} colorScheme='blue'>
            View Discussion
          </Button>
        </Box>
      ))}
    </SimpleGrid>
  );

  const renderTopicDiscussion = () => (
    <Box>
      <Box p={6} bg="white" borderRadius="lg" shadow="md" mb={6}>
        <Heading size="lg" mb={4} color={textColor}>
          {selectedTopic.title}
        </Heading>
        <Text color={subTextColor}>
          Started by {selectedTopic.author}
        </Text>
        <VStack mt={4} align="stretch" spacing={3}>
          <Heading size="md" mt={4}>Posts:</Heading>
          {selectedTopic.posts && selectedTopic.posts.length > 0 ? (
            selectedTopic.posts.map((post, index) => (
              <Box key={index} p={3} bg="gray.100" borderRadius="md" shadow="sm">
                <Text color={textColor}>{post}</Text>
              </Box>
            ))
          ) : (
            <Text color={subTextColor}>No posts yet.</Text>
          )}
        </VStack>
        <Button
          onClick={handleSummarize}
          isLoading={isLoading}
          isDisabled={isLoading}
          colorScheme="blue"
          mb={4}
          mt={4}
        >
          Summarize Thread
        </Button>
        {summary && (
          <Collapse in={summary !== null} animateOpacity>
            <Box p={4} bg="gray.100" borderRadius="md" mt={4}>
              <Heading size="sm" mb={2} color={textColor}>Thread Summary</Heading>
              <UnorderedList>
                {summary.split('\n').map((item, index) => (
                  <ListItem key={index} color={subTextColor}>{item}</ListItem>
                ))}
              </UnorderedList>
            </Box>
          </Collapse>
        )}
      </Box>

      {/* Message Input */}
      <Box p={6} bg="white" borderRadius="lg" shadow="md">
        <Textarea
          value={newMessage}
          onChange={e => {
            setNewMessage(e.target.value);
            setTone(null); // Reset tone if user edits
          }}
          placeholder="Type your message..."
          mb={2}
        />
        <Flex align="center" mb={2}>
          <Button
            size="sm"
            onClick={handleCheckTone}
            isDisabled={isCheckingTone || !newMessage.trim()}
            mr={2}
          >
            {isCheckingTone ? <Spinner size="xs" /> : 'Check Tone'}
          </Button>
          {renderTone()}
        </Flex>
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
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
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
      <Box
        maxW="container.xl"
        py={8}
        position="relative"
        zIndex={2}
      >
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
            : renderTopicsList()
          }
        </VStack>
    </Box>
    </Flex>
  );
};

export default ForumPage;