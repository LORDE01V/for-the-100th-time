import 'package:flutter/material.dart';
import 'dart:ui'; // Provides BackdropFilter
import 'package:http/http.dart' as http; // Import for making HTTP requests
import 'dart:convert'; // Import for JSON encoding/decoding

// This is the main entry point for the application.
// void main() {
//   runApp(const MyApp());
// }

// MyApp is a StatelessWidget that provides the basic app setup.
// class MyApp extends StatelessWidget {
//   const MyApp({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       debugShowCheckedModeBanner: false, // Hides the debug banner
//       title: 'GridX Energy Support',
//       theme: ThemeData(
//         brightness: Brightness.light,
//         primaryColor: const Color(0xFF16c3b6),
//         // This font is used in the original code, so we ensure it's
//         // part of the theme for a consistent look.
//         fontFamily: 'Montserrat',
//       ),
//       home: const SupportPage(),
//     );
//   }
// }

// SupportPage is a StatefulWidget to manage the form and FAQ state.
class SupportPage extends StatefulWidget {
  const SupportPage({super.key});

  @override
  State<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends State<SupportPage> {
  // Controllers for the form fields to get and set text.
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();

  // State variable to show a loading indicator while submitting.
  bool _isSubmitting = false;

  // Dummy FAQ data for the expandable panels.
  final List<Map<String, dynamic>> _faqItems = [
    {
      'question': 'How do I top up my solar energy credit?',
      'answer': 'You can top up your energy credit on the Top-Up page. Select your preferred amount or enter a voucher code and follow the payment instructions.'
    },
    {
      'question': 'How can I track my energy usage?',
      'answer': 'Your energy usage and analytics can be viewed on the Dashboard page, which provides daily, weekly, and monthly summaries.'
    },
    {
      'question': 'What should I do if my solar system is not generating power?',
      'answer': 'First, check the System Status page for any alerts. If the issue persists, please contact our support team using the form below or the contact details provided.'
    },
    {
      'question': 'How do I update my profile information?',
      'answer': 'You can update your personal details, such as phone number and address, on the Profile page.'
    }
  ];

  @override
  void dispose() {
    // It's important to dispose of controllers to prevent memory leaks.
    _nameController.dispose();
    _emailController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  // Handles the form submission logic.
  void _handleContactSubmit() async {
    // Check if required fields are empty and show a snackbar if so.
    if (_nameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _messageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill in all required fields.")),
      );
      return;
    }

    // Start submission state to show the loading indicator.
    setState(() {
      _isSubmitting = true;
    });

    final String name = _nameController.text;
    final String email = _emailController.text;
    final String subject = _subjectController.text;
    final String message = _messageController.text;

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/support'), // Assuming your backend is at this address
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'name': name,
          'email': email,
          'subject': subject,
          'message': message,
        }),
      );

      if (!mounted) return; // Added mounted check

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Your support request has been received!")),
        );
        _nameController.clear();
        _emailController.clear();
        _subjectController.clear();
        _messageController.clear();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to send message: ${response.statusCode}")),
        );
      }
    } catch (e) {
      if (!mounted) return; // Added mounted check
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Network error: $e")),
      );
    } finally {
      // Reset state and clear fields after successful submission.
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  // The main build method for the widget.
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background image with an overlay.
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/background.png'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          // BackdropFilter creates a blurred effect over the background.
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
            child: Container(
              color: const Color.fromARGB(77, 0, 0, 0),
            ),
          ),
          // SingleChildScrollView allows the content to be scrollable.
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const SizedBox(height: 40),
                  // Back button
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 30),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                  ),
                  const SizedBox(height: 40),
                  // Header section for the page title and subtitle.
                  Align(
                    alignment: Alignment.center,
                    child: Column(
                      children: const <Widget>[
                        Text(
                          "Support and Help Center",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 8),
                        Text(
                          "Couldn't find your answer? Send us a message.",
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 30),
                      ],
                    ),
                  ),

                  // FAQ Section
                  Card(
                    color: const Color.fromARGB(25, 255, 255, 255),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Text(
                            "Frequently Asked Questions",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 15),
                          // ExpansionPanelList to display the FAQs.
                          ExpansionPanelList(
                            expansionCallback: (int index, bool isExpanded) {
                              setState(() {
                                // Toggles the expanded state for the selected item.
                                _faqItems[index]['isExpanded'] = !isExpanded;
                              });
                            },
                            children: _faqItems.map<ExpansionPanel>((Map<String, dynamic> item) {
                              return ExpansionPanel(
                                backgroundColor: const Color.fromARGB(13, 255, 255, 255),
                                headerBuilder: (BuildContext context, bool isExpanded) {
                                  return ListTile(
                                    title: Text(
                                      item['question'],
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  );
                                },
                                body: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                                  child: Text(
                                    item['answer'],
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                                isExpanded: item['isExpanded'] ?? false,
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Contact Form Section
                  Card(
                    color: const Color.fromARGB(25, 255, 255, 255),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Text(
                            "Contact Support",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 15),
                          // Text fields for the contact form.
                          _buildTextField("Your Name", _nameController, TextInputType.text),
                          const SizedBox(height: 20),
                          _buildTextField("Email Address", _emailController, TextInputType.emailAddress),
                          const SizedBox(height: 20),
                          _buildTextField("Subject (Optional)", _subjectController, TextInputType.text),
                          const SizedBox(height: 20),
                          _buildMessageField("Message", _messageController),
                          const SizedBox(height: 30),
                          // Submit button.
                          Center(
                            child: ElevatedButton(
                              onPressed: _isSubmitting ? null : _handleContactSubmit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF80CBC4),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30.0),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                              ),
                              child: _isSubmitting
                                  ? const CircularProgressIndicator(color: Colors.black)
                                  : const Text(
                                      "Send Message",
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
                  ),
                  const SizedBox(height: 30),

                  // Direct Contact Info section.
                  Card(
                    color: const Color.fromARGB(25, 255, 255, 255),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const <Widget>[
                          Text(
                            "Direct Contact",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 15),
                          ListTile(
                            leading: Icon(Icons.phone, color: Colors.white70),
                            title: Text("Phone: +27 12 345 6789", style: TextStyle(color: Colors.white)),
                          ),
                          ListTile(
                            leading: Icon(Icons.email, color: Colors.white70),
                            title: Text("Email: support@gridx.co.za", style: TextStyle(color: Colors.white)),
                          ),
                          ListTile(
                            leading: Icon(Icons.web, color: Colors.white70),
                            title: Text("Website: www.gridx.co.za", style: TextStyle(color: Colors.white)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Helper method to build a standard text field.
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

  // Helper method to build a text area.
  Widget _buildMessageField(String label, TextEditingController controller) {
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
          maxLines: 5,
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
}
