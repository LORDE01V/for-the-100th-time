import 'package:flutter/material.dart';
import 'dart:ui'; // Added for BackdropFilter
import 'package:flutter/services.dart'; // Import for FilteringTextInputFormatter and LengthLimitingTextInputFormatter
import 'package:gridx_apk/sign_in_screen.dart'; // Import SignInScreen
import 'dart:convert'; // Import for jsonEncode and jsonDecode
import 'package:http/http.dart' as http; // Import for HTTP requests

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  final _formKey = GlobalKey<FormState>(); // Added GlobalKey for Form
  final TextEditingController _userNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController(text: '+27'); // Default to +27
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final FocusNode _emailFocusNode = FocusNode(); // Added FocusNode for email field
  String _passwordStrengthMessage = ''; // Added for password strength message
  double _passwordStrength = 0.0; // Added for password strength value

  @override
  void initState() {
    super.initState();
    _emailFocusNode.addListener(() {
      setState(() {}); // Rebuild to update hint text visibility
    });
    _passwordController.addListener(_updatePasswordStrength); // Listen for password changes
  }

  @override
  void dispose() {
    _userNameController.dispose();
    _emailController.dispose();
    _phoneNumberController.dispose();
    _passwordController.removeListener(_updatePasswordStrength); // Remove listener
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _emailFocusNode.dispose(); // Dispose FocusNode
    super.dispose();
  }

  void _updatePasswordStrength() {
    final password = _passwordController.text;
    setState(() {
      _passwordStrength = _getPasswordStrength(password);
      _passwordStrengthMessage = _getPasswordStrengthMessage(_passwordStrength, password);
    });
  }

  double _getPasswordStrength(String password) {
    if (password.isEmpty) return 0.0;
    double strength = 0.0;
    if (password.length >= 8) strength += 0.25;
    if (password.contains(RegExp(r'[A-Z]'))) strength += 0.25;
    if (password.contains(RegExp(r'[a-z]'))) strength += 0.25;
    if (password.contains(RegExp(r'[0-9]'))) strength += 0.15;
    if (password.contains(RegExp(r'[!@#$%^&*()_+{}\[\]:;<>,.?~\\]'))) strength += 0.10;
    return strength.clamp(0.0, 1.0);
  }

  String _getPasswordStrengthMessage(double strength, String password) {
    if (password.isEmpty) return 'e.g. StrongP@ss1';
    if (strength < 0.3) return 'Weak';
    if (strength < 0.6) return 'Medium';
    if (strength < 0.8) return 'Strong';
    return 'Very Strong';
  }

  void _signUp() {
    if (_formKey.currentState!.validate()) {
      if (_passwordController.text != _confirmPasswordController.text) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Passwords do not match!')),
        );
        return;
      }
      _attemptSignUp(); // Call the new async method
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields correctly.')),
      );
    }
  }

  Future<void> _attemptSignUp() async {
    final String userName = _userNameController.text;
    final String email = _emailController.text;
    final String phoneNumber = _phoneNumberController.text;
    final String password = _passwordController.text;

    final String apiUrl = "http://10.0.2.2:5000/api/auth/register"; // Use 10.0.2.2 for Android emulator

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String?>{
          'name': userName,
          'email': email,
          'phone': phoneNumber,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        // Success
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account created successfully! Please sign in.')),
        );
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => SignInScreen()));
      } else {
        // Error or user already exists
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(responseData['message'] ?? 'Registration failed. Please try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/create_account.jpg'),
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
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40.0, vertical: 60.0),
              child: Form( // Wrapped with Form widget
                key: _formKey, // Assigned GlobalKey
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                IconButton(
                  onPressed: () {
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                    ),
                    const SizedBox(height: 50.0),
                    ShaderMask(
                      shaderCallback: (Rect bounds) {
                        return const LinearGradient(
                          colors: [Color(0xFF80CBC4), Color(0xFFB2EBF2)], // Applied colors from main.dart
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ).createShader(bounds);
                      },
                      child: const Text(
                        'Create an\nAccount!',
                        style: TextStyle(
                          fontSize: 48.0,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 50.0),
                    _buildInputField(
                      hintText: 'User Name',
                      icon: Icons.person_outline,
                      controller: _userNameController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your user name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20.0),
                    _buildInputField(
                      hintText: _emailFocusNode.hasFocus || _emailController.text.isNotEmpty ? 'Email Address' : 'e.g. Gridx@gmail.com',
                      icon: Icons.email_outlined,
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      focusNode: _emailFocusNode,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email address';
                        }
                        if (!RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+").hasMatch(value)) {
                          return 'Please enter a valid email address';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20.0),
                    _buildInputField(
                      hintText: 'Phone Number',
                      icon: Icons.phone_outlined,
                      controller: _phoneNumberController,
                      keyboardType: TextInputType.phone,
                      maxLength: 12, // +27 and 9 digits
                      inputFormatters: [
                        PhoneNumberFormatter(),
                      ],
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your phone number';
                        }
                        // After PhoneNumberFormatter, the value will always start with '+27'.
                        // We need to check if there are 9 digits after '+27'.
                        String digitsOnly = value.replaceAll(RegExp(r'[^0-9]'), '');
                        if (digitsOnly.length != 11) { // 2 digits for '+27' and 9 for phone number = 11 digits
                          return 'Phone number must be 9 digits after +27';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20.0),
                    _buildPasswordField(
                      hintText: 'Password',
                      isPasswordVisible: _isPasswordVisible,
                      onToggleVisibility: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
                      controller: _passwordController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        return null;
                      },
                      strengthValue: _passwordStrength,
                      strengthMessage: _passwordStrengthMessage,
                    ),
                    const SizedBox(height: 20.0),
                    _buildPasswordField(
                      hintText: 'Confirm Password',
                      isPasswordVisible: _isConfirmPasswordVisible,
                      onToggleVisibility: () {
                        setState(() {
                          _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                        });
                      },
                      controller: _confirmPasswordController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please confirm your password';
                        }
                        if (value != _passwordController.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 40.0),
                    _buildGradientButton(
                      text: 'SIGN UP', // Changed to SIGN UP
                      onPressed: _signUp, // Changed to call _signUp method
                    ),
                    const SizedBox(height: 20.0),
                    Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                const Text(
                            'Already have an account?',
                  style: TextStyle(
                              color: Colors.white70,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context); // Navigate back to SignInScreen or WelcomeScreen
                            },
                            child: const Text(
                              'Sign in',
                  style: TextStyle(
                                color: Color(0xFF80CBC4), // Applied color from main.dart
                    fontWeight: FontWeight.bold,
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
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required String hintText,
    required IconData icon,
    TextEditingController? controller,
    TextInputType? keyboardType,
    int? maxLength,
    String? Function(String?)? validator, // Added validator
    FocusNode? focusNode, // Added FocusNode
    Function(String)? onChanged, // Added onChanged callback
    List<TextInputFormatter>? inputFormatters, // Added inputFormatters
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 5.0),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(30.0),
        border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
      ),
      child: TextFormField( // Changed to TextFormField
        controller: controller,
        keyboardType: keyboardType,
        maxLength: maxLength,
        style: const TextStyle(color: Colors.white),
        validator: validator, // Assigned validator
        focusNode: focusNode, // Assigned FocusNode
        onChanged: onChanged, // Assigned onChanged callback
        inputFormatters: inputFormatters, // Assigned inputFormatters
                  decoration: InputDecoration(
          counterText: "", // Hide the default character counter
          prefixIcon: Icon(icon, color: Colors.white),
          hintText: hintText,
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
          errorStyle: const TextStyle(color: Colors.redAccent), // Style for validation errors
          border: InputBorder.none,
        ),
      ),
    );
  }

  // Helper widget to build the password fields with a visibility toggle
  Widget _buildPasswordField({
    required String hintText,
    required bool isPasswordVisible,
    required VoidCallback onToggleVisibility,
    TextEditingController? controller,
    String? Function(String?)? validator, // Added validator
    double? strengthValue, // Added for password strength
    String? strengthMessage, // Added for password strength message
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 5.0),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(30.0),
            border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
          ),
          child: TextFormField( // Changed to TextFormField
            controller: controller,
            obscureText: !isPasswordVisible,
            style: const TextStyle(color: Colors.white),
            validator: validator, // Assigned validator
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.lock_outline, color: Colors.white),
              suffixIcon: IconButton(
                icon: Icon(
                  isPasswordVisible ? Icons.visibility_off : Icons.visibility,
                  color: Colors.white,
                ),
                onPressed: onToggleVisibility,
              ),
              hintText: hintText,
              hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
              errorStyle: const TextStyle(color: Colors.redAccent), // Style for validation errors
              border: InputBorder.none,
            ),
          ),
        ),
        if (strengthValue != null) // Display strength meter and message only for password field
          Padding(
            padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 5.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LinearProgressIndicator(
                  value: strengthValue,
                  backgroundColor: Colors.grey[700],
                  color: strengthValue < 0.3
                      ? Colors.red
                      : strengthValue < 0.6
                          ? Colors.orange
                          : Colors.green,
                ),
                const SizedBox(height: 5),
                Text(
                  'Password Strength: $strengthMessage',
                  style: TextStyle(
                    color: strengthValue < 0.3
                        ? Colors.red
                        : strengthValue < 0.6
                            ? Colors.orange
                            : Colors.green,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildGradientButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return Container(
                  width: double.infinity,
      height: 50.0, // Changed from 60.0 to 50.0 to match sign in button
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
          colors: [Color(0xFF80CBC4), Color(0xFFB2EBF2)], // Applied colors from main.dart
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
          onTap: onPressed,
                      borderRadius: BorderRadius.circular(30.0),
                      child: Center(
            child: Text(
              text,
              style: const TextStyle(
                                  color: Colors.white,
                fontSize: 18.0,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
      ),
    );
  }
}

class PhoneNumberFormatter extends TextInputFormatter {
  static const String prefix = '+27';
  static const int maxDigitsAfterPrefix = 9;

  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    String incomingText = newValue.text;

    // Handle initial state or full deletion: reset to prefix
    if (incomingText.isEmpty || !incomingText.startsWith(prefix)) {
      return TextEditingValue(
        text: prefix,
        selection: TextSelection.collapsed(offset: prefix.length),
      );
    }

    // Prevent deletion of the prefix itself
    if (oldValue.text.startsWith(prefix) &&
        incomingText.length < prefix.length &&
        newValue.selection.end < prefix.length) {
      return oldValue.copyWith(
          text: prefix, selection: TextSelection.collapsed(offset: prefix.length));
    }

    // Extract numbers after the prefix
    String digitsAfterPrefix = incomingText.substring(prefix.length);
    digitsAfterPrefix = digitsAfterPrefix.replaceAll(RegExp(r'[^0-9]'), '');

    // Limit the number of digits after the prefix
    if (digitsAfterPrefix.length > maxDigitsAfterPrefix) {
      digitsAfterPrefix = digitsAfterPrefix.substring(0, maxDigitsAfterPrefix);
    }

    String finalFormattedText = prefix + digitsAfterPrefix;

    // Calculate new selection offset, ensuring it's not before the prefix and within bounds
    int newSelectionOffset = newValue.selection.end;
    if (newSelectionOffset < prefix.length) {
      newSelectionOffset = prefix.length;
    } else if (newSelectionOffset > finalFormattedText.length) {
      newSelectionOffset = finalFormattedText.length;
    }

    return TextEditingValue(
      text: finalFormattedText,
      selection: TextSelection.collapsed(offset: newSelectionOffset),
    );
  }
}
