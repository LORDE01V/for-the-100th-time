import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Heading,
  useToast,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaPaperPlane, FaTimes, FaCommentDots, FaMicrophone } from 'react-icons/fa';
import RecordRTC from 'recordrtc';
import langaImage from '../assets/images/langa.png';

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Langa. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // For recording with RecordRTC
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const toast = useToast();

  const bgColor = useColorModeValue('gray.100', 'gray.700');  // For bot messages
  const userBgColor = useColorModeValue('blue.100', 'blue.800');  // For user messages
  const textColor = useColorModeValue('black', 'white');  // For text color

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    setMessages(prev => [...prev, { text: textToSend, sender: 'user' }]);
    setInputMessage('');
    setIsLoading(true);
    setTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        text: data.response,
        sender: 'bot'
      }]);

      setTyping(false);  // Set typing to false immediately after adding the response
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble connecting. Please try again.",
        sender: 'bot'
      }]);
      toast({
        title: 'Error',
        description: 'Failed to get response from server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice recording button
  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Start WAV recording using RecordRTC
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000
      });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Stop recording and send to backend
  const stopRecording = () => {
    if (!recorder) return;
    recorder.stopRecording(async () => {
      setIsRecording(false);
      const audioBlob = recorder.getBlob();

      // Optional: verify blob size/type
      console.log('Recorded blob size:', audioBlob.size);

      // Send to the backend
      const formData = new FormData();
      formData.append('audio', audioBlob, 'my_recording.wav');

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/voice-to-text', {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          throw new Error('Voice processing failed');
        }

        const data = await response.json();
        if (data.text) {
          await handleSendMessage(data.text);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to process voice message',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }

      // Cleanup
      recorder.reset();
      recorder.destroy();
      setRecorder(null);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box 
      position="fixed" 
      bottom="20px" 
      right="20px" 
      zIndex="9999"
    >
      {!isOpen ? (
        <IconButton
          aria-label="Chat with Langa"
          icon={<FaCommentDots />}
          size="lg"
          colorScheme="teal"
          isRound
          boxShadow="lg"
          onClick={() => setIsOpen(true)}
        />
      ) : (
        <Box
          width="350px"
          height="500px"
          bg="white"
          borderRadius="lg"
          boxShadow="2xl"
          display="flex"
          flexDirection="column"
        >
          <Flex
            bg="teal.500"
            color="white"
            p={3}
            borderTopRadius="lg"
            justify="space-between"
            align="center"
          >
            <Heading size="md">Langa</Heading>
            <IconButton
              icon={<FaTimes />}
              variant="ghost"
              color="white"
              onClick={() => setIsOpen(false)}
              size="sm"
              _hover={{ bg: 'teal.600' }}
            />
          </Flex>

          <VStack
            flex="1"
            spacing={4}
            p={4}
            overflowY="auto"
            bg="gray.50"
            align="stretch"
          >
            {messages.map((message) => (
              <Flex key={message.id} justify={message.sender === 'bot' ? 'flex-start' : 'flex-end'} align="center">
                {message.sender === 'bot' && <Avatar name="SolarBot" src={langaImage} size="sm" mr={2} />}
                <Box bg={message.sender === 'bot' ? bgColor : userBgColor} color={textColor} p={3} borderRadius="md">
                  {message.text}
                </Box>
                {message.sender === 'user' && <Avatar name="You" bg="blue.500" size="sm" ml={2} />}
              </Flex>
            ))}
            {typing && <Text fontStyle="italic" color="gray.500">Bot is typing...</Text>}
          </VStack>

          <HStack p={4} bg="white" borderTop="1px" borderColor="gray.200" spacing={3}>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              size="md"
              bg="white"
              color="black"
              borderColor="gray.300"
              _hover={{ borderColor: 'teal.500' }}
              _focus={{ 
                borderColor: 'teal.500', 
                boxShadow: 'none',
                color: 'black'
              }}
              _placeholder={{ color: 'gray.500' }}
              disabled={isLoading || isRecording}
              style={{ caretColor: 'black' }}
            />
            <IconButton
              colorScheme={isRecording ? 'red' : 'teal'}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              icon={<FaMicrophone />}
              onClick={handleVoiceRecording}
              isLoading={isLoading}
              disabled={isLoading}
            />
            <IconButton
              colorScheme="teal"
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={() => handleSendMessage()}
              isLoading={isLoading}
              disabled={isLoading || !inputMessage.trim() || isRecording}
            />
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default SupportBot;