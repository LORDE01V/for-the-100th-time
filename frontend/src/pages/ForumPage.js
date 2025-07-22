/* eslint-disable no-unused-vars */
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
  Container,
  Avatar,
} from '@chakra-ui/react';
import forumBackground from '../assets/images/Forum_page.png';
import api from '../services/api'; // Import the API service as default

const ForumPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const metaTextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardTextColor = useColorModeValue('gray.800', 'white');
  const borderCol = useColorModeValue('gray.200', 'gray.700');
  const postBg = useColorModeValue('gray.50', 'gray.700');
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState({});
  const [tone, setTone] = useState(null);
  const [isSummarized, setIsSummarized] = useState(false);
  const [isCheckingTone, setIsCheckingTone] = useState(false);

  // Mock data for dummyTopics
  const dummyTopics = useMemo(() => [
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2025-03-15',
      replies: 5,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Regular cleaning of panels is essential for efficiency."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Check for dust buildup every month."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Use mild soap for washing to avoid damage."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Inspect wiring for any signs of wear."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Angle adjustments based on seasons help."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Monitor for shading issues from nearby trees."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Professional inspections recommended annually."
        },
        {
          name: "Kagiso",
          avatarColor: "yellow.500",
          message: "Avoid high-pressure water on panels."
        },
        {
          name: "Naledi",
          avatarColor: "cyan.500",
          message: "Range anxiety solutions. This is a common concern for EV owners. Solutions exist."
        },
        {
          name: "Mpho",
          avatarColor: "indigo.500",
          message: "Compatibility with vehicle models. This ensures your charger works with your specific EV."
        },
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Maintenance and upkeep. This is necessary to ensure your charger operates efficiently."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Environmental impact. This is a crucial consideration for any EV charging solution."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "User reviews on reliability. This helps you understand product performance."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Future-proofing with upgrades. This allows you to add more chargers or upgrade as needed."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Community charging networks. This allows you to charge your EV at multiple locations."
        }
      ]
    },
    {
      id: 13,
      title: 'Water Heating Efficiency',
      author: 'Brian Taylor',
      lastActivity: '2024-03-03',
      replies: 5,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Regular maintenance of heating systems. This ensures your system is working efficiently."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Insulate water pipes and tanks. This reduces heat loss and saves energy."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Consider heat pump water heaters. This is an efficient alternative to traditional water heaters."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Set thermostat to optimal temperature. This saves energy and prevents overheating."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Drain sediment from water heater. This improves efficiency and prolongs lifespan."
        }
      ]
    },
    {
      id: 14,
      title: 'Smart Home Energy Management',
      author: 'David Wilson',
      lastActivity: '2025-03-02',
      replies: 7,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Smart thermostats automate temperature control. This helps you save energy and money."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Energy monitoring with smart plugs. This allows you to track energy consumption of individual appliances."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Automated lighting systems. This saves energy and enhances convenience."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Integration with renewable energy sources. This allows you to power your home with solar or wind energy."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Voice control for appliances. This enhances convenience and ease of use."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Geofencing for energy optimization. This allows you to save energy when you're away from home."
        },
        {
          name: "Sibusiso",
          avatarColor: "red.400",
          message: "Remote access to home energy settings. This allows you to control your home's energy consumption from anywhere."
        }
      ]
    },
    {
      id: 15,
      title: 'Community Energy Initiatives',
      author: 'Emily Brown',
      lastActivity: '2024-02-28',
      replies: 4,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Join local energy co-ops. This allows you to pool resources and invest in renewable energy projects."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Participate in community solar projects. This allows you to generate your own clean energy."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Advocate for local renewable policies. This helps create a more sustainable energy future."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Volunteer for energy efficiency programs. This helps your community save energy and money."
        }
      ]
    },
    {
      id: 16,
      title: 'Battery Storage Solutions',
      author: 'Frank White',
      lastActivity: '2025-02-25',
      replies: 6,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Home battery systems store excess solar energy. This allows you to use solar energy even when the sun isn't shining."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Benefits of energy independence. This reduces your reliance on the grid and protects you from power outages."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Battery types and their longevity. This helps you choose the right battery for your needs."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Cost-effectiveness of battery storage. This helps you understand the financial benefits of battery storage."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Installation considerations. This is a complex process that must be done correctly."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Safety precautions for battery systems. This is crucial for any battery storage solution."
        }
      ]
    },
    {
      id: 17,
      title: 'Sustainable Living Tips',
      author: 'Grace Green',
      lastActivity: '2024-02-20',
      replies: 3,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Reduce energy consumption at home. This saves energy and money."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Compost organic waste. This reduces landfill waste and creates nutrient-rich soil."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Grow your own food. This reduces your carbon footprint and provides fresh produce."
        }
      ]
    },
    {
      id: 18,
      title: 'Off-Grid Energy Systems',
      author: 'Henry Adams',
      lastActivity: '2025-02-18',
      replies: 5,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Designing an off-grid solar system. This is a complex process that requires careful planning."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Component selection for reliability. This ensures your system is robust and dependable."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Backup generator considerations. This provides a reliable source of power during outages."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Permitting and regulations. This is a complex process that requires careful planning."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Maintenance of off-grid systems. This is necessary to ensure your system operates efficiently."
        }
      ]
    },
    {
      id: 19,
      title: 'Energy Policy and Regulation',
      author: 'Irene Taylor',
      lastActivity: '2024-02-15',
      replies: 4,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Understanding local energy policies. This helps you navigate the regulatory landscape."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Impact of policy on renewable energy. This can significantly impact the growth of renewable energy."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "Advocacy for consumer rights. This protects your rights as an energy consumer."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Future of energy markets. This is a dynamic and evolving landscape."
        }
      ]
    },
    {
      id: 20,
      title: 'DIY Home Energy Projects',
      author: 'Jack Johnson',
      lastActivity: '2025-02-10',
      replies: 6,
      posts: [
        {
          name: "Ayanda",
          avatarColor: "teal.500",
          message: "Insulating your home for energy efficiency. This is a cost-effective way to save energy."
        },
        {
          name: "Sipho",
          avatarColor: "orange.400",
          message: "Building a mini solar charger. This is a fun and educational project."
        },
        {
          name: "Lerato",
          avatarColor: "purple.500",
          message: "DIY wind turbine for small scale power. This is a great way to generate your own clean energy."
        },
        {
          name: "Thabo",
          avatarColor: "blue.400",
          message: "Rainwater harvesting for water heating. This is a sustainable way to heat your water."
        },
        {
          name: "Zanele",
          avatarColor: "pink.400",
          message: "Composting for energy generation. This creates nutrient-rich soil and reduces landfill waste."
        },
        {
          name: "Nomsa",
          avatarColor: "green.500",
          message: "Energy-efficient window treatments. This reduces heat loss and saves energy."
        }
      ]
    },
  ], []); // Add empty dependency array

  const mockSummarize = (message) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const generatedSummary = `Summary of the message: "${message.substring(0, 100)}..."`;
        setIsLoading(false);
        resolve(generatedSummary);
      }, 1500);
    });
  };

  const handlePostMessage = () => {
    if (newMessage.trim() === '') {
      toast({
        title: 'Empty message',
        description: "Please type a message before posting.",
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setReplies((prev) => ({
      ...prev,
      [selectedTopic.id]: [
        ...(prev[selectedTopic.id] || []),
        {
          name: "Current User", // Replace with actual user's name
          avatarColor: "gray.500",
          message: newMessage.trim(),
        },
      ],
    }));
    setNewMessage('');
    toast({
      title: 'Message posted!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSummarize = async () => {
    setIsSummarized(true);
    setIsLoading(true);
    const allPosts = selectedTopic.posts.map(post => post.message).join(' ');
    const aiSummary = await mockSummarize(allPosts); // Using mock summarize
    setSummary(aiSummary);
    setIsLoading(false);
  };

  const handleCheckTone = async () => {
    if (newMessage.trim() === '') {
      toast({
        title: 'Empty message',
        description: "Please type a message to check the tone.",
        status: 'warning',
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
      console.error('Error checking tone:', error);
      toast({
        title: 'Tone check failed',
        description: error.message || "Could not check tone. Please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCheckingTone(false);
    }
  };

  const handleShowFullPosts = () => {
    setSummary(null);
    setIsSummarized(false);
  };

  const renderTone = () => {
    if (isCheckingTone) {
      return <Spinner size="sm" />;
    }
    if (tone) {
      let color = 'gray.500';
      if (tone === 'positive') color = 'green.500';
      else if (tone === 'negative') color = 'red.500';

    return (
        <Text mt={2} fontWeight="bold" color={color}>
          Detected Tone: {tone.charAt(0).toUpperCase() + tone.slice(1)}
        </Text>
    );
    }
    return null;
  };

  const renderTopicsList = () => (
    <VStack spacing={4} align="stretch">
      {dummyTopics.map((topic) => (
        <Box
          key={topic.id}
          p={5}
          shadow="md"
          borderWidth="1px"
          borderColor={borderCol}
          borderRadius="lg"
          onClick={() => setSelectedTopic(topic)}
          cursor="pointer"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
        >
          <Heading fontSize="xl" color={cardTextColor}>
              {topic.title}
            </Heading>
          <Text mt={2} color={metaTextColor}>
            by {topic.author} | Last activity: {topic.lastActivity} | Replies: {topic.replies}
          </Text>
        </Box>
      ))}
    </VStack>
  );

  const renderTopicDiscussion = () => {
    const currentPosts = selectedTopic ? [...selectedTopic.posts, ...(replies[selectedTopic.id] || [])] : [];
    const displayPosts = isSummarized ? [{ name: "AI Summary", avatarColor: "purple.500", message: summary }] : currentPosts;

    return (
        <Box
          bg={cardBg}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="1px"
          borderColor={borderCol}
        p={6}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Button leftIcon={<FaArrowLeft />} onClick={() => setSelectedTopic(null)} variant="ghost">
            Back to Topics
          </Button>
          <Heading size="lg" color={cardTextColor}>
            {selectedTopic?.title}
          </Heading>
        </Flex>

        <VStack spacing={4} align="stretch" mb={6}>
          {displayPosts.map((post, index) => (
            <Flex key={index} p={3} bg={postBg} borderRadius="md" shadow="sm">
              <Avatar name={post.name} bg={post.avatarColor} color="white" size="sm" mr={3} />
                      <Box>
                        <Text fontWeight="bold" color={cardTextColor}>{post.name}</Text>
                <Text color={cardTextColor}>{post.message}</Text>
                      </Box>
            </Flex>
          ))}
        </VStack>

          <Textarea
          placeholder="Type your message here..."
            value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          mb={3}
            bg={postBg}
          color={cardTextColor}
          borderColor={borderCol}
          />
        <Flex align="center" gap={3}>
            <Button
            colorScheme="blue"
            onClick={handlePostMessage}
            leftIcon={<FaPaperPlane />}
            isLoading={isLoading}
            loadingText="Posting"
          >
            Post Message
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSummarize}
            leftIcon={<FaComments />}
            isLoading={isLoading}
            loadingText="Summarizing"
            isDisabled={isSummarized}
          >
            {isSummarized ? 'Summarized' : 'Summarize Discussion'}
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleCheckTone}
            isLoading={isCheckingTone}
            loadingText="Checking Tone"
          >
            Check Tone
          </Button>
          {isSummarized && (
            <Button colorScheme="orange" onClick={handleShowFullPosts}>
              Show Full Posts
            </Button>
          )}
        </Flex>
        {renderTone()}
      </Box>
    );
  };

  return (
    <Container maxW="container.xl" py={10} bgImage={`url(${forumBackground})`} bgSize="cover" bgPos="center" minH="100vh" color={textColor}>
          <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color={textColor}>
          Community Forum
            </Heading>
        <Text textAlign="center" fontSize="lg" color={subTextColor}>
          Connect with other users, share tips, and get support!
        </Text>
        {
          selectedTopic ? renderTopicDiscussion() : renderTopicsList()
        }
          </VStack>
      </Container>
  );
};

export default ForumPage;