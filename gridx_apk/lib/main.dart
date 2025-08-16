import 'package:flutter/material.dart';
import 'dart:ui'; // Added for BackdropFilter
import 'dart:async'; // Added for Timer
import 'package:gridx_apk/sign_in_screen.dart'; // Import SignInScreen
import 'package:gridx_apk/sign_up_screen.dart'; // Import SignUpScreen

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
      home: const WelcomeScreen(),
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
  late Animation<double> _animation;
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    );

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
              color: const Color.fromARGB(77, 0, 0, 0), // Adjust opacity as needed
            ),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  const Spacer(flex: 3),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 60,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Montserrat',
                      ),
                      children: <TextSpan>[
                        TextSpan(text: 'Grid'),
                        TextSpan(
                          text: 'X',
                          style: TextStyle(color: Color(0xFFB2EBF2)), // Light blue for 'X'
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 5),
                  SizedBox(
                    height: 60, // Fixed height to prevent movement
                    child: FadeTransition(
                      opacity: _animation,
                      child: Text(
                        _messages[_currentIndex % _messages.length],
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 20, // Reduced font size to fit two lines
                          fontFamily: 'Montserrat',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 40, // Fixed height for the greeting to prevent movement
                    child: FadeTransition(
                      opacity: _animation,
                      child: Text(
                        _greetings[_currentIndex % _greetings.length],
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 30, // Reduced font size
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Montserrat',
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 50),
                  Container(
                    width: double.infinity,
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF80CBC4), Color(0xFFB2EBF2)], // Light blue-green gradient
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const SignInScreen()));
                        },
                        borderRadius: BorderRadius.circular(30.0),
                        child: const Center(
                          child: Text(
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
                  const Text(
                    "OR SIGN IN WITH",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    width: 50,
                    height: 50,
                    decoration: const BoxDecoration(
                      color: Colors.white10,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.email, color: Colors.white),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const SignInScreen()));
                      },
                    ),
                  ),
                  const Spacer(flex: 2),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      const Text(
                        "DIDN'T HAVE ACCOUNT?",
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
                          " SIGN UP NOW",
                          style: TextStyle(
                            color: Color(0xFF80CBC4), // Matching the new sign in button color
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(flex: 1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
