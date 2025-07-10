import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import axios from "axios";

const PersonalUserPage = () => {
  const toast = useToast();
  const cancelRef = React.useRef();

  const [formData, setFormData] = useState({
    full_name: "",
    surname: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios
      .get("/api/auth/user", { withCredentials: true })
      .then((res) => setFormData(res.data))
      .catch(() =>
        toast({
          title: "Failed to load user data",
          status: "error",
          isClosable: true,
        })
      );
  }, [toast]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const confirmSubmit = () => {
    setIsOpen(false);
    axios
      .put("/api/auth/user", formData, { withCredentials: true })
      .then(() =>
        toast({
          title: "Profile updated successfully",
          status: "success",
          isClosable: true,
        })
      )
      .catch((error) => {
        console.error('Update error:', error.response ? error.response.data : error.message);
        toast({
          title: "Update failed",
          description: error.response ? error.response.data.message : 'An unknown error occurred',
          status: "error",
          isClosable: true,
        });
      });
  };

  return (
    <Box p={6} maxW="600px" mx="auto">
      <Heading mb={6}>Personal User Information</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input name="full_name" value={formData.full_name} onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Surname</FormLabel>
            <Input name="surname" value={formData.surname} onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input name="address" value={formData.address} onChange={handleChange} />
          </FormControl>

          <Button colorScheme="blue" type="submit" width="full">
            Save Changes
          </Button>
        </VStack>
      </form>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => setIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Changes
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to save these changes to your profile?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={confirmSubmit} ml={3}>
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PersonalUserPage; 