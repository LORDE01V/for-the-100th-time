import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  IconButton,
  Input,
  Heading,
  useToast,
  Avatar,
  useColorModeValue,
  Button,
  Link,
} from '@chakra-ui/react';
import { FaPaperPlane, FaTimes, FaCommentDots, FaVolumeMute, FaVolumeUp, FaExternalLinkAlt } from 'react-icons/fa';
// Replaced local image import with a placeholder URL
// If you have a specific image, you'll need to host it or use a base64 string (not recommended for large images)
const langaImage = "https://placehold.co/150x150/008080/ffffff?text=Langa";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

let selectedVoice = null;

function pickSiriLikeVoice() {
  const voices = window.speechSynthesis.getVoices();
  let siriVoice = voices.find(v => v.lang && v.lang.includes('en-US') && (v.name === 'Samantha' || v.name === 'Alex'));
  if (!siriVoice) siriVoice = voices.find(v => v.lang && v.lang.includes('en-US'));
  if (!siriVoice) siriVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
  return siriVoice || null;
}

function useSiriLikeVoice() {
  useEffect(() => {
    function setVoice() {
      selectedVoice = pickSiriLikeVoice();
    }
    setVoice();
    window.speechSynthesis.onvoiceschanged = setVoice;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);
}

const langaGreeting = "Hi! I'm Langa. How can I help you today?";

// SearchingAnimation component
const SearchingAnimation = ({ location }) => (
  <Box textAlign="center" p={4}>
    <Box fontSize="lg" fontWeight="bold" mb={2}>
      🔍 Searching for information about {location}...
    </Box>
    <Box fontSize="sm" color="gray.600">
      This may take a few moments...
    </Box>
  </Box>
);

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Mute/unmute state

  // --- Langa Voice Logic ---
  const [isSpeaking, setIsSpeaking] = useState(false); // For animation

  // State for voice-to-text
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [notificationPrompt, setNotificationPrompt] = useState({ show: false, location: '' });

  const toast = useToast();
  const messagesEndRef = useRef(null);
  // Removed unused useNotifications hook

  useSiriLikeVoice();

  const speakReply = useCallback((text) => {
    if (isMuted || !text || typeof text !== 'string') return;
    const cleanText = text.replace(/(https?:\/\/[^\s]+)/g, '').replace(/Would you like me to set up push notifications for future alerts in .*?/g, '');
    if (!cleanText.trim()) return;
    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.pitch = 1.1;
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleSendMessage = async (text, options = {}) => {
    const textToSend = text || inputMessage.trim();
    if (!textToSend || isLoading) return;

    setNotificationPrompt({ show: false, location: '' });

    const newUserMessage = { id: Date.now(), text: textToSend, sender: 'user' };
    const currentMessages = [...messages, newUserMessage];
    
    if (!options.isFollowUp) {
      setMessages(currentMessages);
      setInputMessage('');
    }
    
    setIsLoading(true);

    // Prepare history for the backend (last 4 messages)
    const history = messages.slice(-4).map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
    }));

    try {
        const response = await fetch(`${API_BASE_URL}/api/ai-agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: textToSend, 
                history: history,
                force_search: options.forceSearch || false 
            }),
        });
        if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
        const responseData = await response.json();

        if (responseData.status === 'LOCATION_NEEDED') {
            setMessages(prev => [...prev, { id: Date.now(), text: responseData.response, sender: 'bot' }]);
        } else if (responseData.status === 'SEARCH_REQUIRED') {
            setIsSearching(true);
            setSearchLocation(responseData.location);
            await new Promise(resolve => setTimeout(resolve, 2500));
            await handleSendMessage(responseData.prompt, { isFollowUp: true, forceSearch: true });
        } else {
            const newBotMessage = {
                id: Date.now(),
                text: responseData.response,
                sender: 'bot',
                source: responseData.source_url,
            };
            
            // Debug logging
            console.log("DEBUG: Bot message data:", {
                response: responseData.response,
                source_url: responseData.source_url,
                location: responseData.location
            });
            if (responseData.response && responseData.location && (
                responseData.response.toLowerCase().includes("notifications") || 
                responseData.response.toLowerCase().includes("alerts")
            )) {
                setNotificationPrompt({ show: true, location: responseData.location });
            }
            
            setMessages(prev => [...prev, newBotMessage]);
            if (!isMuted) speakReply(responseData.response);
        }
    } catch (error) {
        const errorMsg = "I'm having trouble connecting. Please try again.";
        setMessages(prev => [...prev, { id: Date.now(), text: errorMsg, sender: 'bot' }]);
        toast({ title: 'Connection Error', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification response
  const handleNotificationResponse = (accepted) => {
    setNotificationPrompt({ show: false, location: '' });
    if (accepted) {
      toast({
        title: 'Notifications Enabled',
        description: 'Daily alerts will be sent for this location',
        status: 'success',
        isClosable: true,
      });
    }
  };

  // Voice-to-text mic logic
  const handleMicClick = () => {
    if (!recognition) return toast({ title: "Voice recognition not supported", status: "error" });
    if (isListening) return recognition.stop();
    recognition.start();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => handleSendMessage(e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => toast({ title: "Voice Recognition Error", status: "error" });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleOpenChat = () => {
      setIsOpen(true);
      if (messages.length === 0) {
          setMessages([{ id: Date.now(), text: langaGreeting, sender: 'bot' }]);
          if (!isMuted) setTimeout(() => speakReply(langaGreeting), 300);
      }
  };

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const userBgColor = useColorModeValue('blue.100', 'blue.800');
  const textColor = useColorModeValue('black', 'white');

  return (
    <>
      {!isOpen && (
        <Box position="fixed" bottom="24px" right="24px" zIndex="9999">
          <IconButton icon={<FaCommentDots />} boxSize="56px" fontSize="2xl" colorScheme="teal" isRound boxShadow="lg" onClick={handleOpenChat} />
        </Box>
      )}

      {isOpen && (
        <Box position="fixed" bottom="24px" right="24px" zIndex="9999" width={["95vw", "350px"]} maxWidth="100vw" height="520px" bg="white" borderRadius="2xl" boxShadow="2xl" overflow="hidden" display="flex" flexDirection="column">
          <Flex align="center" justify="space-between" bgGradient="linear(to-r, teal.500, teal.400)" color="white" p={4} boxShadow="md">
            <HStack>
              <Avatar size="md" border="2px solid white" name="Langa" src={langaImage} className={isSpeaking ? 'bot-speaking' : ''} />
              <Heading size="md" fontWeight="bold">Langa</Heading>
            </HStack>
            <HStack>
              <IconButton icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />} variant="ghost" color="white" onClick={() => setIsMuted(m => !m)} size="sm" _hover={{ bg: "teal.600" }} />
              <IconButton icon={<FaTimes />} variant="ghost" color="white" onClick={() => setIsOpen(false)} size="sm" _hover={{ bg: "teal.600" }} />
            </HStack>
          </Flex>

          <VStack flex={1} spacing={3} px={3} py={2} overflowY="auto" align="stretch" bg="gray.50" sx={{ "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-thumb": { background: "#b2b2b2", borderRadius: "8px" } }}>
            {isSearching ? <SearchingAnimation location={searchLocation} /> : messages.map((message) => (
                <Flex key={message.id} direction="column" align={message.sender === 'bot' ? 'flex-start' : 'flex-end'}>
                    <Flex justify={message.sender === 'bot' ? 'flex-start' : 'flex-end'} align="center" w="100%">
                        {message.sender === 'bot' && <Avatar name="Langa" src={langaImage} size="sm" mr={2} />}
                        <Box bg={message.sender === 'bot' ? bgColor : userBgColor} color={textColor} p={3} borderRadius="md" whiteSpace="pre-wrap">
                            {message.text}
                        </Box>
                        {message.sender === 'user' && <Avatar name="You" bg="blue.500" size="sm" ml={2} />}
                    </Flex>
                    {message.source && (
                        <Link href={message.source} isExternal color="gray.500" fontSize="xs" mt={1} ml="44px">
                            Source <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
                        </Link>
                    )}
                </Flex>
            ))}
            
            {notificationPrompt.show && (
              <HStack justify="center" p={2}>
                <Button size="sm" colorScheme="green" onClick={() => handleNotificationResponse(true)}>Yes, Set Up Daily Alerts</Button>
                <Button size="sm" variant="outline" onClick={() => handleNotificationResponse(false)}>No Thanks</Button>
              </HStack>
            )}

            <div ref={messagesEndRef} />
          </VStack>

          {/* Input */}
          <Flex
            p={3}
            bg="gray.100"
            borderTop="1px solid"
            borderColor="gray.200"
            align="center"
          >
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              size="md"
              bg="white"
              borderRadius="full"
              mr={2}
              _focus={{ borderColor: "teal.400" }}
              disabled={isLoading || isListening} /* Disable during loading/recording */
            />
            <Button
              onClick={handleMicClick}
              colorScheme={isListening ? "red" : "teal"}
              borderRadius="full"
              mr={2}
            >
              {isListening ? '🎤 Listening… Tap to Stop' : '🎙️ Speak'}
            </Button>
            <IconButton
              colorScheme="teal"
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={() => handleSendMessage()}
              isLoading={isLoading}
              disabled={isLoading || !inputMessage.trim() || isListening} /* Disable during loading/recording or if no text */
              borderRadius="full"
            />
          </Flex>
        </Box>
      )}
    </>
  );
};

export default SupportBot;
