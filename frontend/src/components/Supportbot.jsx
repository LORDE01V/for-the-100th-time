import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  IconButton,
  Input,
  Heading,
  Text,
  useToast,
  Avatar,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { FaPaperPlane, FaTimes, FaCommentDots, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
// Replaced local image import with a placeholder URL
// If you have a specific image, you'll need to host it or use a base64 string (not recommended for large images)
const langaImage = "https://placehold.co/150x150/008080/ffffff?text=Langa";

// Add SpeechRecognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

let selectedVoice = null;

function pickSiriLikeVoice() {
  const voices = window.speechSynthesis.getVoices();
  // Prefer 'Samantha', 'Alex', or any en-US Siri-like voice
  let siriVoice = voices.find(v => v.lang && v.lang.includes('en-US') && (v.name === 'Samantha' || v.name === 'Alex'));
  if (!siriVoice) {
    siriVoice = voices.find(v => v.lang && v.lang.includes('en-US'));
  }
  if (!siriVoice) {
    siriVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
  }
  return siriVoice || null;
}

// Set up voice selection on load and on voiceschanged
function useSiriLikeVoice() {
  useEffect(() => {
    function setVoice() {
      selectedVoice = pickSiriLikeVoice();
    }
    setVoice();
    window.speechSynthesis.onvoiceschanged = setVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);
}

const langaGreeting = "Hi! I'm Langa. How can I help you today?";

const SupportBot = () => {
  console.log('SupportBot component is mounting');

  const [isOpen, setIsOpen] = useState(false); // Must be false
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false); // State for "Bot is typing..."
  const [hasSpokenLangaGreeting, setHasSpokenLangaGreeting] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Mute/unmute state

  // --- Langa Voice Logic ---
  const [isSpeaking, setIsSpeaking] = useState(false); // For animation

  // State for voice-to-text
  const [isListening, setIsListening] = useState(false);
  const recognitionActiveRef = useRef(false);

  useSiriLikeVoice();

  // Voice reply function for Langa
  const speakReply = useCallback((text) => {
    if (isMuted) return;
    if (!window.speechSynthesis) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice?.lang || 'en-US';
    utterance.voice = selectedVoice || null;
    utterance.pitch = 1.1;
    utterance.rate = 0.95;
    window.speechSynthesis.cancel(); // Always cancel any ongoing speech
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Langa greeting ONLY when chatbot is opened for the first time per session (not on app load)
  useEffect(() => {
    if (isOpen && !hasSpokenLangaGreeting && !isMuted) {
      window.speechSynthesis.cancel();
      speakReply(langaGreeting);
      setHasSpokenLangaGreeting(true);
    }
    if (isOpen && isMuted) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen, hasSpokenLangaGreeting, isMuted, speakReply]);

  // Call speakReply whenever a new bot message is added (and not muted)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'bot' && lastMsg.text && !lastMsg.typing && !lastMsg.thinking && !isMuted) {
      speakReply(lastMsg.text);
    }
    // eslint-disable-next-line
  }, [messages, isMuted, speakReply]);

  const toast = useToast();
  const messagesEndRef = useRef(null); // Ref to scroll to the latest message

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const userBgColor = useColorModeValue('blue.100', 'blue.800');
  const textColor = useColorModeValue('black', 'white');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Scroll to the latest message whenever messages state updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Add user message immediately
    setMessages(prev => [...prev, { text: textToSend, sender: 'user' }]);
    setInputMessage(''); // Clear input
    setIsLoading(true); // Disable input/send button
    setTyping(true); // Show "Bot is typing..."

    // Show '🤔 Thinking...' immediately
    setMessages(prev => [...prev, { text: '🤔 Thinking...', sender: 'bot', thinking: true }]);

    // Simulate typing effect
    await new Promise(res => setTimeout(res, 800)); // Short delay before typing

    // Replace '🤔 Thinking...' with animated typing dots
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.findIndex(m => m.thinking);
      if (lastIdx !== -1) {
        updated[lastIdx] = { ...updated[lastIdx], text: 'Langa is typing', typing: true };
      }
      return updated;
    });

    // Animate typing effect (3 dots)
    let dotCount = 0;
    const typingInterval = setInterval(() => {
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.findIndex(m => m.typing);
        if (lastIdx !== -1) {
          updated[lastIdx] = { ...updated[lastIdx], text: `Langa is typing${'.'.repeat(dotCount % 4)}` };
        }
        return updated;
      });
      dotCount++;
    }, 400);

    let data;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      data = await response.json();
    } catch (error) {
      console.error('Error:', error);
      data = { response: "I apologize, but I'm having trouble connecting. Please try again." };
      toast({
        title: 'Error',
        description: 'Failed to get response from server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearInterval(typingInterval);
      setIsLoading(false);
      setTyping(false);
    }

    const botReply = data.reply || data.response || "Sorry, I didn't get a reply.";
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.findIndex(m => m.typing || m.thinking);
      if (lastIdx !== -1) {
        updated[lastIdx] = { text: botReply, sender: 'bot' };
      } else {
        updated.push({ text: botReply, sender: 'bot' });
      }
      return updated;
    });
  };

  // Voice-to-text mic logic
  const handleMicClick = () => {
    if (!recognition) {
      setMessages(prev => [...prev, { text: "Sorry, your browser doesn't support voice-to-text.", sender: 'bot' }]);
      return;
    }
    if (isListening || recognitionActiveRef.current) {
      recognition.stop();
      setIsListening(false);
      recognitionActiveRef.current = false;
      return;
    }
    // Only start if not already listening
    try {
      recognition.start();
      setIsListening(true);
      recognitionActiveRef.current = true;
    } catch (e) {
      // If already started, just ignore
      setIsListening(true);
      recognitionActiveRef.current = true;
    }
    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setInputMessage('');
      setIsListening(false);
      recognitionActiveRef.current = false;
      handleSendMessage(speech);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionActiveRef.current = false;
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process your voice message. Try again or type your message.", sender: 'bot' }]);
      setIsListening(false);
      recognitionActiveRef.current = false;
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Bubble (always visible, but hidden when chat is open) */}
      {!isOpen && (
        <Box
          position="fixed"
          bottom="24px"
          right="24px"
          zIndex="9999"
        >
          <IconButton
            aria-label="Chat with Langa"
            icon={<FaCommentDots />}
            boxSize="56px" // Explicitly set box size to match ThemeToggleButton
            fontSize="2xl" // Explicitly set font size to match ThemeToggleButton
            colorScheme="teal"
            isRound
            boxShadow="lg"
            onClick={() => {
              setIsOpen(true);
              setHasSpokenLangaGreeting(false); // Reset greeting for new session
              setMessages([{ text: "Hi! I'm Langa. How can I help you today?", sender: 'bot' }]);
            }}
          />
        </Box>
      )}

      {/* Chatbot Card (only visible when open) */}
      {isOpen && (
        <Box
          position="fixed"
          bottom="24px"
          right="24px"
          zIndex="9999"
          width={["95vw", "350px"]}
          maxWidth="100vw"
          height="520px"
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Flex
            align={"center"}
            justify={"space-between"}
            bgGradient={"linear(to-r, teal.500, teal.400)"}
            color={"white"}
            p={4}
            boxShadow={"md"}
          >
            <HStack>
              <Avatar size="md" border="2px solid white" src={langaImage} className={isSpeaking ? 'bot-speaking' : ''} />
              <Heading size="md" fontWeight="bold" letterSpacing="wide">
                Langa
              </Heading>
            </HStack>
            <HStack>
              <IconButton
                icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                variant="ghost"
                color="white"
                onClick={() => {
                  setIsMuted(m => {
                    if (!m) window.speechSynthesis.cancel();
                    return !m;
                  });
                }}
                size="sm"
                aria-label={isMuted ? 'Unmute Langa' : 'Mute Langa'}
                _hover={{ bg: "teal.600" }}
                title={isMuted ? 'Unmute voice replies' : 'Mute voice replies'}
              />
              <IconButton
                icon={<FaTimes />}
                variant="ghost"
                color="white"
                onClick={() => setIsOpen(false)}
                size="sm"
                _hover={{ bg: "teal.600" }}
              />
            </HStack>
          </Flex>

          {/* Messages */}
          <VStack
            flex={1}
            spacing={3}
            px={3}
            py={2}
            overflowY="auto"
            align="stretch"
            bg="gray.50"
            sx={{
              "&::-webkit-scrollbar": {
                width: "6px",
                background: "#e0e0e0",
                borderRadius: "8px"
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#b2b2b2",
                borderRadius: "8px"
              }
            }}
          >
            {messages.map((message, idx) => (
              <Flex key={idx} justify={message.sender === 'bot' ? 'flex-start' : 'flex-end'} align="center">
                {message.sender === 'bot' && <Avatar name="SolarBot" src={langaImage} size="sm" mr={2} />}
                <Box bg={message.sender === 'bot' ? bgColor : userBgColor} color={textColor} p={3} borderRadius="md">
                  {message.text}
                </Box>
                {message.sender === 'user' && <Avatar name="You" bg="blue.500" size="sm" ml={2} />}
              </Flex>
            ))}
            {/* Thinking state display */}
            {typing && (
              <Flex justify="flex-start" align="center">
                <Avatar name="SolarBot" src={langaImage} size="sm" mr={2} />
                <Text fontStyle="italic" color="gray.500">Langa is typing...</Text>
              </Flex>
            )}
            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
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
