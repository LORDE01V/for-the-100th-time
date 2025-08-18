import 'package:flutter/material.dart';
import 'dart:ui';

class SubscriptionPage extends StatefulWidget {
  const SubscriptionPage({super.key});

  @override
  State<SubscriptionPage> createState() => _SubscriptionPageState();
}

class _SubscriptionPageState extends State<SubscriptionPage> {
  // Mock data for subscription plans
  final List<Map<String, dynamic>> _plans = const [
    {
      'name': 'Basic',
      'description': 'Essential features for everyday energy monitoring.',
      'price': 'R50',
      'features': [
        'Real-time energy tracking',
        'Basic analytics',
        'Email notifications',
      ],
    },
    {
      'name': 'Premium',
      'description': 'Advanced insights and priority support.',
      'price': 'R150',
      'features': [
        'All Basic features',
        'Detailed energy reports',
        'AI-powered suggestions',
        '24/7 priority support',
      ],
    },
    {
      'name': 'Pro',
      'description': 'Comprehensive control and exclusive benefits.',
      'price': 'R300',
      'features': [
        'All Premium features',
        'Smart appliance integration',
        'Load shedding predictions',
        'Dedicated account manager',
      ],
    },
  ];

  Map<String, dynamic>? _selectedPlan;
  bool _loading = false;

  void _selectPlan(Map<String, dynamic> plan) {
    setState(() {
      _selectedPlan = plan;
    });
  }

  void _onSubscribe() async {
    if (_selectedPlan == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a plan first.")),
      );
      return;
    }

    setState(() {
      _loading = true;
    });

    // Simulate subscription process
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _loading = false;
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Successfully subscribed to ${_selectedPlan!['name']} plan!")),
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
                          "Choose Your Subscription Plan",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 30),
                      ],
                    ),
                  ),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 1, // One column per plan initially for mobile, adjusts with responsive design
                      crossAxisSpacing: 15,
                      mainAxisSpacing: 15,
                      childAspectRatio: 1.0, // Adjust as needed
                    ),
                    itemCount: _plans.length,
                    itemBuilder: (context, index) {
                      final plan = _plans[index];
                      final isSelected = _selectedPlan == plan;
                      return Card(
                        color: isSelected ? const Color.fromARGB(50, 128, 203, 196) : Color.fromARGB(25, 255, 255, 255),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                          side: isSelected ? const BorderSide(color: Color(0xFF80CBC4), width: 2) : BorderSide.none,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                plan['name'],
                                style: TextStyle(
                                  color: isSelected ? Colors.black : Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                plan['description'],
                                style: TextStyle(
                                  color: isSelected ? Colors.black54 : Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 15),
                              Text(
                                "${plan['price']} / month",
                                style: TextStyle(
                                  color: isSelected ? Colors.black : Colors.greenAccent,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 15),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: (plan['features'] as List<String>).map((feature) => Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 2.0),
                                  child: Row(
                                    children: [
                                      Icon(Icons.check_circle_outline, color: isSelected ? Colors.black54 : Colors.greenAccent, size: 18),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          feature,
                                          style: TextStyle(color: isSelected ? Colors.black : Colors.white70, fontSize: 14),
                                        ),
                                      ),
                                    ],
                                  ),
                                )).toList(),
                              ),
                              const Spacer(),
                              Center(
                                child: ElevatedButton(
                                  onPressed: isSelected ? null : () => _selectPlan(plan),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isSelected ? Colors.grey : const Color(0xFF80CBC4),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(30.0),
                                    ),
                                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                                  ),
                                  child: Text(
                                    isSelected ? "Selected" : "Select Plan",
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 30),
                  Center(
                    child: ElevatedButton(
                      onPressed: _selectedPlan == null || _loading ? null : _onSubscribe,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF80CBC4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                      ),
                      child: _loading
                          ? const CircularProgressIndicator(color: Colors.black)
                          : const Text(
                              "Subscribe Now",
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
        ],
      ),
    );
  }
}
