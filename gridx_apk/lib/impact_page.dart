import 'package:flutter/material.dart';
import 'dart:ui';

class ImpactPage extends StatelessWidget {
  const ImpactPage({super.key});

  // Mock data for impact statistics
  final List<Map<String, dynamic>> _impactStats = const [
    {'label': 'Total Solar Energy Provided', 'value': '1.2M kWh saved', 'icon': Icons.solar_power},
    {'label': 'Households Served', 'value': '4,300+ families empowered', 'icon': Icons.people},
    {'label': 'CO₂ Emissions Reduced', 'value': '620 tons offset', 'icon': Icons.eco},
  ];

  // Mock data for community stories
  final List<Map<String, dynamic>> _communityStories = const [
    {'name': 'Emily Johnson', 'location': 'Cape Town', 'story': 'GridX made solar simple for my family!', 'avatar': 'assets/images/avatar_placeholder.png', 'rating': 5},
    {'name': 'Michael Smith', 'location': 'Johannesburg', 'story': 'Fantastic support and easy to use.', 'avatar': 'assets/images/avatar_placeholder.png', 'rating': 4},
    {'name': 'Jessica Brown', 'location': 'Durban', 'story': 'I love tracking my energy savings.', 'avatar': 'assets/images/avatar_placeholder.png', 'rating': 5},
  ];

  void _downloadImpactReport() {
    // Placeholder for PDF download functionality
    // In a real app, you would generate or fetch a PDF and then trigger a download.
    // print("Downloading Impact Report...");
    // You might use a package like `path_provider` and `open_file` to save and open the file.
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
                  // Hero Section
                  Align(
                    alignment: Alignment.center,
                    child: Column(
                      children: const <Widget>[
                        Text(
                          "Our Collective Impact",
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
                          "Join thousands of South Africans transforming energy access",
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Statistics Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, // Adjust as needed for responsive layout
                      crossAxisSpacing: 15,
                      mainAxisSpacing: 15,
                      childAspectRatio: 1.2,
                    ),
                    itemCount: _impactStats.length,
                    itemBuilder: (context, index) {
                      final stat = _impactStats[index];
                      return Card(
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(15.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: <Widget>[
                              Icon(stat['icon'], color: Colors.tealAccent, size: 30),
                              const SizedBox(height: 10),
                              Text(
                                stat['value'],
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 5),
                              Text(
                                stat['label'],
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
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

                  // Download Report Button
                  Center(
                    child: ElevatedButton.icon(
                      onPressed: _downloadImpactReport,
                      icon: const Icon(Icons.download, color: Colors.black), // Icon color
                      label: const Text(
                        "Download Full Impact Report",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF80CBC4), // Light blue-green button
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Community Stories
                  const Text(
                    "Community Success Stories",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Montserrat',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _communityStories.length,
                    itemBuilder: (context, index) {
                      final story = _communityStories[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 10),
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              CircleAvatar(
                                backgroundImage: AssetImage(story['avatar']),
                                radius: 30,
                              ),
                              const SizedBox(width: 15),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text(
                                      story['name'],
                                      style: const TextStyle(
                                        color: Colors.tealAccent,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      story['location'],
                                      style: const TextStyle(
                                        color: Colors.white54,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      story['story'],
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Row(
                                      children: List.generate(5, (starIndex) {
                                        return Icon(
                                          Icons.star,
                                          color: starIndex < story['rating'] ? Colors.yellow : Colors.grey,
                                          size: 18,
                                        );
                                      }),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 30),

                  // Impact Map Placeholder
                  const Text(
                    "National Impact Footprint",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Montserrat',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Icon(Icons.map, color: Colors.white70, size: 50),
                          SizedBox(height: 10),
                          Text(
                            "Interactive Impact Map Coming Soon",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 16,
                            ),
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
}
