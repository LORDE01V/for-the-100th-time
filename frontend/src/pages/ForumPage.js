import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import axios from 'axios';

// Import Chakra UI Components
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Text,
  Textarea,
  useToast,
  Spinner,
  Container,
  Avatar,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Icon
} from '@chakra-ui/react';

// Import Icons
import { FaArrowLeft, FaPlus, FaCommentAlt } from 'react-icons/fa';

// Dummy data structure for topics and posts
const dummyTopics = [
  {
    id: 1,
    title: 'Troubleshooting Inverter Error E01',
    author: { name: 'Thabo Mokoena', avatar: 'https://ui-avatars.com/api/?name=Thabo+Mokoena&background=2C3E50&color=FFFFFF' },
    posts: 5,
    lastActivity: '2 hours ago',
    latestPostAuthor: { name: 'SupportBot', avatar: 'https://ui-avatars.com/api/?name=Support+Bot&background=16A085&color=FFFFFF' },
    comments: [
      { id: 1, author: { name: 'Thabo Mokoena', avatar: 'https://ui-avatars.com/api/?name=Thabo+Mokoena&background=2C3E50&color=FFFFFF' }, content: 'Getting Error E01 on my inverter, system offline. Anyone else seen this?', timestamp: '3 hours ago' },
      { id: 2, author: { name: 'SupportBot', avatar: 'https://ui-avatars.com/api/?name=Support+Bot&background=16A085&color=FFFFFF' }, content: 'Error E01 typically indicates a grid voltage issue. Please check your connection and ensure the grid is stable. If it persists, try a system restart or contact technical support.', timestamp: '2 hours ago' },
      { id: 3, author: { name: 'Zanele Khumalo', avatar: 'https://ui-avatars.com/api/?name=Zanele+Khumalo&background=E74C3C&color=FFFFFF' }, content: 'I had a similar error last week, a quick system restart fixed it for me.', timestamp: '1 hour ago' },
      { id: 4, author: { name: 'Thabo Mokoena', avatar: 'https://ui-avatars.com/api/?name=Thabo+Mokoena&background=2C3E50&color=FFFFFF' }, content: 'Thanks! Restarting now...', timestamp: '30 minutes ago' },
      { id: 5, author: { name: 'Thabo Mokoena', avatar: 'https://ui-avatars.com/api/?name=Thabo+Mokoena&background=2C3E50&color=FFFFFF' }, content: 'Restart worked! Thanks everyone.', timestamp: '15 minutes ago' },
    ]
  },
  {
    id: 2,
    title: 'Sharing Solar Savings Tips',
    author: { name: 'Sipho Dlamini', avatar: 'https://ui-avatars.com/api/?name=Sipho+Dlamini&background=3498DB&color=FFFFFF' },
    posts: 12,
    lastActivity: '1 day ago',
    latestPostAuthor: { name: 'Naledi Mahlangu', avatar: 'https://ui-avatars.com/api/?name=Naledi+Mahlangu&background=9B59B6&color=FFFFFF' },
    comments: [
      { id: 1, author: { name: 'Sipho Dlamini', avatar: 'https://ui-avatars.com/api/?name=Sipho+Dlamini&background=3498DB&color=FFFFFF' }, content: 'Hey everyone! Wanted to start a thread for sharing tips on maximizing solar savings. I found that running my heavy appliances during peak sun hours makes a huge difference. What are your tips?', timestamp: '1 day ago' },
      { id: 2, author: { name: 'Naledi Mahlangu', avatar: 'https://ui-avatars.com/api/?name=Naledi+Mahlangu&background=9B59B6&color=FFFFFF' }, content: 'Great idea! I try to schedule my geyser to heat up around midday using a timer. Also, switching to LED bulbs helped reduce my baseline consumption.', timestamp: '23 hours ago' },
      { id: 3, author: { name: 'Lerato Molefe', avatar: 'https://ui-avatars.com/api/?name=Lerato+Molefe&background=1ABC9C&color=FFFFFF' }, content: 'Smart plugs are a game changer for identifying energy hungry devices!', timestamp: '20 hours ago' },
    ]
  },
  {
    id: 3,
    title: 'Best Practices for Battery Maintenance',
    author: { name: 'Kagiso Ndlovu', avatar: 'https://ui-avatars.com/api/?name=Kagiso+Ndlovu&background=F1C40F&color=FFFFFF' },
    posts: 8,
    lastActivity: '3 days ago',
    latestPostAuthor: { name: 'Kagiso Ndlovu', avatar: 'https://ui-avatars.com/api/?name=Kagiso+Ndlovu&background=F1C40F&color=FFFFFF' },
    comments: [
      { id: 1, author: { name: 'Kagiso Ndlovu', avatar: 'https://ui-avatars.com/api/?name=Kagiso+Ndlovu&background=F1C40F&color=FFFFFF' }, content: 'Starting a thread on battery maintenance. Regular cleaning of terminals is crucial. Also, avoid fully draining the battery if possible to prolong its lifespan.', timestamp: '3 days ago' },
      { id: 2, author: { name: 'Sibusiso Tshabalala', avatar: 'https://ui-avatars.com/api/?name=Sibusiso+Tshabalala&background=E67E22&color=FFFFFF' }, content: 'Thanks for the tips! How often should the terminals be cleaned?', timestamp: '2 days ago' },
      { id: 3, author: { name: 'Kagiso Ndlovu', avatar: 'https://ui-avatars.com/api/?name=Kagiso+Ndlovu&background=F1C40F&color=FFFFFF' }, content: 'Depends on your environment, but checking them every 3-6 months is a good starting point.', timestamp: '2 days ago' },
    ]
  }
];

function ForumPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = auth.getCurrentUser();

  // State management
  const [topics, setTopics] = useState(dummyTopics);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingTopicDetails, setIsLoadingTopicDetails] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editTopicTitle, setEditTopicTitle] = useState('');
  const [editTopicContent, setEditTopicContent] = useState('');
  const [editReplyContent, setEditReplyContent] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const buttonScheme = useColorModeValue('teal', 'blue');
  const replyInputBg = useColorModeValue('gray.100', 'gray.700');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast({
        title: 'Message Required',
        description: 'Please enter a message before posting',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, navigate, toast]);

  // Fetch topics only once when component mounts
  useEffect(() => {
    if (user) {
      fetchTopics();
    }
  }, [user]);

  // Fetch all topics
  const fetchTopics = async () => {
    try {
      setIsLoadingTopics(true);
      const response = await axios.get('http://localhost:5000/api/forum/topics', {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });
      
      if (response.data.success) {
        // Merge new topics with dummy topics, avoiding duplicates
        const newTopics = response.data.topics.filter(newTopic => 
          !dummyTopics.some(dummyTopic => dummyTopic.id === newTopic.id)
        );
        setTopics(prevTopics => [...dummyTopics, ...newTopics]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Don't show error toast, just keep using dummy topics
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Fetch specific topic details
  const fetchTopicDetails = async (topicId) => {
    try {
      setIsLoadingTopicDetails(true);
      const response = await axios.get(`http://localhost:5000/api/forum/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });
      
      if (response.data.success) {
        setSelectedTopic(response.data.topic);
        setIsReplying(false);
        setIsCreatingTopic(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch topic details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTopicDetails(false);
    }
  };

  // Create new topic
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content cannot be empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmittingTopic(true);
      const response = await axios.post('http://localhost:5000/api/forum/topics', {
        title: newTopicTitle,
        content: newTopicContent
      }, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });

      if (response.data.success) {
        setTopics(prevTopics => [...prevTopics, response.data.topic]);
        toast({
          title: 'Success',
          description: 'Topic created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsCreatingTopic(false);
        setNewTopicTitle('');
        setNewTopicContent('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create topic',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmittingTopic(false);
    }
  };

  // Post reply to topic
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) {
      toast({
        title: 'Error',
        description: 'Reply cannot be empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await axios.post(`http://localhost:5000/api/forum/topics/${selectedTopic.id}/replies`, {
        content: newReply
      }, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });

      if (response.data.success) {
        setSelectedTopic(prevTopic => ({
          ...prevTopic,
          replies: [...prevTopic.replies, response.data.reply]
        }));
        toast({
          title: 'Success',
          description: 'Reply posted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setNewReply('');
        setIsReplying(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditTopic = async (e) => {
    e.preventDefault();
    if (!editTopicTitle.trim() || !editTopicContent.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content cannot be empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const response = await axios.put(`http://localhost:5000/api/forum/topics/${editingTopic.id}`, {
        title: editTopicTitle,
        content: editTopicContent
      }, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });

      if (response.data.success) {
        setSelectedTopic(response.data.topic);
        setTopics(prevTopics => 
          prevTopics.map(topic => 
            topic.id === editingTopic.id ? response.data.topic : topic
          )
        );
        toast({
          title: 'Success',
          description: 'Topic updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditingTopic(null);
        setEditTopicTitle('');
        setEditTopicContent('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update topic',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleEditReply = async (e) => {
    e.preventDefault();
    if (!editReplyContent.trim()) {
      toast({
        title: 'Error',
        description: 'Reply cannot be empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const response = await axios.put(`http://localhost:5000/api/forum/replies/${editingReply.id}`, {
        content: editReplyContent
      }, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });

      if (response.data.success) {
        setSelectedTopic(prevTopic => ({
          ...prevTopic,
          replies: prevTopic.replies.map(reply =>
            reply.id === editingReply.id ? response.data.reply : reply
          )
        }));
        toast({
          title: 'Success',
          description: 'Reply updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditingReply(null);
        setEditReplyContent('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reply',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
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
      <Container maxW="container.xl" py={8} position="relative" zIndex={2}>
        {/* Header */}
        <HStack justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => {
              if (selectedTopic) {
                setSelectedTopic(null);
              } else {
                navigate('/home');
              }
            }}
            color={headingColor}
          >
            {selectedTopic ? 'Back to Topics' : 'Back to Home'}
          </Button>
          {!selectedTopic && !isCreatingTopic && (
            <Button colorScheme={buttonScheme} leftIcon={<FaPlus />} onClick={() => setIsCreatingTopic(true)}>
              New Topic
            </Button>
          )}
          {isCreatingTopic && (
            <Button variant="outline" size="sm" onClick={() => setIsCreatingTopic(false)}>
              Cancel
            </Button>
          )}
        </HStack>

        <Heading as="h1" size="xl" color={headingColor} mb={6}>
          {selectedTopic ? selectedTopic.title : 'Community Forum'}
        </Heading>

        {/* Loading States */}
        {isLoadingTopics && !selectedTopic && (
          <Flex justify="center" align="center" py={4}>
            <Spinner size="md" color={spinnerColor} />
          </Flex>
        )}

        {isLoadingTopicDetails && selectedTopic && (
          <Flex justify="center" align="center" py={4}>
            <Spinner size="md" color={spinnerColor} />
          </Flex>
        )}

        {/* Create New Topic Form */}
        {isCreatingTopic && (
          <Box
            p={6}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            borderWidth="1px"
            borderColor={cardBorderColor}
            mb={8}
          >
            <Heading as="h2" size="lg" mb={4} color={headingColor}>Create New Topic</Heading>
            <VStack as="form" spacing={4} onSubmit={handleCreateTopic}>
              <FormControl id="topic-title" isRequired>
                <FormLabel color={textColor}>Topic Title</FormLabel>
                <Input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
              </FormControl>
              <FormControl id="topic-content" isRequired>
                <FormLabel color={textColor}>Content</FormLabel>
                <Textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={6}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme={buttonScheme}
                isLoading={submittingTopic}
                loadingText="Creating..."
                w="full"
                mt={4}
              >
                Post Topic
              </Button>
            </VStack>
          </Box>
        )}

        {/* Topic List View */}
        {!selectedTopic && !isCreatingTopic && !isLoadingTopics && (
          <VStack spacing={4} align="stretch">
            {topics.map((topic) => (
              <Box
                key={topic.id}
                p={4}
                bg={cardBg}
                borderRadius="md"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={cardBorderColor}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  cursor: 'pointer'
                }}
                onClick={() => fetchTopicDetails(topic.id)}
              >
                <VStack align="stretch" spacing={2}>
                  <Heading as="h3" size="md" color={headingColor}>
                    {topic.title}
                  </Heading>
                  <HStack spacing={4} fontSize="sm" color={textColor}>
                    <HStack>
                      <Avatar size="xs" name={topic.author.name} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(topic.author.name)}&background=random&color=FFFFFF`} />
                      <Text fontWeight="semibold">{topic.author.name}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaCommentAlt} />
                      <Text>{topic.posts} Posts</Text>
                    </HStack>
                    <Text>Last activity: {new Date(topic.last_activity).toLocaleString()}</Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
            {topics.length === 0 && (
              <Text textAlign="center" mt={8} color={textColor}>No topics yet. Be the first to post!</Text>
            )}
          </VStack>
        )}

        {/* Individual Topic View */}
        {selectedTopic && !isLoadingTopicDetails && (
          <VStack spacing={6} align="stretch">
            {/* Original Post */}
            <Box
              p={4}
              bg={cardBg}
              borderRadius="md"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={cardBorderColor}
            >
              <HStack align="flex-start" spacing={3}>
                <Avatar size="sm" name={selectedTopic.author.name} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTopic.author.name)}&background=random&color=FFFFFF`} />
                <VStack align="stretch" spacing={1} flex="1">
                  <Text fontWeight="semibold" color={headingColor}>{selectedTopic.author.name}</Text>
                  <Text fontSize="sm" color={textColor}>{new Date(selectedTopic.created_at).toLocaleString()}</Text>
                  {editingTopic?.id === selectedTopic.id ? (
                    <VStack as="form" spacing={4} onSubmit={handleEditTopic}>
                      <FormControl isRequired>
                        <FormLabel>Title</FormLabel>
                        <Input
                          value={editTopicTitle}
                          onChange={(e) => setEditTopicTitle(e.target.value)}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Content</FormLabel>
                        <Textarea
                          value={editTopicContent}
                          onChange={(e) => setEditTopicContent(e.target.value)}
                          rows={4}
                        />
                      </FormControl>
                      <HStack spacing={4} justify="flex-end">
                        <Button variant="outline" onClick={() => setEditingTopic(null)}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          colorScheme={buttonScheme}
                          isLoading={isSubmittingEdit}
                        >
                          Save Changes
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <>
                      <Box mt={2} color={textColor}>
                        {selectedTopic.content}
                      </Box>
                      {selectedTopic.author.id === user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTopic(selectedTopic);
                            setEditTopicTitle(selectedTopic.title);
                            setEditTopicContent(selectedTopic.content);
                          }}
                        >
                          Edit Topic
                        </Button>
                      )}
                    </>
                  )}
                </VStack>
              </HStack>
            </Box>

            {/* Replies */}
            {selectedTopic.replies.map((reply) => (
              <Box
                key={reply.id}
                p={4}
                bg={cardBg}
                borderRadius="md"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={cardBorderColor}
              >
                <HStack align="flex-start" spacing={3}>
                  <Avatar size="sm" name={reply.author.name} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author.name)}&background=random&color=FFFFFF`} />
                  <VStack align="stretch" spacing={1} flex="1">
                    <Text fontWeight="semibold" color={headingColor}>{reply.author.name}</Text>
                    <Text fontSize="sm" color={textColor}>{new Date(reply.created_at).toLocaleString()}</Text>
                    {editingReply?.id === reply.id ? (
                      <VStack as="form" spacing={4} onSubmit={handleEditReply}>
                        <FormControl isRequired>
                          <Textarea
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            rows={4}
                          />
                        </FormControl>
                        <HStack spacing={4} justify="flex-end">
                          <Button variant="outline" onClick={() => setEditingReply(null)}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            colorScheme={buttonScheme}
                            isLoading={isSubmittingEdit}
                          >
                            Save Changes
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <>
                        <Box mt={2} color={textColor}>
                          {reply.content}
                        </Box>
                        {reply.author.id === user.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingReply(reply);
                              setEditReplyContent(reply.content);
                            }}
                          >
                            Edit Reply
                          </Button>
                        )}
                      </>
                    )}
                  </VStack>
                </HStack>
              </Box>
            ))}

            {/* Reply Form */}
            {!isReplying ? (
              <Flex justify="flex-end" mt={4}>
                <Button colorScheme={buttonScheme} size="sm" onClick={() => setIsReplying(true)}>
                  Reply
                </Button>
              </Flex>
            ) : (
              <Box
                p={4}
                bg={cardBg}
                borderRadius="md"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={cardBorderColor}
                mt={4}
              >
                <Heading as="h3" size="md" mb={4} color={headingColor}>Post a Reply</Heading>
                <FormControl id="reply-content" isRequired>
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write your reply here..."
                    rows={4}
                    bg={replyInputBg}
                    borderColor={cardBorderColor}
                    _hover={{ borderColor: buttonScheme === 'teal' ? 'teal.500' : 'blue.500' }}
                    _focus={{ borderColor: buttonScheme === 'teal' ? 'teal.500' : 'blue.500', boxShadow: `0 0 0 1px ${buttonScheme === 'teal' ? 'teal.500' : 'blue.500'}` }}
                  />
                </FormControl>
                <HStack spacing={4} mt={4} justify="flex-end">
                  <Button variant="outline" onClick={() => setIsReplying(false)} size="sm">
                    Cancel
                  </Button>
                  <Button
                    colorScheme={buttonScheme}
                    onClick={handlePostReply}
                    isLoading={submittingReply}
                    loadingText="Posting..."
                    size="sm"
                  >
                    Post Reply
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default ForumPage;
