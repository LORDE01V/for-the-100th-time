import 'package:flutter/material.dart';
import 'dart:ui';

class TermsOfServicePage extends StatelessWidget {
  const TermsOfServicePage({super.key});

  final String _effectiveDate = "[Insert Date]";

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
          SingleChildScrollView(
            child: Padding(
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
                  Align(
                    alignment: Alignment.center,
                    child: Column(
                      children: <Widget>[
                        const Text(
                          "Terms of Service for GridX",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Effective Date: $_effectiveDate",
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 30),
                      ],
                    ),
                  ),
                  Card(
                    color: Color.fromARGB(230, 255, 255, 255), // Background for the content card
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          _buildSection(
                            "1. Your GridX Account",
                            "Welcome to GridX! These Terms of Service (\"Terms\") govern your use of our web app. By accessing or using GridX, you agree to these Terms.",
                            [
                              "You must be at least 13 years old to create an account",
                              "You are responsible for keeping your login credentials secure",
                              "You agree to provide accurate and complete information during registration",
                            ],
                          ),
                          _buildSection(
                            "2. User Responsibilities",
                            "You agree not to:",
                            [
                              "Use GridX for unlawful, harmful, or abusive activities",
                              "Upload or share offensive, misleading, or malicious content",
                              "Attempt to hack, exploit, or disrupt GridX or its users",
                              "Violate any applicable laws or regulations",
                            ],
                          ),
                          _buildSection(
                            "3. Service Modifications",
                            "We reserve the right to modify or discontinue services at any time. Major changes will be communicated through our platform or via email.",
                            [],
                          ),
                          _buildSection(
                            "4. Intellectual Property",
                            "All GridX content, logos, and software are protected by intellectual property laws. You may not use our branding without written permission.",
                            [],
                          ),
                          _buildSection(
                            "5. Termination",
                            "We reserve the right to suspend or terminate accounts that violate these Terms. You may appeal termination by contacting our support team.",
                            [],
                          ),
                          _buildSection(
                            "6. Disclaimer of Warranties",
                            "GridX is provided \"as is\" without warranties of any kind. We do not guarantee uninterrupted or error-free service.",
                            [],
                          ),
                        ],
                      ),
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

  Widget _buildSection(String title, String paragraph, List<String> bulletPoints) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: const TextStyle(
              color: Colors.black,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            paragraph,
            style: const TextStyle(color: Colors.black87, fontSize: 14),
          ),
          if (bulletPoints.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 15.0, top: 5.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: bulletPoints.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2.0),
                  child: Text(
                    "• $item",
                    style: const TextStyle(color: Colors.black87, fontSize: 14),
                  ),
                )).toList(),
              ),
            ),
        ],
      ),
    );
  }
}
