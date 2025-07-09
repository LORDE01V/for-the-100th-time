/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState } from 'react';
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
  useColorModeValue,
  useToast,
  Collapse,
  UnorderedList,
  ListItem,
  SimpleGrid,
  Icon,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import api from '../services/api';
import forumBackground from '../assets/images/Forum_page.png';

const ForumPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const metaTextColor = useColorModeValue('gray.500', 'gray.400');
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState({});
  const [tone, setTone] = useState(null);
  const [isCheckingTone, setIsCheckingTone] = useState(false);

  // Mock data for forum topics
  const topics = [
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2025-03-15',
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
      lastActivity: '2025-03-14',
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
      lastActivity: '2025-03-13',
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
    },
    // Adding 10 more topics with new authors and posts
    {
      id: 4,
      title: 'Inverter Installation Guide',
      author: 'Emily Clark',
      lastActivity: '2025-03-12',
      replies: 4,
      posts: [
        'Post 1: Start with selecting the right inverter size.',
        'Post 2: Ensure proper wiring from panels.',
        'Post 3: Mount in a cool, dry location.',
        'Post 4: Connect to the battery system carefully.',
        'Post 5: Test voltage compatibility first.',
        'Post 6: Use surge protectors for safety.',
        'Post 7: Follow local electrical codes.',
        'Post 8: Secure all connections tightly.',
        'Post 9: Monitor for overheating issues.',
        'Post 10: Integrate with monitoring software.',
        'Post 11: Hire a professional if unsure.',
        'Post 12: Check for ground fault protection.',
        'Post 13: Label all circuits clearly.',
        'Post 14: Perform a load test after installation.',
        'Post 15: Keep documentation for future reference.',
        'Post 16: Update firmware if applicable.',
        'Post 17: Ensure ventilation around the unit.'
      ]
    },
    {
      id: 5,
      title: 'Renewable Energy Grants',
      author: 'Alex Rivera',
      lastActivity: '2025-03-11',
      replies: 6,
      posts: [
        'Post 1: Government grants cover solar installations.',
        'Post 2: Check eligibility based on income.',
        'Post 3: Apply online for federal programs.',
        'Post 4: State-specific grants vary by region.',
        'Post 5: Include energy audits in applications.',
        'Post 6: Deadlines are usually annual.',
        'Post 7: Match grants don\'t require repayment.',
        'Post 8: Verify with local energy offices.',
        'Post 9: Combine with tax incentives.',
        'Post 10: Small business grants available too.',
        'Post 11: Track application status online.',
        'Post 12: Required documents include estimates.',
        'Post 13: Grants for wind and hydro exist.',
        'Post 14: Community programs offer additional support.',
        'Post 15: Success stories can guide applications.'
      ]
    },
    {
      id: 6,
      title: 'Solar vs. Wind Energy',
      author: 'Sarah Lee',
      lastActivity: '2025-03-10',
      replies: 8,
      posts: [
        'Post 1: Solar is ideal for sunny regions.',
        'Post 2: Wind energy suits windy areas better.',
        'Post 3: Solar panels have lower maintenance.',
        'Post 4: Wind turbines can be noisier.',
        'Post 5: Compare initial costs per kW.',
        'Post 6: Solar is more space-efficient.',
        'Post 7: Wind provides energy at night.',
        'Post 8: Hybrid systems maximize output.',
        'Post 9: Environmental impact differs slightly.',
        'Post 10: Government incentives favor both.',
        'Post 11: Scalability options for each.',
        'Post 12: Energy storage needs vary.',
        'Post 13: Installation complexity compared.',
        'Post 14: Long-term ROI calculations.',
        'Post 15: User experiences with reliability.'
      ]
    },
    {
      id: 7,
      title: 'Home Battery Backup Systems',
      author: 'David Kim',
      lastActivity: '2025-03-09',
      replies: 2,
      posts: [
        'Post 1: Essential during power outages.',
        'Post 2: Costs can be high initially.',
        'Post 3: Pair with solar for full independence.',
        'Post 4: Capacity determines backup duration.',
        'Post 5: Safety features include fire suppression.',
        'Post 6: Integration with smart grids.',
        'Post 7: Warranty periods are crucial.',
        'Post 8: Maintenance involves cycle checks.',
        'Post 9: Options for expandable systems.',
        'Post 10: Compare brands like Tesla and LG.',
        'Post 11: Environmental impact of batteries.',
        'Post 12: Installation requires professionals.',
        'Post 13: Monitor via mobile apps.',
        'Post 14: Lifespan is 10-15 years typically.',
        'Post 15: Rebates available in some areas.'
      ]
    },
    {
      id: 8,
      title: 'Eco-Friendly Appliances',
      author: 'Laura Chen',
      lastActivity: '2025-03-08',
      replies: 5,
      posts: [
        'Post 1: Energy-star fridges save power.',
        'Post 2: Washers with high efficiency ratings.',
        'Post 3: LED lighting for homes.',
        'Post 4: Smart thermostats for heating.',
        'Post 5: Low-flow water appliances.',
        'Post 6: Compare costs and savings.',
        'Post 7: Brands like Bosch and Miele.',
        'Post 8: Long-term environmental benefits.',
        'Post 9: Government rebates for upgrades.',
        'Post 10: Maintenance tips for longevity.',
        'Post 11: Impact on utility bills.',
        'Post 12: Recycling old appliances.',
        'Post 13: User reviews for reliability.',
        'Post 14: Integration with home automation.',
        'Post 15: Energy monitoring features.'
      ]
    },
    {
      id: 9,
      title: 'Grid Independence Tips',
      author: 'Robert Garcia',
      lastActivity: '2025-03-07',
      replies: 3,
      posts: [
        'Post 1: Start with solar panels installation.',
        'Post 2: Batteries are key for storage.',
        'Post 3: Use inverters for AC power.',
        'Post 4: Monitor energy production daily.',
        'Post 5: Reduce consumption with efficiency.',
        'Post 6: Backup generators as a fallback.',
        'Post 7: Legal requirements for off-grid.',
        'Post 8: Water and waste management.',
        'Post 9: Community resources for advice.',
        'Post 10: Cost analysis for transition.',
        'Post 11: Sustainable living practices.',
        'Post 12: Weather-proofing your setup.',
        'Post 13: Scaling up over time.',
        'Post 14: Education on energy basics.',
        'Post 15: Success stories from users.'
      ]
    },
    {
      id: 10,
      title: 'Energy Monitoring Tools',
      author: 'Maria Lopez',
      lastActivity: '2025-03-06',
      replies: 7,
      posts: [
        'Post 1: Apps like Sense for real-time tracking.',
        'Post 2: Hardware like smart meters.',
        'Post 3: Integration with home systems.',
        'Post 4: Alerts for high usage.',
        'Post 5: Data visualization features.',
        'Post 6: Cost vs. benefit analysis.',
        'Post 7: Compatibility with devices.',
        'Post 8: User-friendly interfaces.',
        'Post 9: Privacy concerns addressed.',
        'Post 10: Accuracy of measurements.',
        'Post 11: Recommendations from experts.',
        'Post 12: Free vs. paid tools.',
        'Post 13: Setting energy goals.',
        'Post 14: Historical data tracking.',
        'Post 15: Impact on behavior change.'
      ]
    },
    {
      id: 11,
      title: 'Sustainable Home Design',
      author: 'James Patel',
      lastActivity: '2025-03-05',
      replies: 4,
      posts: [
        'Post 1: Passive solar design maximizes light.',
        'Post 2: Insulation tips for energy efficiency.',
        'Post 3: Green roofing options.',
        'Post 4: Material choices for sustainability.',
        'Post 5: Water conservation in design.',
        'Post 6: Architects specializing in eco-homes.',
        'Post 7: Cost implications discussed.',
        'Post 8: Long-term benefits outlined.',
        'Post 9: Case studies shared.',
        'Post 10: Community building aspects.',
        'Post 11: Regulations and certifications.',
        'Post 12: DIY vs. professional advice.',
        'Post 13: Energy modeling tools.',
        'Post 14: Aesthetic vs. functional balance.',
        'Post 15: User experiences with designs.'
      ]
    },
    {
      id: 12,
      title: 'EV Charging Solutions',
      author: 'Olivia Nguyen',
      lastActivity: '2025-03-04',
      replies: 6,
      posts: [
        'Post 1: Home chargers are convenient for daily use.',
        'Post 2: Cost comparison with public stations.',
        'Post 3: Level 2 vs. DC fast charging.',
        'Post 4: Installation guides for homes.',
        'Post 5: Integration with solar power.',
        'Post 6: App-based monitoring.',
        'Post 7: Safety features to consider.',
        'Post 8: Government incentives available.',
        'Post 9: Range anxiety solutions.',
        'Post 10: Compatibility with vehicle models.',
        'Post 11: Maintenance and upkeep.',
        'Post 12: Environmental impact.',
        'Post 13: User reviews on reliability.',
        'Post 14: Future-proofing with upgrades.',
        'Post 15: Community charging networks.'
      ]
    },
    {
      id: 13,
      title: 'Water Heating Efficiency',
      author: 'Brian Taylor',
      lastActivity: '2024-03-03',
      replies: 5,
      posts: [
        'Post 1: Solar water heaters save money long-term.',
        'Post 2: Maintenance advice for tanks.',
        'Post 3: Heat pump options compared.',
        'Post 4: Insulation wraps for pipes.',
        'Post 5: Energy ratings to check.',
        'Post 6: Installation costs broken down.',
        'Post 7: Rebates and incentives.',
        'Post 8: User tips for efficiency.',
        'Post 9: Tankless vs. traditional systems.',
        'Post 10: Environmental benefits.',
        'Post 11: Monitoring water usage.',
        'Post 12: Common issues and fixes.',
        'Post 13: Integration with smart homes.',
        'Post 14: Longevity and warranties.',
        'Post 15: Success stories from users.'
      ]
    }
  ];

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

    // Edit: Now that replies is defined, this will work correctly
    const newReplies = { ...replies };
    if (!newReplies[topicId]) newReplies[topicId] = [];
    newReplies[topicId].push({
      name: userName,
      message: newMessage,
      timestamp: Date.now(),
    });

    setReplies(newReplies);  // Now setReplies is defined and can be used

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
      const mockedSummary = mockSummarize(selectedTopic.posts);  // Use mock function
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
      // This will call the mock endpoint you add in api.js
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
      {topics.map((topic) => (
        <Box
          key={topic.id}
          p={6}
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="lg"
          boxShadow="md"
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
      backgroundImage={`url(${forumBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
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
          {selectedTopic ? renderTopicDiscussion() : renderTopicsList()}
        </VStack>
    </Box>
    </Flex>
  );
};

export default ForumPage;
