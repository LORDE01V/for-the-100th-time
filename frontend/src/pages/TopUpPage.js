import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, topUp, autoTopUp } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';
import {
    Box,
    Flex,
    Heading,
    Text,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    useToast,
    useColorModeValue,
    Spinner,
    HStack,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Select
} from '@chakra-ui/react';

function TopUpPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [currentBalance, setCurrentBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [voucherCode, setVoucherCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false);
    const [minBalance, setMinBalance] = useState('');
    const [autoTopUpAmount, setAutoTopUpAmount] = useState('');
    const [autoTopUpFrequency, setAutoTopUpFrequency] = useState('weekly');

    const [transactionType, setTransactionType] = useState('topup');

    const user = auth.getCurrentUser();

    const bgColor = useColorModeValue('gray.50', 'gray.800');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const headingColor = useColorModeValue('gray.800', 'white');
    const buttonColorScheme = useColorModeValue('green', 'teal');
    const spinnerColor = useColorModeValue('blue.500', 'blue.300');

    const glassmorphismBoxStyles = {
        bg: useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.15)'),
        backdropFilter: 'blur(10px)',
        boxShadow: useColorModeValue('lg', 'dark-lg'),
        borderRadius: 'lg',
    };

    const [autoTopUpSettings, setAutoTopUpSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const fetchAutoTopUpSettings = useCallback(async () => {
        try {
            setIsLoadingSettings(true);
            const response = await autoTopUp.getSettings();
            if (response.success) {
                setAutoTopUpSettings(response.settings);
                setIsAutoTopUpEnabled(response.settings?.is_enabled || false);
                if (response.settings) {
                    setMinBalance(response.settings.min_balance?.toString() || '');
                    setAutoTopUpAmount(response.settings.top_up_amount?.toString() || '');
                    setAutoTopUpFrequency(response.settings.frequency || 'weekly');
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch auto top-up settings',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoadingSettings(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAutoTopUpSettings();
    }, [fetchAutoTopUpSettings]);

    const handleAutoTopUpSave = async () => {
        if (!minBalance || !autoTopUpAmount) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all required fields for Auto Top-Up.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsProcessing(true);

        try {
            const response = await autoTopUp.saveSettings({
                minBalance: parseFloat(minBalance),
                autoTopUpAmount: parseFloat(autoTopUpAmount),
                autoTopUpFrequency
            });

            if (response.success) {
                setAutoTopUpSettings(response.settings);
                setIsAutoTopUpEnabled(true);
                onClose();
                toast({
                    title: 'Auto Top-Up Enabled',
                    description: `Your account will be topped up with R${autoTopUpAmount} when balance falls below R${minBalance}.`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to save auto top-up settings',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTopUp = async (e) => {
        e.preventDefault();

        const topUpAmount = parseFloat(amount);
        if (isNaN(topUpAmount) || topUpAmount <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid positive amount.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsProcessing(true);

        try {
            const payload = {
                amount: topUpAmount,
                type: transactionType,
                promoCode,
                voucherCode,
            };

            const topUpResult = await topUp.process(payload);

            if (topUpResult && typeof topUpResult.new_balance !== 'undefined') {
                setCurrentBalance(topUpResult.new_balance);
            } else {
                throw new Error('Invalid balance received from server');
            }

            setAmount('');
            setPromoCode('');
            setVoucherCode('');

            toast({
                title: `${transactionType === 'topup' ? 'Top-Up' : 'Recharge'} Successful!`,
                description: `Your new balance is R${topUpResult.new_balance.toFixed(2)}.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to process top-up.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsProcessing(false);
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
                maxW="md"
                w="full"
                {...glassmorphismBoxStyles}
                boxShadow="md"
                borderRadius="lg"
                p={6}
                textAlign="center"
                position="relative"
                zIndex={2}
            >
                <HStack justify="space-between" w="full" mb={8} align="center">
                    <Button
                        leftIcon={<FaArrowLeft />}
                        variant="ghost"
                        onClick={() => navigate('/home')}
                        color={headingColor}
                    >
                        Back to Home
                    </Button>
                </HStack>

                <Heading as="h2" size="xl" mb={6} color={headingColor} textAlign="center">
                    Top-Up / Recharge
                </Heading>

                <Box mb={6}>
                    <Text fontSize="md" color={textColor}>Current Energy Credit Balance:</Text>
                    <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                        R{currentBalance.toFixed(2)}
                    </Text>
                </Box>

                <VStack as="form" spacing={4} onSubmit={handleTopUp} noValidate>
                    <FormControl>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                            <option value="topup">Top-Up</option>
                            <option value="recharge">Recharge</option>
                        </Select>
                    </FormControl>

                    <FormControl id="top-up-amount">
                        <FormLabel>Amount (ZAR)</FormLabel>
                        <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" min="0" />
                    </FormControl>

                    <FormControl id="promo-code">
                        <FormLabel>Promo Code (Optional)</FormLabel>
                        <Input type="text" placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    </FormControl>

                    <FormControl id="voucher-code">
                        <FormLabel>Voucher Code (Optional)</FormLabel>
                        <Input
                            type="text"
                            placeholder="Enter voucher code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme={buttonColorScheme}
                        size="lg"
                        fontSize="md"
                        isLoading={isProcessing}
                        loadingText="Processing..."
                        w="full"
                        mt={4}
                    >
                        {transactionType === 'topup' ? 'Top-Up Now' : 'Recharge Now'}
                    </Button>
                </VStack>

                <Divider my={6} />

                <Box>
                    <Heading as="h3" size="md" mb={4} color={headingColor}>
                        Auto Top-Up Settings
                    </Heading>

                    {isLoadingSettings ? (
                        <Flex justify="center" align="center" p={4}>
                            <Spinner size="sm" mr={2} />
                            <Text>Loading settings...</Text>
                        </Flex>
                    ) : isAutoTopUpEnabled ? (
                        <Alert status="success" mb={4}>
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Auto Top-Up is Active</AlertTitle>
                                <AlertDescription>
                                    Your account will be topped up with R{autoTopUpSettings?.top_up_amount} when balance falls below R{autoTopUpSettings?.min_balance}.
                                </AlertDescription>
                            </Box>
                        </Alert>
                    ) : (
                        <Text color={textColor} mb={4}>
                            Enable automatic top-ups to ensure you never run out of credit.
                        </Text>
                    )}

                    <Button
                        colorScheme={isAutoTopUpEnabled ? "red" : "green"}
                        variant="outline"
                        w="full"
                        onClick={onOpen}
                        isLoading={isProcessing}
                    >
                        {isAutoTopUpEnabled ? "Modify Auto Top-Up" : "Set Up Auto Top-Up"}
                    </Button>
                </Box>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Auto Top-Up Settings</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Minimum Balance (R)</FormLabel>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 100"
                                        value={minBalance}
                                        onChange={(e) => setMinBalance(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Auto Top-Up Amount (R)</FormLabel>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 200"
                                        value={autoTopUpAmount}
                                        onChange={(e) => setAutoTopUpAmount(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Frequency</FormLabel>
                                    <Select
                                        value={autoTopUpFrequency}
                                        onChange={(e) => setAutoTopUpFrequency(e.target.value)}
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                    </Select>
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={handleAutoTopUpSave}
                                isLoading={isProcessing}
                            >
                                Save Settings
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Flex>
    );
}

export default TopUpPage;