import React, { useState, useEffect } from "react";
import axios from "axios";
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
  SimpleGrid,
  Divider, // <-- new
} from "@chakra-ui/react";

const PersonalUserPage = () => {
  const toast = useToast();
  const cancelRef = React.useRef();

  const [formData, setFormData] = useState({
    profile_picture: null,
    emergency_contact_name: "",
    emergency_contact_number: "",
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    national_id_number: "",
    gender: "",
    address_street: "",
    address_city: "",
    address_province: "",
    address_postal_code: "",
    employment_status: "",
    occupation: "",
    monthly_income: "",
    employer_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_type: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
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
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const confirmSubmit = () => {
    setIsOpen(false);
    const token = localStorage.getItem("token");
    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        form.append(key, value);
      }
    });

    axios
      .post("http://localhost:5000/profile/me", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast({
          title: "Profile updated successfully",
          status: "success",
          isClosable: true,
        });
      })
      .catch((error) => {
        console.error(
          "Update error:",
          error.response ? error.response.data : error.message
        );
        toast({
          title: "Update failed",
          description: error.response
            ? error.response.data.message
            : "An unknown error occurred",
          status: "error",
          isClosable: true,
        });
      });
  };

  return (
    // Outer container with gray background
    <Box bg="gray.50" minH="100vh" p={8}>
      {/* Profile Header */}
      <Box
        bg="white"
        p={6}
        rounded="xl"
        shadow="sm"
        display="flex"
        alignItems="center"
        mb={6}
      >
        <Box
          boxSize="80px"
          rounded="full"
          overflow="hidden"
          borderWidth={1}
          mr={4}
        >
          {/* Placeholder or user image */}
          <img
            src={
              formData.profile_picture_url || "https://via.placeholder.com/80"
            }
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Box flex="1">
          <Heading size="md" mb={1}>
            {formData.full_name || "Full Name"}
          </Heading>
          <Box fontSize="sm" color="gray.500">
            {formData.email || "email@example.com"}
          </Box>
        </Box>

        <Button colorScheme="blue" onClick={handleSubmit}>
          Edit
        </Button>
      </Box>

      {/* Form */}
      <Box bg="white" p={6} rounded="xl" shadow="sm">
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Profile Picture */}
            <FormControl>
              <FormLabel>Profile Picture</FormLabel>
              <Input
                type="file"
                name="profile_picture"
                onChange={handleChange}
                accept="image/*"
              />
            </FormControl>

            <Divider />

            {/* Emergency Contact */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Emergency Contact Name</FormLabel>
                <Input
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Emergency Contact Number</FormLabel>
                <Input
                  type="tel"
                  name="emergency_contact_number"
                  value={formData.emergency_contact_number}
                  onChange={handleChange}
                />
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Personal Info */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>National ID Number</FormLabel>
                <Input
                  name="national_id_number"
                  value={formData.national_id_number}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Input
                  as="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </Input>
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Address */}
            <Heading size="sm">Address</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Street</FormLabel>
                <Input
                  name="address_street"
                  value={formData.address_street}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  name="address_city"
                  value={formData.address_city}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Province</FormLabel>
                <Input
                  as="select"
                  name="address_province"
                  value={formData.address_province}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </Input>
              </FormControl>
              <FormControl>
                <FormLabel>Postal Code</FormLabel>
                <Input
                  type="number"
                  name="address_postal_code"
                  value={formData.address_postal_code}
                  onChange={handleChange}
                />
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Employment & Income */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Employment Status</FormLabel>
                <Input
                  as="select"
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </Input>
              </FormControl>
              <FormControl>
                <FormLabel>Occupation / Job Title</FormLabel>
                <Input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Monthly Income Range</FormLabel>
                <Input
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  placeholder="e.g. 10,000 - 20,000"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Employer Name</FormLabel>
                <Input
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                />
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Banking Info */}
            <Heading size="sm">Banking Info</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Bank Name</FormLabel>
                <Input
                  as="select"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Capitec">Capitec</option>
                  <option value="FNB">FNB</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Other">Other</option>
                </Input>
              </FormControl>
              <FormControl>
                <FormLabel>Account Number</FormLabel>
                <Input
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Account Type</FormLabel>
                <Input
                  as="select"
                  name="bank_account_type"
                  value={formData.bank_account_type}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Savings">Savings</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </Input>
              </FormControl>
            </SimpleGrid>

            <Button colorScheme="blue" type="submit" alignSelf="flex-end">
              Save Changes
            </Button>
          </VStack>
        </form>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
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