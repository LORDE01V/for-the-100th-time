import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class PersonalUserPage extends StatefulWidget {
  const PersonalUserPage({super.key});

  @override
  State<PersonalUserPage> createState() => _PersonalUserPageState();
}

class _PersonalUserPageState extends State<PersonalUserPage> {
  final TextEditingController _emergencyContactNameController = TextEditingController();
  final TextEditingController _emergencyContactNumberController = TextEditingController();
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  final TextEditingController _dateOfBirthController = TextEditingController();
  final TextEditingController _nationalIdNumberController = TextEditingController();
  final TextEditingController _addressStreetController = TextEditingController();
  final TextEditingController _addressCityController = TextEditingController();
  final TextEditingController _addressPostalCodeController = TextEditingController();
  final TextEditingController _occupationController = TextEditingController();
  final TextEditingController _monthlyIncomeController = TextEditingController();
  final TextEditingController _employerNameController = TextEditingController();
  final TextEditingController _bankAccountNumberController = TextEditingController();

  String _gender = '';
  String _addressProvince = '';
  String _employmentStatus = '';
  String _bankName = '';
  String _bankAccountType = '';

  String _profilePictureUrl = 'https://via.placeholder.com/80'; // Placeholder for profile picture

  bool _isLoading = true;
  bool _isSaving = false;
  
  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    setState(() {
      _isLoading = true;
    });
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token'); // Assuming token is stored after login

    if (token == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Authentication token not found.')),
        );
      }
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:5000/profile/me'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (mounted) {
        if (response.statusCode == 200) {
          final Map<String, dynamic> data = jsonDecode(response.body);
          _emergencyContactNameController.text = data['emergency_contact_name'] ?? '';
          _emergencyContactNumberController.text = data['emergency_contact_number'] ?? '';
          _fullNameController.text = data['full_name'] ?? '';
          _emailController.text = data['email'] ?? '';
          _phoneNumberController.text = data['phone_number'] ?? '';
          _dateOfBirthController.text = data['date_of_birth'] ?? '';
          _nationalIdNumberController.text = data['national_id_number'] ?? '';
          _gender = data['gender'] ?? '';
          _addressStreetController.text = data['address_street'] ?? '';
          _addressCityController.text = data['address_city'] ?? '';
          _addressProvince = data['address_province'] ?? '';
          _addressPostalCodeController.text = data['address_postal_code'] ?? '';
          _employmentStatus = data['employment_status'] ?? '';
          _occupationController.text = data['occupation'] ?? '';
          _monthlyIncomeController.text = data['monthly_income'] ?? '';
          _employerNameController.text = data['employer_name'] ?? '';
          _bankName = data['bank_name'] ?? '';
          _bankAccountNumberController.text = data['bank_account_number'] ?? '';
          _bankAccountType = data['bank_account_type'] ?? '';
          _profilePictureUrl = data['profile_picture_url'] ?? 'https://via.placeholder.com/80';
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to load user data: ${response.statusCode}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Network error: $e')),
        );
      }
    }
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _saveUserData() async {
    setState(() {
      _isSaving = true;
    });
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Authentication token not found.')),
        );
      }
      setState(() {
        _isSaving = false;
      });
      return;
    }

    final Map<String, dynamic> data = {
      'emergency_contact_name': _emergencyContactNameController.text,
      'emergency_contact_number': _emergencyContactNumberController.text,
      'full_name': _fullNameController.text,
      'email': _emailController.text,
      'phone_number': _phoneNumberController.text,
      'date_of_birth': _dateOfBirthController.text,
      'national_id_number': _nationalIdNumberController.text,
      'gender': _gender,
      'address_street': _addressStreetController.text,
      'address_city': _addressCityController.text,
      'address_province': _addressProvince,
      'address_postal_code': _addressPostalCodeController.text,
      'employment_status': _employmentStatus,
      'occupation': _occupationController.text,
      'monthly_income': _monthlyIncomeController.text,
      'employer_name': _employerNameController.text,
      'bank_name': _bankName,
      'bank_account_number': _bankAccountNumberController.text,
      'bank_account_type': _bankAccountType,
      // 'profile_picture': null, // File upload is complex for this step
    };

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5000/profile/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(data),
      );

      if (mounted) {
        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile updated successfully!')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to update profile: ${response.statusCode}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Network error: $e')),
        );
      }
    }

    setState(() {
      _isSaving = false;
    });
  }

  @override
  void dispose() {
    _emergencyContactNameController.dispose();
    _emergencyContactNumberController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneNumberController.dispose();
    _dateOfBirthController.dispose();
    _nationalIdNumberController.dispose();
    _addressStreetController.dispose();
    _addressCityController.dispose();
    _addressPostalCodeController.dispose();
    _occupationController.dispose();
    _monthlyIncomeController.dispose();
    _employerNameController.dispose();
    _bankAccountNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/AI_suggestion - Copy.png'), // Consistent background
                fit: BoxFit.cover,
              ),
            ),
          ),
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
            child: Container(
              color: const Color.fromARGB(77, 0, 0, 0),
            ),
          ),
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Align(
                          alignment: Alignment.topLeft,
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 30),
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                          ),
                        ),
                        const SizedBox(height: 40),
                        Align(
                          alignment: Alignment.center,
                          child: Column(
                            children: <Widget>[
                              const Text(
                                "Personal Profile",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Montserrat',
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 30),
                              CircleAvatar(
                                radius: 40,
                                backgroundImage: _profilePictureUrl.isNotEmpty
                                    ? NetworkImage(_profilePictureUrl) as ImageProvider<Object>
                                    : const AssetImage('assets/images/avatar_placeholder.png'),
                                backgroundColor: Colors.transparent,
                              ),
                              const SizedBox(height: 10),
                              Text(
                                _fullNameController.text.isEmpty ? "Full Name" : _fullNameController.text,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                _emailController.text.isEmpty ? "email@example.com" : _emailController.text,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(20.0),
                          decoration: BoxDecoration(
                            color: Colors.white.withAlpha((0.1 * 255).round()),
                            borderRadius: BorderRadius.circular(15.0),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha((0.2 * 255).round()),
                                spreadRadius: 1,
                                blurRadius: 3,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              // Emergency Contact
                              _buildSectionTitle('Emergency Contact'),
                              _buildTextField(
                                'Emergency Contact Name',
                                _emergencyContactNameController,
                                TextInputType.text,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Emergency Contact Number',
                                _emergencyContactNumberController,
                                TextInputType.phone,
                              ),
                              const SizedBox(height: 25),
                              // Personal Info
                              _buildSectionTitle('Personal Info'),
                              _buildTextField(
                                'Full Name',
                                _fullNameController,
                                TextInputType.text,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Email',
                                _emailController,
                                TextInputType.emailAddress,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Phone Number',
                                _phoneNumberController,
                                TextInputType.phone,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Date of Birth',
                                _dateOfBirthController,
                                TextInputType.datetime,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'National ID Number',
                                _nationalIdNumberController,
                                TextInputType.number,
                              ),
                              const SizedBox(height: 15),
                              _buildDropdownField(
                                'Gender',
                                _gender,
                                ['Male', 'Female', 'Other', 'Prefer not to say'],
                                (String? newValue) {
                                  setState(() {
                                    _gender = newValue ?? '';
                                  });
                                },
                              ),
                              const SizedBox(height: 25),
                              // Address
                              _buildSectionTitle('Address'),
                              _buildTextField(
                                'Street',
                                _addressStreetController,
                                TextInputType.streetAddress,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'City',
                                _addressCityController,
                                TextInputType.text,
                              ),
                              const SizedBox(height: 15),
                              _buildDropdownField(
                                'Province',
                                _addressProvince,
                                ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'],
                                (String? newValue) {
                                  setState(() {
                                    _addressProvince = newValue ?? '';
                                  });
                                },
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Postal Code',
                                _addressPostalCodeController,
                                TextInputType.number,
                              ),
                              const SizedBox(height: 25),
                              // Employment & Income
                              _buildSectionTitle('Employment & Income'),
                              _buildDropdownField(
                                'Employment Status',
                                _employmentStatus,
                                ['Employed', 'Unemployed', 'Student', 'Retired'],
                                (String? newValue) {
                                  setState(() {
                                    _employmentStatus = newValue ?? '';
                                  });
                                },
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Occupation / Job Title',
                                _occupationController,
                                TextInputType.text,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Monthly Income Range',
                                _monthlyIncomeController,
                                TextInputType.text,
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Employer Name',
                                _employerNameController,
                                TextInputType.text,
                              ),
                              const SizedBox(height: 25),
                              // Banking Info
                              _buildSectionTitle('Banking Info'),
                              _buildDropdownField(
                                'Bank Name',
                                _bankName,
                                ['Capitec', 'FNB', 'ABSA', 'Standard Bank', 'Nedbank', 'Other'],
                                (String? newValue) {
                                  setState(() {
                                    _bankName = newValue ?? '';
                                  });
                                },
                              ),
                              const SizedBox(height: 15),
                              _buildTextField(
                                'Account Number',
                                _bankAccountNumberController,
                                TextInputType.number,
                              ),
                              const SizedBox(height: 15),
                              _buildDropdownField(
                                'Account Type',
                                _bankAccountType,
                                ['Savings', 'Cheque', 'Other'],
                                (String? newValue) {
                                  setState(() {
                                    _bankAccountType = newValue ?? '';
                                  });
                                },
                              ),
                              const SizedBox(height: 30),
                              Center(
                                child: ElevatedButton(
                                  onPressed: _isSaving ? null : _saveUserData,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF80CBC4), // Match sign-in button
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(30.0),
                                    ),
                                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                                  ),
                                  child: _isSaving
                                      ? const CircularProgressIndicator(color: Colors.black)
                                      : const Text(
                                          "Save Changes",
                                          style: TextStyle(
                                            color: Colors.black,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, TextInputType keyboardType) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color.fromARGB(25, 255, 255, 255),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField(String label, String? currentValue, List<String> items, Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: const Color.fromARGB(25, 255, 255, 255),
            borderRadius: BorderRadius.circular(10.0),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: currentValue == '' ? null : currentValue,
              isExpanded: true,
              hint: Text(label, style: const TextStyle(color: Colors.white70)),
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
              dropdownColor: const Color(0xFF122849), // Dark background for dropdown
              style: const TextStyle(color: Colors.white, fontSize: 16),
              onChanged: onChanged,
              items: items.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 15),
      ],
    );
  }
}
