import 'package:flutter/material.dart';
import 'dart:ui';

import 'package:http/http.dart' as http; // Import http package
import 'dart:convert'; // Import for JSON encoding/decoding
import 'package:gridx_apk/sign_up_screen.dart'; // Import SignUpScreen
import 'package:shared_preferences/shared_preferences.dart'; // Import for SharedPreferences
import 'package:google_sign_in/google_sign_in.dart'; // Import for Google Sign-In
import 'package:gridx_apk/main.dart'; // Import WelcomeScreen

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _rememberMe = false;
  bool _isLoading = false;

  final GoogleSignIn _googleSignIn = GoogleSignIn();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _signIn() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter your email and password.")),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final String apiUrl = "http://10.0.2.2:5000/api/auth/login"; // Use 10.0.2.2 for Android emulator

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'email': _emailController.text,
          'password': _passwordController.text,
        }),
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }

      if (response.statusCode == 200) {
        // Login successful
        final Map<String, dynamic> responseData = response.body.isNotEmpty ? jsonDecode(response.body) : {};
        final String? token = responseData['access_token'];
        final String message = responseData['message'] ?? 'Login successful!';

        // You might want to store the token and user data securely (e.g., using shared_preferences or flutter_secure_storage)
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('access_token', token);
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message)),
          );
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const WelcomeScreen()));
        }
      } else if (response.statusCode == 401) {
        final Map<String, dynamic> responseData = response.body.isNotEmpty ? jsonDecode(response.body) : {};
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(responseData['message'] ?? "Invalid credentials.")),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.body.isNotEmpty ? (jsonDecode(response.body)?['message'] ?? "Sign in failed. Please try again later.") : "Sign in failed. Please try again later.")),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Network error: $e")),
        );
      }
    }
  }

  void _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // The user canceled the sign-in
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
        return;
      }

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // TODO: Send googleAuth.accessToken or googleAuth.idToken to your backend for verification
      // and to create/link a user account.

      if (googleAuth.idToken == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Failed to get Google ID token.")),
          );
        }
        setState(() {
          _isLoading = false;
        });
        return;
      }

      final backendResponse = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/auth/google-verify'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'id_token': googleAuth.idToken!,
        }),
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }

      if (backendResponse.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(backendResponse.body);
        final String? token = responseData['access_token'];

        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('access_token', token);
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(responseData['message'] ?? "Google Sign-In successful!")),
          );
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const WelcomeScreen()));
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(backendResponse.body.isNotEmpty ? (jsonDecode(backendResponse.body)?['message'] ?? "Google Sign-In failed on backend.") : "Google Sign-In failed on backend.")),
          );
        }
      }

    } catch (error) {
      print('Error during Google Sign-In: $error');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Google Sign-In failed: $error")),
        );
      }
    }
  }

  void _forgotPassword() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Forgot Password?"),
          content: const Text("Please contact support to reset your password."),
          actions: <Widget>[
            TextButton(
              child: const Text("OK"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/background.png'),
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
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const SizedBox(height: 40),
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 30),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
                const SizedBox(height: 40),
                const Text(
                  "Welcome",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Montserrat',
                  ),
                ),
                const Text(
                  "Back!",
                  style: TextStyle(
                    color: Color(0xFF80CBC4),
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Montserrat',
                  ),
                ),
                const SizedBox(height: 50),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Color.fromARGB(25, 255, 255, 255),
                    hintText: "Email Address",
                    hintStyle: TextStyle(color: Colors.white70),
                    prefixIcon: Icon(Icons.email, color: Colors.white70),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  style: TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Color.fromARGB(25, 255, 255, 255),
                    hintText: "Password",
                    hintStyle: TextStyle(color: Colors.white70),
                    prefixIcon: Icon(Icons.lock, color: Colors.white70),
                    suffixIcon: Icon(Icons.visibility_off, color: Colors.white70),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  style: TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Expanded(
                      child: Row(
                        children: <Widget>[
                          Checkbox(
                            value: _rememberMe,
                            onChanged: (bool? newValue) {
                              setState(() {
                                _rememberMe = newValue!;
                              });
                            },
                            fillColor: WidgetStateProperty.resolveWith((states) {
                              if (states.contains(WidgetState.selected)) {
                                return const Color(0xFF80CBC4); // Color when checked
                              }
                              return Colors.white10; // Color when unchecked
                            }),
                            checkColor: Colors.white,
                          ),
                          const Text(
                            "Remember me",
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: _forgotPassword,
                      child: const Text(
                        "Forgot Password?",
                        style: TextStyle(
                          color: Color(0xFF80CBC4),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Container(
                  width: double.infinity,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF80CBC4), Color(0xFFB2EBF2)],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _isLoading ? null : _signIn,
                      borderRadius: BorderRadius.circular(30.0),
                      child: Center(
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text(
                                "SIGN IN",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  width: double.infinity,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _isLoading ? null : _handleGoogleSignIn,
                      borderRadius: BorderRadius.circular(30.0),
                      child: Center(
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.black54)
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: <Widget>[
                                  Image.asset('assets/images/googleicon.png', height: 24.0),
                                  const SizedBox(width: 10),
                                  const Text(
                                    "Sign in with Google",
                                    style: TextStyle(
                                      color: Colors.black87,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const Text(
                      "Don't have an account?",
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const SignUpScreen()));
                      },
                      child: const Text(
                        "Sign up",
                        style: TextStyle(
                          color: Color(0xFF80CBC4),
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
