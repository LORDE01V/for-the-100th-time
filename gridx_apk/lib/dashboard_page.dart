import 'package:flutter/material.dart';
import 'dart:ui';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _isLoading = false;

  // Mock data for recommended plan
  Map<String, dynamic>? _recommendedPlan;
  final List<Map<String, dynamic>> _subscriptionPlans = const [
    {'id': 'basic-lite', 'name': 'Basic Lite', 'price': 29.0, 'description': 'Essential features'},
    {'id': 'basic', 'name': 'Basic', 'price': 49.0, 'description': 'More features'},
    {'id': 'premium', 'name': 'Premium', 'price': 149.0, 'description': 'All features'},
  ];

  // Mock function to suggest a plan
  void _suggestPlan() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));

    // Simple mock logic for plan suggestion
    final mockData = {'budget': 70.0};
    _recommendedPlan = _subscriptionPlans.firstWhere(
      (plan) => plan['price'] <= mockData['budget'],
      orElse: () => _subscriptionPlans.first, // Default to basic if none match budget
    );

    setState(() {
      _isLoading = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Recommended: ${_recommendedPlan!['name']} plan!")),
    );
  }

  // Placeholder widgets for dashboard components
  Widget _buildGlassCard({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color.fromARGB(46, 173, 216, 230), // arcticBlue.bg equivalent (opacity 0.18)
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(color: const Color.fromARGB(89, 173, 216, 230), width: 2), // arcticBlue.borderColor equivalent
        boxShadow: const [
          BoxShadow(
            color: Color.fromARGB(46, 31, 38, 135), // arcticBlue.boxShadow equivalent
            blurRadius: 32.0,
            spreadRadius: 0.0,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20.0),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16.0, sigmaY: 16.0),
          child: child,
        ),
      ),
    );
  }

  Widget _buildDashboardItem(String title, String content) {
    return _buildGlassCard(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              content,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconText(IconData icon, String text) {
    return Row(
      children: <Widget>[
        Icon(icon, color: Colors.white70, size: 16),
        const SizedBox(width: 5),
        Text(text, style: const TextStyle(color: Colors.white70, fontSize: 14)),
      ],
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
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color.fromARGB(115, 0, 0, 0), // rgba(0,0,0,0.45)
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      child: Column(
                        children: const <Widget>[
                          Text(
                            "Energy Dashboard",
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
                            "Take control of your energy and discover ways to optimize your usage for a sustainable future!",
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
                  ),
                  const SizedBox(height: 30),
                  Center(
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _suggestPlan,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF80CBC4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                      ),
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.black)
                          : const Text(
                              "Suggest Plan",
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  // Dashboard Widgets Grid
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2, // Adjust as needed for responsive layout
                    crossAxisSpacing: 24,
                    mainAxisSpacing: 24,
                    childAspectRatio: 1.2, // Adjust as needed for widget proportions
                    children: <Widget>[
                      // Recommended Plan Card
                      _buildGlassCard(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                "Recommended Plan: ${_recommendedPlan != null ? _recommendedPlan!['name'] : 'None'}",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (_recommendedPlan != null) ...[
                                const SizedBox(height: 8),
                                Text("Description: ${_recommendedPlan!['description']}", style: const TextStyle(color: Colors.white70, fontSize: 14)),
                                Text("Price: R${_recommendedPlan!['price']?.toStringAsFixed(2)}", style: const TextStyle(color: Colors.greenAccent, fontSize: 16, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                const Text("Features:", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                                if (_recommendedPlan!['features'] != null) 
                                  ...( _recommendedPlan!['features'] as List<dynamic>).map((feature) => _buildIconText(Icons.check_circle_outline, feature.toString())),
                              ],
                            ],
                          ),
                        ),
                      ),
                      _buildDashboardItem("Energy Mode", "Optimized for savings."),
                      _buildDashboardItem("Budget Dial", "R350 / R500 spent."),
                      _buildDashboardItem("Daily Forecast", "Sunny with high solar output."),
                      _buildDashboardItem("Solar Output", "15 kWh generated today."),
                      _buildDashboardItem("AI Tips", "Reduce standby power consumption."),
                      _buildDashboardItem("Activity Report", "View your detailed energy usage."),
                      _buildDashboardItem("Fault Detection", "No faults detected."),
                      _buildDashboardItem("Fault Visualization", "Visual representation of system health."),
                      // Add more dashboard items as needed
                    ],
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
