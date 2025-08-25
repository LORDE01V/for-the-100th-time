import 'package:flutter/material.dart';
// Added for BackdropFilter
import 'dart:async'; // Added for Timer
import 'package:gridx_apk/sign_in_screen.dart'; // Import SignInScreen
import 'package:gridx_apk/home_page.dart'; // Import HomeScreen
import 'package:gridx_apk/personal_user_page.dart'; // Import PersonalUserPage

// Add ChatbotScreen widget here
class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final List<_Message> _messages = [];
  final TextEditingController _controller = TextEditingController();

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_Message(text: text, isUser: true));
      // TODO: Add chatbot response logic here
    });

    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat Assistant'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return Align(
                  alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: message.isUser ? Colors.blue : Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      message.text,
                      style: TextStyle(
                        color: message.isUser ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: const InputDecoration(
                      hintText: 'Type your message...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Message {
  final String text;
  final bool isUser;

  _Message({required this.text, required this.isUser});
}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GridX App',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.purple,
        fontFamily: 'Montserrat',
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Colors.white),
        ),
      ),
      home: const SignInScreen(),
    );
  }
}

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with SingleTickerProviderStateMixin {
  final List<String> _messages = const [
    "Manage your solar energy and finances in one place.\nTrack usage, optimize costs, and make smarter energy decisions.",
    "Take control of your energy future.\nMonitor solar production and reduce your carbon footprint.",
    "Smart financial tools for sustainable living.\nSave money while saving the planet.",
    "Real-time insights into your energy consumption.\nMake informed decisions for a greener tomorrow.",
    "Join the renewable energy revolution.\nPower your home with clean, sustainable energy."
  ];

  final List<String> _greetings = const [
    'Hello',
    'Hallo',
    'Sawubona',
    'Molo',
    'Lotjhani',
    'Sawubona',
    'Dumela',
    'Dumela',
    'Dumela',
    'Avuxeni',
    'Ndaa',
  ];

  int _currentIndex = 0;
  late AnimationController _controller;
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    // _animation = CurvedAnimation(
    //   parent: _controller,
    //   curve: Curves.easeIn,
    // );

    _timer = Timer.periodic(const Duration(seconds: 5, milliseconds: 300), (timer) {
      if (mounted) {
        _controller.reverse().then((_) {
          setState(() {
            // Use the longer list length for modulo to cycle through all items
            _currentIndex = (_currentIndex + 1) % (_messages.length > _greetings.length ? _messages.length : _greetings.length);
          });
          _controller.forward();
        });
      }
    });
    _controller.forward(); // Start the initial fade in
  }

  @override
  void dispose() {
    _timer.cancel();
    _controller.dispose();
    super.dispose();
  }

  int _selectedIndex = 0; // Track selected bottom nav index

  // List of widgets for each bottom nav tab (replace with your actual screens)
  final List<Widget> _pages = [
    // Placeholder widgets for Dashboard, Explore, Topup, Profile
    const Center(child: Text('Dashboard', style: TextStyle(color: Colors.white))),
    const HomeScreen(), // From home_page.dart
    const Center(child: Text('Topup', style: TextStyle(color: Colors.white))),
    const PersonalUserPage(), // From personal_user_page.dart
  ];

  void _onItemTapped(int index) {
    if (index == 4) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const ChatbotScreen()),
      );
    } else {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GridX App'),
      ),
      body: _selectedIndex < _pages.length ? _pages[_selectedIndex] : Container(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black87,
        selectedItemColor: const Color(0xFF80CBC4),
        unselectedItemColor: Colors.white70,
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_bag_outlined),
            label: 'Topup',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            label: 'Chatbot',
          ),
        ],
      ),
    );
  }
}

