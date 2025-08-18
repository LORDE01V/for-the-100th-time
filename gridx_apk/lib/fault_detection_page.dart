import 'package:flutter/material.dart';
import 'dart:ui';

class FaultDetectionPage extends StatefulWidget {
  const FaultDetectionPage({super.key});

  @override
  State<FaultDetectionPage> createState() => _FaultDetectionPageState();
}

class _FaultDetectionPageState extends State<FaultDetectionPage> {
  bool _faultDetected = false; // Mock fault status
  String _faultMessage = "";
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkSystemStatus();
  }

  void _checkSystemStatus() async {
    setState(() {
      _isLoading = true;
      _faultDetected = false;
      _faultMessage = "Checking system for faults...";
    });

    // Simulate API call for fault detection
    await Future.delayed(const Duration(seconds: 3));

    // Mock fault detection logic
    final bool detected = DateTime.now().second % 2 == 0; // Simulate random detection

    setState(() {
      _faultDetected = detected;
      _faultMessage = detected
          ? "Fault detected! Please contact support." // You can customize this message
          : "No faults detected. System is running smoothly.";
      _isLoading = false;
    });

    if (!mounted) return; // Added mounted check
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(_faultMessage)),
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
                          "Fault Detection",
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
                          "Monitor your system for any anomalies.",
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
                            "System Status:",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 15),
                          Center(
                            child: _isLoading
                                ? const CircularProgressIndicator(color: Color(0xFF80CBC4))
                                : Column(
                                    children: <Widget>[
                                      Icon(
                                        _faultDetected ? Icons.warning : Icons.check_circle,
                                        color: _faultDetected ? Colors.redAccent : Colors.greenAccent,
                                        size: 80,
                                      ),
                                      const SizedBox(height: 20),
                                      Text(
                                        _faultMessage,
                                        style: TextStyle(
                                          color: _faultDetected ? Colors.redAccent : Colors.greenAccent,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 30),
                                      ElevatedButton.icon(
                                        onPressed: _isLoading ? null : _checkSystemStatus,
                                        icon: const Icon(Icons.refresh, color: Colors.black),
                                        label: Text(
                                          _isLoading ? "Checking..." : "Re-check Status",
                                          style: const TextStyle(
                                            color: Colors.black,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF80CBC4),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(30.0),
                                          ),
                                          padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
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
}
