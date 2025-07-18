import React, { useState, useEffect, useMemo } from "react";
import "./AISuggestions.css";
import SavingsChart from '../components/SavingsChart';
import SuggestionTrendChart from '../components/SuggestionTrendChart';
import { 
  Box, 
  Tooltip, 
  Container, 
  Badge, 
  Button, 
  HStack, 
  Text, 
  Flex, 
  Alert, 
  AlertIcon,
  Heading,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Select,
  VStack,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  WarningTwoIcon, 
  InfoIcon, 
  CheckCircleIcon, 
  ArrowDownIcon, 
  TimeIcon,
  RepeatIcon,
  BellIcon,
  CopyIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import aiSuggestionBg from '../assets/images/AI_suggestion.png';

const AISuggestions = () => {
  useEffect(() => {
    document.body.classList.add('ai-suggestions-bg');
    return () => {
      document.body.classList.remove('ai-suggestions-bg');
    };
  }, []);

  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortByVotes, setSortByVotes] = useState(true);
  const [dailyTip, setDailyTip] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Enhanced features state
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [votes, setVotes] = useState({});
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [trendDays, setTrendDays] = useState(7);
  const [feedbackComment, setFeedbackComment] = useState("");
  
  // --- ADVANCED FEATURE STATE MANAGEMENT ---
  // User Comments
  const [comments, setComments] = useState(() => {
    return JSON.parse(localStorage.getItem("ai_comments")) || {};
  });
  const handleComment = (id, comment) => {
    const newComments = { ...comments, [id]: [...(comments[id] || []), comment] };
    setComments(newComments);
    localStorage.setItem("ai_comments", JSON.stringify(newComments));
  };

  // User Goal Tracking
  const [goal, setGoal] = useState(() => {
    return Number(localStorage.getItem("ai_goal")) || 0;
  });
  const handleGoalChange = (value) => {
    setGoal(value);
    localStorage.setItem("ai_goal", value);
  };

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  });
  const toggleFavorite = (id) => {
    const updated = new Set(favorites);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    const arr = Array.from(updated);
    setFavorites(arr);
    localStorage.setItem("favorites", JSON.stringify(arr));
  };

  // User Notes
  const [userNotes, setUserNotes] = useState(() => {
    return JSON.parse(localStorage.getItem("ai_notes")) || {};
  });
  const handleNoteChange = (id, note) => {
    const newNotes = { ...userNotes, [id]: note };
    setUserNotes(newNotes);
    localStorage.setItem("ai_notes", JSON.stringify(newNotes));
  };

  const toast = useToast();

  // Mock data for suggestions with enhanced properties
  useEffect(() => {
    const mockSuggestions = [
      { 
        id: 1, 
        title: "Save Energy", 
        description: "Turn off unused appliances to reduce energy consumption by 15%.", 
        category: "Energy Saving", 
        votes: 10, 
        priority: "high",
        estimated_savings: 150.50,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      { 
        id: 2, 
        title: "Maintenance Alert", 
        description: "Check your solar panels for dust accumulation.", 
        category: "Maintenance", 
        votes: 5, 
        priority: "medium",
        estimated_savings: 75.25,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      { 
        id: 3, 
        title: "Upgrade Recommendation", 
        description: "Consider upgrading to a 5kW inverter for better efficiency.", 
        category: "Upgrades", 
        votes: 8, 
        priority: "low",
        estimated_savings: 300.00,
        created_at: new Date().toISOString()
      },
      { 
        id: 4, 
        title: "Smart Thermostat", 
        description: "Install a smart thermostat to optimize heating and cooling.", 
        category: "Energy Saving", 
        votes: 12, 
        priority: "high",
        estimated_savings: 200.00,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      { 
        id: 5, 
        title: "LED Lighting", 
        description: "Replace traditional bulbs with LED lights for 80% energy savings.", 
        category: "Upgrades", 
        votes: 15, 
        priority: "medium",
        estimated_savings: 120.75,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setSuggestions(mockSuggestions);
    setFilteredSuggestions(mockSuggestions);
  }, []);

  // Enhanced Priority Badge with icons and tooltips
  const getPriorityProps = (priority) => {
    switch (priority) {
      case 'high':
        return { 
          color: 'red', 
          icon: <WarningTwoIcon mr={1} />, 
          label: 'High impact - Immediate attention recommended' 
        };
      case 'medium':
        return { 
          color: 'orange', 
          icon: <InfoIcon mr={1} />, 
          label: 'Moderate impact - Consider implementing soon' 
        };
      case 'low':
        return { 
          color: 'green', 
          icon: <CheckCircleIcon mr={1} />, 
          label: 'Low impact - Good to implement when convenient' 
        };
      default:
        return { 
          color: 'gray', 
          icon: null, 
          label: 'No priority set' 
        };
    }
  };

  const PriorityBadge = ({ priority }) => {
    const { color, icon, label } = getPriorityProps(priority);
    return (
      <Tooltip label={label} hasArrow placement="top">
        <Badge colorScheme={color} px={2} borderRadius="lg" fontSize="sm" position="absolute" top="10px" right="10px">
          {icon} {priority?.toUpperCase() || 'MEDIUM'}
        </Badge>
      </Tooltip>
    );
  };

  // Load votes from localStorage
  useEffect(() => {
    const storedVotes = JSON.parse(localStorage.getItem("aiVotes")) || {};
    setVotes(storedVotes);
  }, []);

  // Enhanced sorted suggestions with priority filtering
  const sortedSuggestions = useMemo(() => {
    let suggestionsCopy = [...filteredSuggestions];
    
    // Apply priority filter
    if (priorityFilter) {
      suggestionsCopy = suggestionsCopy.filter(s => s.priority === priorityFilter);
    }
    
    // Sort by votes or date
    if (sortByVotes) {
      return suggestionsCopy.sort((a, b) => {
        const aTotalVotes = (a.votes || 0) + (votes[a.id] || 0);
        const bTotalVotes = (b.votes || 0) + (votes[b.id] || 0);
        return bTotalVotes - aTotalVotes;
      });
    } else {
      return suggestionsCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [filteredSuggestions, sortByVotes, priorityFilter, votes]);

  // Enhanced Daily AI Tip with refresh functionality
  useEffect(() => {
    const today = new Date().toDateString();
    const cachedTip = JSON.parse(localStorage.getItem("dailyAITip"));

    if (cachedTip && cachedTip.date === today) {
      setDailyTip(cachedTip.tip);
    } else {
      const randomTip = suggestions[Math.floor(Math.random() * suggestions.length)];
      if (randomTip) {
        setDailyTip(randomTip);
        localStorage.setItem("dailyAITip", JSON.stringify({ date: today, tip: randomTip }));
      }
    }
  }, [suggestions]);

  const refreshTip = () => {
    const randomTip = suggestions[Math.floor(Math.random() * suggestions.length)];
    if (randomTip) {
      setDailyTip(randomTip);
      localStorage.setItem("dailyAITip", JSON.stringify({ 
        date: new Date().toDateString(), 
        tip: randomTip 
      }));
      toast({
        title: "New tip loaded!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Enhanced daily tip functionality
  const notifyTip = () => {
    if (Notification.permission === "granted") {
      new Notification("Your AI Energy Tip", {
        body: dailyTip.description,
        icon: '/logo192.png'
      });
      toast({
        title: "Reminder set!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          notifyTip();
        }
      });
    }
  };

  const copyTip = () => {
    navigator.clipboard.writeText(dailyTip.description).then(() => {
      toast({
        title: "Tip copied to clipboard!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  const shareTip = () => {
    const text = `AI Energy Tip: ${dailyTip.description}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Enhanced User feedback collector
  useEffect(() => {
    if (viewCount >= 5 && !localStorage.getItem("ai_feedback_given")) {
      setShowFeedback(true);
    }
  }, [viewCount]);

  const handleFeedback = (response) => {
    const feedbackData = { 
      response, 
      comment: feedbackComment,
      date: new Date().toISOString() 
    };
    localStorage.setItem("ai_feedback_given", JSON.stringify(feedbackData));
    setShowFeedback(false);
    setFeedbackComment("");
    toast({
      title: "Thank you for your feedback!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleView = () => setViewCount(prev => prev + 1);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = suggestions.filter((s) =>
      s.title.toLowerCase().includes(term.toLowerCase()) || s.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredSuggestions(suggestions);
    } else if (category === "Favorites") {
      setFilteredSuggestions(suggestions.filter(s => favorites.includes(s.id)));
    } else {
      const filtered = suggestions.filter((s) => s.category === category);
      setFilteredSuggestions(filtered);
    }
  };

  // Enhanced voting with localStorage persistence
  const handleVote = (id, direction) => {
    const newVotes = {
      ...votes,
      [id]: (votes[id] || 0) + direction
    };
    setVotes(newVotes);
    localStorage.setItem("aiVotes", JSON.stringify(newVotes));
    
    toast({
      title: direction > 0 ? "Upvoted!" : "Downvoted!",
      status: "success",
      duration: 1000,
      isClosable: true,
    });
  };

  const titleColor = useColorModeValue('gray.100', 'gray.200');
  const descriptionColor = useColorModeValue('gray.300', 'gray.400');
  const savingsColor = useColorModeValue('green.400', 'green.200');

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
          background: `url(${aiSuggestionBg}) center center / cover no-repeat`
        }}
      />
      <Container
        maxW="5xl"
        py={8}
        style={{
          background: "rgba(24, 26, 32, 0.3)", // semi-transparent dark
          backdropFilter: "blur(16px)",        // glassmorphism blur
          WebkitBackdropFilter: "blur(16px)",  // for Safari support
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.18)", // subtle border
          boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
          minHeight: "100vh"
        }}
      >
        <Heading size="xl" mb={2} color={useColorModeValue('gray.800', 'white')}>AI Suggestions</Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>Get personalized energy-saving tips and suggestions to optimize your usage.</Text>
        {/* Goal Tracking Section */}
        <Box mb={6} p={4} bg="#23272F" borderRadius="md" border="1px solid #38B2AC" color="#F7FAFC">
          <HStack spacing={4} align="center">
            <Text fontWeight="bold">Monthly Savings Goal:</Text>
            <input
              type="number"
              min="0"
              value={goal}
              onChange={e => handleGoalChange(Number(e.target.value))}
              style={{
                width: '100px',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #38B2AC',
                background: '#181A20',
                color: '#F7FAFC',
                fontWeight: 'bold',
                fontSize: '16px',
                marginRight: '10px'
              }}
              placeholder="R100"
            />
            <Text fontSize="sm" color="#38B2AC">Set your target for the month</Text>
          </HStack>
          <Box mt={3}>
            <Progress value={goal ? (suggestions.reduce((acc, s) => acc + (s.estimated_savings || 0), 0) / goal) * 100 : 0} colorScheme="green" borderRadius="md" height="18px" />
            <Text mt={2} fontWeight="bold" color="#48BB78">
              {goal ? `You’ve reached R${suggestions.reduce((acc, s) => acc + (s.estimated_savings || 0), 0).toFixed(2)} of R${goal}` : 'Set a goal to start tracking your savings!'}
            </Text>
          </Box>
        </Box>
        
        {/* Enhanced Daily AI Tip with Notifications & Sharing */}
        {dailyTip && (
          <Box
            mb={5}
            p={4}
            bg="rgba(20, 184, 166, 0.15)"
            borderRadius="md"
            border="1px solid rgba(20, 184, 166, 0.3)"
            color="#E6FFFA"
            animation="fadeIn 0.5s"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="bold" color="#38B2AC">🌞 AI Tip of the Day:</Text>
              <HStack spacing={2}>
                <Button 
                  size="xs" 
                  onClick={notifyTip} 
                  colorScheme="blue" 
                  leftIcon={<BellIcon />}
                  variant="outline"
                >
                  🔔 Remind
                </Button>
                <Button 
                  size="xs" 
                  onClick={copyTip} 
                  colorScheme="green" 
                  leftIcon={<CopyIcon />}
                  variant="outline"
                >
                  📋 Copy
                </Button>
                <Button 
                  size="xs" 
                  onClick={shareTip} 
                  colorScheme="whatsapp" 
                  leftIcon={<ExternalLinkIcon />}
                  variant="outline"
                >
                  📱 Share
                </Button>
                <Button 
                  size="xs" 
                  onClick={refreshTip} 
                  colorScheme="teal" 
                  leftIcon={<RepeatIcon />}
                  variant="outline"
                >
                  Refresh
                </Button>
              </HStack>
            </Flex>
            <Text color="#F7FAFC" mb={2}>{dailyTip.description}</Text>
            <Text fontSize="sm" color="rgba(247, 250, 252, 0.7)">
              Category: {dailyTip.category} | 💸 R{dailyTip.estimated_savings?.toFixed(2) || 'N/A'}
            </Text>
          </Box>
        )}

        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search suggestions..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #2D3748',
              fontSize: '16px',
              background: '#23272F',
              color: '#F7FAFC'
            }}
          />
        </div>

        <div className="categories" style={{ marginBottom: '20px' }}>
          {["All", "Energy Saving", "Maintenance", "Upgrades", "Favorites"].map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => handleCategoryChange(category)}
              style={{
                margin: '0 5px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #38B2AC',
                background: activeCategory === category ? '#38B2AC' : 'transparent',
                color: activeCategory === category ? '#181A20' : '#F7FAFC',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.2s, color 0.2s'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Enhanced Sort Toggle with Icons */}
        <HStack spacing={3} mb={5} justify="center">
          <Button
            leftIcon={<ArrowDownIcon />}
            colorScheme={sortByVotes ? "blue" : "gray"}
            variant={sortByVotes ? "solid" : "outline"}
            onClick={() => setSortByVotes(true)}
            size="sm"
          >
            Most Voted
          </Button>
          <Button
            leftIcon={<TimeIcon />}
            colorScheme={!sortByVotes ? "blue" : "gray"}
            variant={!sortByVotes ? "solid" : "outline"}
            onClick={() => setSortByVotes(false)}
            size="sm"
          >
            Most Recent
          </Button>
        </HStack>

        {/* Priority Filter Buttons */}
        <HStack spacing={2} mb={5} justify="center">
          <Text color="#F7FAFC" fontSize="sm" fontWeight="bold">Filter by Priority:</Text>
          {["high", "medium", "low"].map(level => (
            <Button
              key={level}
              size="sm"
              colorScheme={priorityFilter === level ? 'teal' : 'gray'}
              variant={priorityFilter === level ? 'solid' : 'outline'}
              onClick={() => setPriorityFilter(priorityFilter === level ? null : level)}
            >
              {level.toUpperCase()}
            </Button>
          ))}
          {priorityFilter && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => setPriorityFilter(null)}
            >
              Clear Filter
            </Button>
          )}
        </HStack>

        <div className="suggestions-list">
          {sortedSuggestions.map((suggestion) => (
            <Box 
              key={suggestion.id} 
              className="suggestion-card" 
              style={{ 
                backdropFilter: 'blur(10px)', 
                background: '#23272F', 
                borderRadius: '10px', 
                border: '1px solid #38B2AC', 
                padding: '20px', 
                margin: '10px 0',
                position: 'relative',
                color: '#F7FAFC',  // Fallback color
                boxShadow: '0 2px 8px rgba(20,184,166,0.08)',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer'
              }}
              onMouseEnter={handleView}
              onClick={() => setSelectedSuggestion(suggestion)}
              _hover={{ transform: 'translateY(-2px)' }}
            >
              {/* Favorites Star Icon */}
              <Button
                size="xs"
                variant="ghost"
                colorScheme={favorites.includes(suggestion.id) ? 'yellow' : 'gray'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(suggestion.id);
                }}
                style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}
                aria-label={favorites.includes(suggestion.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(suggestion.id) ? '★' : '☆'}
              </Button>

              {/* Enhanced Priority Badge */}
              <PriorityBadge priority={suggestion.priority} />

              <Heading as="h3" size="md" color={titleColor} mb={2} lineHeight="1.5">
                {suggestion.title}
              </Heading>
              <Text fontSize="md" color={descriptionColor} lineHeight="1.6" mb={4}>
                {suggestion.description}
              </Text>
              
              {/* Enhanced Savings Info with Tooltip */}
              <Box mb={4}>
                <Tooltip 
                  label="Estimated monthly savings if implemented. Learn more at https://www.energy.gov/energysaver/energy-saver-guide-tips-saving-money-and-energy-home"
                  hasArrow 
                  placement="top"
                >
                  <Text 
                    fontWeight="bold" 
                    color={savingsColor}
                    cursor="help"
                    fontSize="sm"
                  >
                    💸 R{suggestion.estimated_savings?.toFixed(2) || 'N/A'}
                  </Text>
                </Tooltip>
              </Box>

              <div className="votes" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tooltip label="Upvote this suggestion" hasArrow placement="top">
                  <Button 
                    size="xs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(suggestion.id, 1);
                    }}
                    colorScheme="green"
                    variant="ghost"
                    p={1}
                    minW="auto"
                  >
                    👍
                  </Button>
                </Tooltip>
                <Tooltip label="Community votes on relevance" hasArrow placement="top">
                  <Text color="#F7FAFC" fontWeight="bold" fontSize="sm">
                    {(suggestion.votes || 0) + (votes[suggestion.id] || 0)}
                  </Text>
                </Tooltip>
                <Tooltip label="Downvote this suggestion" hasArrow placement="top">
                  <Button 
                    size="xs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(suggestion.id, -1);
                    }}
                    colorScheme="red"
                    variant="ghost"
                    p={1}
                    minW="auto"
                  >
                    👎
                  </Button>
                </Tooltip>
              </div>
              {/* User Comments Section */}
              <Box mt={3}>
                <Text fontSize="sm" color="#38B2AC" fontWeight="bold">
                  Comments ({(comments[suggestion.id]?.length || 0)})
                </Text>
                <VStack align="stretch" spacing={2} mt={1} mb={2} maxH="100px" overflowY="auto">
                  {(comments[suggestion.id] || []).map((c, idx) => (
                    <Box key={idx} bg="#20232A" p={2} borderRadius="md" color="#F7FAFC" fontSize="sm">
                      {c}
                    </Box>
                  ))}
                </VStack>
                <HStack>
                  <Textarea
                    size="sm"
                    placeholder="Add a comment..."
                    bg="#181A20"
                    color="#F7FAFC"
                    borderColor="#38B2AC"
                    _placeholder={{ color: 'gray.400' }}
                    value={comments[`draft_${suggestion.id}`] || ''}
                    onChange={e => {
                      setComments(prev => ({ ...prev, [`draft_${suggestion.id}`]: e.target.value }));
                    }}
                    minH="32px"
                    maxH="60px"
                    resize="vertical"
                  />
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={e => {
                      e.stopPropagation();
                      const val = comments[`draft_${suggestion.id}`]?.trim();
                      if (val) {
                        handleComment(suggestion.id, val);
                        setComments(prev => ({ ...prev, [`draft_${suggestion.id}`]: '' }));
                      }
                    }}
                    isDisabled={!(comments[`draft_${suggestion.id}`]?.trim())}
                  >
                    Post
                  </Button>
                </HStack>
              </Box>
              {/* User Notes Section */}
              <Box mt={2}>
                <Text fontSize="sm" color="#38B2AC" fontWeight="bold">Personal Note</Text>
                <Textarea
                  size="sm"
                  placeholder="Your note... (only you can see this)"
                  bg="#181A20"
                  color="#F7FAFC"
                  borderColor="#38B2AC"
                  _placeholder={{ color: 'gray.400' }}
                  value={userNotes[suggestion.id] || ''}
                  onChange={e => handleNoteChange(suggestion.id, e.target.value)}
                  minH="32px"
                  maxH="60px"
                  resize="vertical"
                  mt={1}
                />
              </Box>
            </Box>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <Box mt={10}>
          <Heading size="md" color="#F7FAFC" textAlign="center" mb={5}>Savings Breakdown</Heading>
          <Box 
            bg="#23272F" 
            borderRadius="10px" 
            p={5}
            mb={5}
            border="1px solid #38B2AC"
          >
            <SavingsChart data={suggestions} onBarClick={setSelectedSuggestion} />
          </Box>
        </Box>

        <Box mt={10}>
          <Heading size="md" color="#F7FAFC" textAlign="center" mb={5}>Suggestion Trend</Heading>
          <HStack justify="center" mb={3}>
            <Text color="#F7FAFC" fontSize="sm">Time Range:</Text>
            <Select 
              value={trendDays} 
              onChange={e => setTrendDays(Number(e.target.value))}
              size="sm"
              w="150px"
              bg="#23272F"
              color="#F7FAFC"
              borderColor="#38B2AC"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </Select>
          </HStack>
          <Box 
            bg="#23272F" 
            borderRadius="10px" 
            p={5}
            border="1px solid #38B2AC"
          >
            <SuggestionTrendChart data={suggestions} days={trendDays} />
          </Box>
        </Box>

        {/* Enhanced User Feedback with Comment */}
        {showFeedback && (
          <Alert status="info" borderRadius="md" mt={5} bg="#23272F" border="1px solid #38A169">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold" color="#F7FAFC" mb={3}>Are these AI suggestions helping you?</Text>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Button 
                    colorScheme="green" 
                    size="sm"
                    onClick={() => handleFeedback("yes")}
                    leftIcon={<span>👍</span>}
                  >
                    Yes
                  </Button>
                  <Button 
                    colorScheme="red" 
                    size="sm"
                    onClick={() => handleFeedback("no")}
                    leftIcon={<span>👎</span>}
                  >
                    No
                  </Button>
                </HStack>
                <Textarea
                  placeholder="Tell us more about your experience (optional)..."
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  size="sm"
                  bg="#1A202C"
                  color="#F7FAFC"
                  borderColor="#38A169"
                  _placeholder={{ color: 'gray.400' }}
                  resize="vertical"
                  minH="80px"
                />
                <Button 
                  colorScheme="blue" 
                  size="sm"
                  onClick={() => handleFeedback("with_comment")}
                  isDisabled={!feedbackComment.trim()}
                >
                  Submit Feedback
                </Button>
              </VStack>
            </Box>
          </Alert>
        )}

        {/* Suggestion Detail Modal */}
        <Modal isOpen={!!selectedSuggestion} onClose={() => setSelectedSuggestion(null)}>
          <ModalOverlay />
          <ModalContent bg="#23272F" color="#F7FAFC" border="1px solid #38B2AC">
            <ModalHeader color="#38B2AC">
              {selectedSuggestion?.title}
            </ModalHeader>
            <ModalCloseButton color="#F7FAFC" />
            <ModalBody>
              <VStack align="start" spacing={4}>
                <Text color="#CBD5E0">{selectedSuggestion?.description}</Text>
                <Box>
                  <Text fontWeight="bold" color="#48BB78">
                    💸 Estimated Savings: R{selectedSuggestion?.estimated_savings?.toFixed(2) || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="#F7FAFC">
                    Priority: <Badge colorScheme={getPriorityProps(selectedSuggestion?.priority).color}>
                      {selectedSuggestion?.priority?.toUpperCase()}
                    </Badge>
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="#F7FAFC">
                    Category: {selectedSuggestion?.category}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="#F7FAFC">
                    Votes: {(selectedSuggestion?.votes || 0) + (votes[selectedSuggestion?.id] || 0)}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="#F7FAFC">
                    Created: {selectedSuggestion?.created_at ? new Date(selectedSuggestion.created_at).toLocaleDateString() : 'N/A'}
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => setSelectedSuggestion(null)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </>
  );
};

export default AISuggestions;