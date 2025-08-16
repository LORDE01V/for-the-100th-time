import 'package:flutter/material.dart';
import 'dart:ui';

class GroupBuyingPage extends StatefulWidget {
  const GroupBuyingPage({super.key});

  @override
  State<GroupBuyingPage> createState() => _GroupBuyingPageState();
}

class _GroupBuyingPageState extends State<GroupBuyingPage> {
  // Mock data for campaigns
  final List<Map<String, dynamic>> _campaigns = [
    {
      'id': 1,
      'product': 'Solar Panel Kit 5kW',
      'image': 'assets/images/solar_panel_kit.png', // Placeholder image
      'originalPrice': 45000.00,
      'groupPrice': 38000.00,
      'participants': 25,
      'goal': 50,
      'timeLeft': '5 days left',
    },
    {
      'id': 2,
      'product': 'Energy Storage Battery 10kWh',
      'image': 'assets/images/battery_bank.png', // Placeholder image
      'originalPrice': 60000.00,
      'groupPrice': 50000.00,
      'participants': 10,
      'goal': 30,
      'timeLeft': '10 days left',
    },
    {
      'id': 3,
      'product': 'Smart Home Energy Monitor',
      'image': 'assets/images/energy_monitor.png', // Placeholder image
      'originalPrice': 2500.00,
      'groupPrice': 2000.00,
      'participants': 40,
      'goal': 100,
      'timeLeft': '2 days left',
    },
  ];

  double _getProgress(Map<String, dynamic> campaign) {
    return (campaign['participants'] / campaign['goal']) * 100;
  }

  void _openNewCampaignDialog() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Start New Campaign functionality will go here!")),
    );
  }

  void _joinCampaign(int id) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Joined campaign $id!")),
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
                      children: [
                        Text(
                          "Group Buying Campaigns",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: _openNewCampaignDialog,
                          icon: const Icon(Icons.add, color: Colors.black), // Icon color
                          label: const Text(
                            "Start New Campaign",
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
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),

                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, // Two columns
                      crossAxisSpacing: 15,
                      mainAxisSpacing: 15,
                      childAspectRatio: 0.8,
                    ),
                    itemCount: _campaigns.length,
                    itemBuilder: (context, index) {
                      final campaign = _campaigns[index];
                      return Card(
                        color: Colors.white.withOpacity(0.1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        child: InkWell(
                          onTap: () => _joinCampaign(campaign['id']),
                          borderRadius: BorderRadius.circular(15.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(15.0)),
                                child: Image.asset(
                                  campaign['image'],
                                  height: 120,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text(
                                      campaign['product'],
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 5),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: <Widget>[
                                        Text(
                                          "R${campaign['originalPrice'].toStringAsFixed(2)}",
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 14,
                                            decoration: TextDecoration.lineThrough,
                                          ),
                                        ),
                                        Text(
                                          "R${campaign['groupPrice'].toStringAsFixed(2)}",
                                          style: const TextStyle(
                                            color: Colors.greenAccent,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      "${campaign['participants']}/${campaign['goal']} joined",
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 5),
                                    LinearProgressIndicator(
                                      value: _getProgress(campaign) / 100,
                                      backgroundColor: Colors.grey[700],
                                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.greenAccent),
                                    ),
                                    const SizedBox(height: 5),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: Text(
                                        campaign['timeLeft'],
                                        style: const TextStyle(
                                          color: Colors.white54,
                                          fontSize: 12,
                                        ),
                                      ),
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
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
