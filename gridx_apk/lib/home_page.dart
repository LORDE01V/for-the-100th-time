import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:gridx_apk/personal_user_page.dart'; // Import PersonalUserPage

// This is the main entry point for the application.
void main() {
  runApp(const MyApp());
}

// MyApp is a StatelessWidget that provides the basic app setup.
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // Hides the debug banner
      title: 'GridX Energy',
      theme: ThemeData(
        brightness: Brightness.light,
        primarySwatch: Colors.blue,
      ),
      home: const HomeScreen(),
    );
  }
}

// HomeScreen is a StatefulWidget to manage the state of the active tab.
class HomeScreen extends StatefulWidget {
  final String username;
  const HomeScreen({super.key, this.username = 'User'});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // State variable to track the currently selected tab
  int _selectedIndex = 0;

  // Method to handle tab selection
  // void _onItemTapped(int index) {
  //   setState(() {
  //     _selectedIndex = index;
  //   });
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Image with Gradient Overlay
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/AI_suggestion - Copy.png'), // New background image
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
          // Main Content of the screen
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 60.0), // Spacing from top
                  // Header Section
                  _buildHeader(),
                  const SizedBox(height: 30.0),
                  // Units and Coins Cards
                  _buildStatsCards(),
                  const SizedBox(height: 30.0),
                  // Category Section
                  _buildCategorySection(),
                  const SizedBox(height: 30.0),
                  // AI Energy Saving Tips Section
                  _buildAITipsSection(),
                  const SizedBox(height: 120.0), // Spacing for bottom nav bar
                ],
              ),
            ),
          ),
        ],
      ),
      // Bottom Navigation Bar
      bottomNavigationBar: _buildBottomNavBar(),
    );
  }

  // Widget to build the header section
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Welcome\n${widget.username}!',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 32.0,
            fontWeight: FontWeight.bold,
          ),
        ),
        // Placeholder for user profile image
        const CircleAvatar(
          radius: 30.0,
          backgroundImage: AssetImage('assets/images/avatar_placeholder.png'), // Placeholder image
        ),
      ],
    );
  }

  // Widget to build the stats cards section
  Widget _buildStatsCards() {
    return Row(
      children: [
        Expanded(
          child: _buildInfoCard(
            icon: Icons.electrical_services,
            title: 'Units Kwh',
            value: 'R 360',
          ),
        ),
        const SizedBox(width: 20.0),
        Expanded(
          child: _buildInfoCard(
            icon: Icons.monetization_on,
            title: 'My Coins',
            value: '1,234.567',
          ),
        ),
      ],
    );
  }

  // Helper widget for a single stats card
  Widget _buildInfoCard({required IconData icon, required String title, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF80CBC4), Color(0xFFB2EBF2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(15.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            spreadRadius: 2,
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.white, size: 24.0),
          const SizedBox(height: 10.0),
                        Text(
            title,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14.0,
            ),
          ),
          const SizedBox(height: 5.0),
                        Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20.0,
              fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
    );
  }

  // Widget to build the category grid section
  Widget _buildCategorySection() {
    // List of category items with icons and labels
    final List<Map<String, dynamic>> categories = [
      {'label': 'Expenses', 'icon': Icons.account_balance_wallet_outlined},
      {'label': 'Subscriptions', 'icon': Icons.credit_card_outlined},
      {'label': 'Refer & Earn', 'icon': Icons.person_add_alt_1_outlined},
      {'label': 'Notifications', 'icon': Icons.notifications_outlined},
      {'label': 'Groups Buying', 'icon': Icons.group_outlined},
      {'label': 'Forum', 'icon': Icons.forum_outlined},
      {'label': 'Contact Us', 'icon': Icons.call_outlined},
      {'label': 'About', 'icon': Icons.info_outlined},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Category',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24.0,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 20.0),
        // GridView to create the 2x4 layout
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4, // 4 items per row
            childAspectRatio: 0.9, // Increased aspect ratio to give more vertical space
            crossAxisSpacing: 16.0,
            mainAxisSpacing: 16.0,
          ),
          itemCount: categories.length,
          itemBuilder: (context, index) {
            return _buildCategoryItem(
              label: categories[index]['label'],
              icon: categories[index]['icon'],
            );
          },
        ),
      ],
    );
  }

  // Helper widget for a single category icon button
  Widget _buildCategoryItem({required String label, required IconData icon}) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 60.0,
          height: 60.0,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 30.0),
        ),
        const SizedBox(height: 8.0),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10.0, // Reduced font size
          ),
        ),
      ],
    );
  }

  // Widget to build the AI tips section
  Widget _buildAITipsSection() {
    return Container(
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: const Color(0xFF122849).withOpacity(0.8),
        borderRadius: BorderRadius.circular(20.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            spreadRadius: 2,
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Gradient text for the title
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return const LinearGradient(
                colors: [Color(0xFF80CBC4), Color(0xFFB2EBF2)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(bounds);
            },
            child: const Text(
              'AI Energy Saving Tips',
              style: TextStyle(
                fontSize: 24.0,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 10.0),
          const Text(
            '(ai tips will be displayed here)',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14.0,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  // Widget to build the bottom navigation bar
  Widget _buildBottomNavBar() {
    return BottomNavigationBar(
      items: const <BottomNavigationBarItem>[
        BottomNavigationBarItem(
          icon: Icon(Icons.dashboard_outlined),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.explore_outlined),
          label: 'Explore',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.shopping_bag_outlined),
          label: 'Topup',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          label: 'Profile',
        ),
      ],
      currentIndex: _selectedIndex,
      selectedItemColor: const Color(0xFF80CBC4), // Highlight color for active tab
      unselectedItemColor: Colors.white70,
      onTap: (index) {
        setState(() {
          _selectedIndex = index;
        });
        if (index == 3) { // Assuming Profile is the 4th item (index 3)
          Navigator.push(context, MaterialPageRoute(builder: (context) => PersonalUserPage()));
        }
      },
      backgroundColor: const Color(0xFF122849).withOpacity(0.7),
      type: BottomNavigationBarType.fixed,
      selectedFontSize: 12.0,
      unselectedFontSize: 12.0,
    );
  }
}
