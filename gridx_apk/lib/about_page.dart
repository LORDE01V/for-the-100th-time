import 'package:flutter/material.dart';
import 'dart:ui';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  // Dummy team data with placeholder image paths
  final List<Map<String, dynamic>> _team = const [
    {
      'name': "Kgotatso Mokgashi",
      'role': "Backend",
      'avatar': 'assets/images/avatar_placeholder.png',
    },
    {
      'name': "Okuhle Gadla",
      'role': "Backend",
      'avatar': 'assets/images/avatar_placeholder.png',
    },
    {
      'name': "Thembelihle Zulu",
      'role': "Database",
      'avatar': 'assets/images/avatar_placeholder.png',
    },
    {
      'name': "Mpho Ramokhoase",
      'role': "Frontend",
      'avatar': 'assets/images/avatar_placeholder.png',
    },
    {
      'name': "Nkosinathi Radebe",
      'role': "Frontend",
      'avatar': 'assets/images/avatar_placeholder.png',
    }
  ];

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
                      children: const <Widget>[
                        Text(
                          "About Us",
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
                          "Discover our mission and the team empowering sustainable energy solutions!",
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
                  Card(
                    color: Color.fromARGB(25, 255, 255, 255),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Text(
                            "Our Mission:",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 5),
                          const Text(
                            "Empowering communities with affordable solar energy and smart financial management.",
                            style: TextStyle(color: Colors.white70, fontSize: 14),
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            "What We Do:",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 5),
                          const Text(
                            "Gridx helps low-income households and small businesses manage energy usage efficiently, track expenses, and stay powered sustainably. We combine technology, finance, and clean energy to create a brighter future for all.",
                            style: TextStyle(color: Colors.white70, fontSize: 14),
                          ),
                          const SizedBox(height: 30),
                          const Text(
                            "Our Core Values",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 15),
                          Wrap(
                            spacing: 15,
                            runSpacing: 15,
                            alignment: WrapAlignment.center,
                            children: ['Sustainability', 'Community', 'Innovation', 'Transparency'].map((value) => 
                              Card(
                                color: Color.fromARGB(50, 255, 255, 255),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                  side: BorderSide(color: Colors.white.withAlpha((255 * 0.1).round()), width: 1),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(12.0),
                                  child: Text(
                                    value,
                                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ).toList(),
                          ),
                          const SizedBox(height: 30),
                          const Text(
                            "Our Team",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 15),
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2, // Two columns for team members
                              crossAxisSpacing: 15,
                              mainAxisSpacing: 15,
                              childAspectRatio: 0.8, // Adjust as needed
                            ),
                            itemCount: _team.length,
                            itemBuilder: (context, index) {
                              final member = _team[index];
                              return Card(
                                color: Color.fromARGB(38, 255, 255, 255), // Colors.white.withOpacity(0.15)
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15.0),
                                  side: BorderSide(color: Colors.white.withAlpha((255 * 0.1).round()), width: 1),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(15.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Container(
                                        width: 100,
                                        height: 100,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(10.0),
                                          color: Colors.black, // Placeholder background for image
                                          border: Border.all(color: Colors.white.withAlpha((255 * 0.25).round()), width: 2),
                                          image: DecorationImage(
                                            image: AssetImage(member['avatar']),
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 15),
                                      Text(
                                        member['name'],
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      Text(
                                        member['role'],
                                        style: const TextStyle(
                                          color: Colors.white70,
                                          fontSize: 14,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 30),
                          const Text(
                            "Contact Us",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 15),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            alignment: WrapAlignment.center,
                            children: <Widget>[
                              _buildContactButton(Icons.email, "Email", () {
                                // Placeholder for email action
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Email functionality not implemented.")));
                              }),
                              _buildContactButton(Icons.mail, "Twitter", () {
                                // Placeholder for Twitter action
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Twitter functionality not implemented.")));
                              }),
                              _buildContactButton(Icons.facebook, "Facebook", () {
                                // Placeholder for Facebook action
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Facebook functionality not implemented.")));
                              }),
                              _buildContactButton(Icons.camera_alt, "Instagram", () {
                                // Placeholder for Instagram action
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Instagram functionality not implemented.")));
                              }),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Align(
                            alignment: Alignment.center,
                            child: Text(
                              "support@gridx.com",
                              style: TextStyle(color: Colors.white54, fontSize: 12),
                            ),
                          ),
                          const SizedBox(height: 30),
                          const Text(
                            "By using Gridx, you agree to our Privacy Policy and Terms of Service.",
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            "Version 1.0.0 | Last updated: June 2024",
                            style: TextStyle(color: Colors.white54, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 30),
                          Center(
                            child: ElevatedButton(
                              onPressed: () {
                                // Placeholder for Join GridX action
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Join GridX action not implemented.")));
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF80CBC4),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30.0),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                              ),
                              child: const Text(
                                "Join Gridx Today",
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: <Widget>[
                                TextButton(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Terms of Service navigation not implemented.")));
                                  },
                                  child: const Text(
                                    "Terms of Service",
                                    style: TextStyle(color: Color(0xFF80CBC4)), // Matching the new sign in button color
                                  ),
                                ),
                                const Text(" | ", style: TextStyle(color: Colors.white70)),
                                TextButton(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Privacy Policy navigation not implemented.")));
                                  },
                                  child: const Text(
                                    "Privacy Policy",
                                    style: TextStyle(color: Color(0xFF80CBC4)), // Matching the new sign in button color
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
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactButton(IconData icon, String text, VoidCallback onPressed) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, color: Colors.black), // Icon color
      label: Text(
        text,
        style: const TextStyle(
          color: Colors.black,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF80CBC4), // Light blue-green button
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30.0),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
      ),
    );
  }
}
