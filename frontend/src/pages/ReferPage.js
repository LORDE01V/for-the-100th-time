import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  SimpleGrid,
  Badge,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { FaCopy, FaWhatsapp, FaFacebook, FaEnvelope, FaUserPlus, FaGift, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ReferPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Mock user data - in real app, this would come from your auth context/state
  const userId = "USER123";
  const referralLink = `https://app.com/register?ref=${userId}`;

  // Mock referral history
  const referralHistory = useMemo(() => [
    {
      id: 1,
      name: "Thabo Mkhize",
      date: "2025-03-15",
      status: "completed",
      reward: "50 energy units"
    },
    {
      id: 2,
      name: "Nomsa Dlamini",
      date: "2025-03-10",
      status: "pending",
      reward: "25 energy units"
    },
    {
      id: 3,
      name: "Sipho Nkosi",
      date: "2025-03-05",
      status: "completed",
      reward: "50 energy units"
    }
  ], []);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Your referral link has been copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    let shareUrl = '';
    const shareText = "Join me on this amazing energy platform! Use my referral link: ";

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + referralLink)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join me on Energy Platform&body=${encodeURIComponent(shareText + referralLink)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

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
      <Container maxW="container.lg" py={8} position="relative" zIndex={2}>
        <VStack spacing={8} align="stretch">
          {/* Back Button */}
          <Box>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/home')}
            >
              Back to Home
            </Button>
          </Box>

          {/* Header Section */}
          <Box textAlign="center">
            <Heading size="xl" mb={2} color={headingColor}>
              Refer & Earn
            </Heading>
            <Text color={textColor}>
              Share your referral link and earn rewards for each friend who joins!
            </Text>
          </Box>

          {/* Referral Link Section */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Your Referral Link</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <InputGroup size="lg">
                  <Input
                    value={referralLink}
                    readOnly
                    pr="4.5rem"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={handleCopyLink}
                      leftIcon={<Icon as={FaCopy} />}
                      colorScheme={copied ? "green" : "blue"}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </InputRightElement>
                </InputGroup>

                <HStack spacing={4}>
                  <Button
                    leftIcon={<Icon as={FaWhatsapp} />}
                    colorScheme="green"
                    onClick={() => handleShare('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    leftIcon={<Icon as={FaFacebook} />}
                    colorScheme="facebook"
                    onClick={() => handleShare('facebook')}
                  >
                    Facebook
                  </Button>
                  <Button
                    leftIcon={<Icon as={FaEnvelope} />}
                    colorScheme="gray"
                    onClick={() => handleShare('email')}
                  >
                    Email
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Rewards Section */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Your Rewards</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
                  <HStack spacing={4}>
                    <Icon as={FaUserPlus} w={6} h={6} color="blue.500" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Total Referrals</Text>
                      <Text fontSize="2xl">3</Text>
                    </VStack>
                  </HStack>
                </Box>
                <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
                  <HStack spacing={4}>
                    <Icon as={FaGift} w={6} h={6} color="green.500" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Total Rewards</Text>
                      <Text fontSize="2xl">125 units</Text>
                    </VStack>
                  </HStack>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Referral History Section */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Referral History</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {referralHistory.map((referral) => (
                  <Box
                    key={referral.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{referral.name}</Text>
                        <Text color={textColor}>{referral.date}</Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Badge
                          colorScheme={referral.status === 'completed' ? 'green' : 'yellow'}
                        >
                          {referral.status}
                        </Badge>
                        <Text color={textColor}>{referral.reward}</Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export default ReferPage;
