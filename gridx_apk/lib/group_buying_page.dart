import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http; // Import for HTTP requests
import 'dart:convert'; // Import for JSON encoding/decoding

// --- Models ---
class Campaign {
  final int id;
  final String product;
  final String image;
  final int originalPrice;
  final int groupPrice;
  final int goal;
  int participants;
  final String deadline;
  final String description;
  final String timeLeft;
  final String category;
  final IconData icon;
  final List<Milestone> milestones;

  Campaign({
    required this.id,
    required this.product,
    required this.image,
    required this.originalPrice,
    required this.groupPrice,
    required this.goal,
    required this.participants,
    required this.deadline,
    required this.description,
    required this.timeLeft,
    required this.category,
    required this.icon,
    required this.milestones,
  });

  factory Campaign.fromJson(Map<String, dynamic> json) {
    return Campaign(
      id: json['id'],
      product: json['product'],
      image: json['image'],
      originalPrice: json['original_price'],
      groupPrice: json['group_price'],
      goal: json['goal'],
      participants: json['participants'],
      deadline: json['deadline'],
      description: json['description'],
      timeLeft: json['time_left'],
      category: json['category'],
      icon: FontAwesomeIcons.solarPanel, // Default icon, adjust as needed
      milestones: (json['milestones'] as List<dynamic>?)
          ?.map((m) => Milestone.fromJson(m))
          .toList() ??
          [],
    );
  }
}

class Milestone {
  final int price;
  final int participants;

  Milestone({required this.price, required this.participants});

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      price: json['price'],
      participants: json['participants'],
    );
  }
}

class Testimonial {
  final String name;
  final String savings;
  final String text;
  final String location;
  final String avatar;

  Testimonial({
    required this.name,
    required this.savings,
    required this.text,
    required this.location,
    required this.avatar,
  });
}

class NewCampaign {
  String product = '';
  String description = '';
  double originalPrice = 0;
  double groupPrice = 0;
  int targetBuyers = 10;
  String deadline = '';
  String? image;
  String category = 'Solar Panels';
}

// --- Main State Management Class (Provider) ---
class GroupBuyingState extends ChangeNotifier {
  List<Campaign> _ongoingCampaigns = []; // Initialize as empty
  bool _isLoading = false;
  String _errorMessage = '';

  List<Campaign> get ongoingCampaigns => _ongoingCampaigns;
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;

  GroupBuyingState() {
    fetchCampaigns(); // Fetch campaigns on initialization
  }

  Future<void> fetchCampaigns() async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('http://10.0.2.2:5000/api/groupbuying/campaigns'));
      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        _ongoingCampaigns = data.map((json) => Campaign.fromJson(json)).toList();
      } else {
        _errorMessage = 'Failed to load campaigns: ${response.statusCode}';
      }
    } catch (e) {
      _errorMessage = 'Error fetching campaigns: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> joinCampaign(int campaignId) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/groupbuying/campaigns/$campaignId/join'),
      );
      if (response.statusCode == 200) {
        // After joining, re-fetch all campaigns to update the list and UI
        await fetchCampaigns();
      } else {
        _errorMessage = 'Failed to join campaign: ${response.statusCode}';
      }
    } catch (e) {
      _errorMessage = 'Error joining campaign: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addCampaign(Campaign newCampaign) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/groupbuying/campaigns'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'product': newCampaign.product,
          'image': newCampaign.image,
          'originalPrice': newCampaign.originalPrice,
          'groupPrice': newCampaign.groupPrice,
          'goal': newCampaign.goal,
          'deadline': newCampaign.deadline,
          'description': newCampaign.description,
          'category': newCampaign.category,
          'milestones': newCampaign.milestones.map((m) => {'price': m.price, 'participants': m.participants}).toList(),
        }),
      );

      if (response.statusCode == 201) {
        // After adding, re-fetch all campaigns to update the list and UI
        await fetchCampaigns();
      } else {
        _errorMessage = 'Failed to create campaign: ${response.statusCode}';
      }
    } catch (e) {
      _errorMessage = 'Error creating campaign: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

// --- Main App Widget ---
// void main() {
//   runApp(
//     ChangeNotifierProvider(
//       create: (context) => GroupBuyingState(),
//       child: const GroupBuyingApp(),
//     ),
//   );
// }

class GroupBuyingApp extends StatelessWidget {
  const GroupBuyingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const GroupBuyingPage(),
    );
  }
}

// --- The Main Group Buying Page Widget ---
class GroupBuyingPage extends StatefulWidget {
  const GroupBuyingPage({super.key});

  @override
  State<GroupBuyingPage> createState() => _GroupBuyingPageState();
}

class _GroupBuyingPageState extends State<GroupBuyingPage> {
  final List<String> motivationalLines = const [
    "Unlock exclusive savings by joining forces with other buyers!",
    "Group buying: the smart way to go solar and save big!",
    "Lower your costs, increase your impact – together we power change.",
    "Get premium solar gear at unbeatable group prices.",
    "Join a campaign and step closer to energy independence.",
    "Your next energy upgrade is more affordable with group power.",
    "Connect with fellow solar enthusiasts and save together.",
    "Every participant helps drive down the price for everyone.",
    "Don't miss out on limited-time group buying opportunities.",
    "Investing in solar is easier and cheaper in a group.",
  ];

  String currentMotivationalLine = '';
  late String referralCode;

  @override
  void initState() {
    super.initState();
    // Initialize state like in React's `useState` and `useMemo`
    referralCode = 'REF-${(Random().nextDouble() * 100000).toStringAsFixed(0)}'.toUpperCase();
    currentMotivationalLine = motivationalLines[0];

    // Simulating React's useEffect with an interval
    Future.delayed(const Duration(seconds: 7), () {
      _rotateMotivationalLine();
    });
  }

  void _rotateMotivationalLine() {
    setState(() {
      int nextIndex = (motivationalLines.indexOf(currentMotivationalLine) + 1) % motivationalLines.length;
      currentMotivationalLine = motivationalLines[nextIndex];
    });
    Future.delayed(const Duration(seconds: 7), () {
      _rotateMotivationalLine();
    });
  }

  void _showCreateCampaignModal() {
    showDialog(
      context: context,
      builder: (context) => CreateCampaignModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
            image: AssetImage('assets/images/group_buying.png'),
                fit: BoxFit.cover,
              ),
            ),
            child: Container(
          color: Colors.black.withValues(alpha: 0.25), // Overlay color
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                  const SizedBox(height: 20),
                  const BackButton(),
                  const SizedBox(height: 20),

                  // Header Section
                        Text(
                    'Group Buying Campaigns',
                    textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                      color: isDarkMode ? Colors.white : Colors.grey.shade800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Join forces to save on solar gear and make energy more affordable for everyone!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: isDarkMode ? Colors.grey.shade400 : Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 20),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 500),
                    transitionBuilder: (Widget child, Animation<double> animation) {
                      return FadeTransition(opacity: animation, child: child);
                    },
                    child: Text(
                      currentMotivationalLine,
                      key: ValueKey<String>(currentMotivationalLine),
                      textAlign: TextAlign.center,
                            style: TextStyle(
                        fontSize: 18,
                        color: isDarkMode ? Colors.white : Colors.grey.shade800,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Trust Panel
                  const TrustPanel(),
                  const SizedBox(height: 20),

                  // Savings Calculator
                  const SavingsCalculator(),
                  const SizedBox(height: 20),

                  // Campaigns List
                  Consumer<GroupBuyingState>(
                    builder: (context, state, child) {
                      return GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        itemCount: state.ongoingCampaigns.length,
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3, // Changed to 3
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.6,
                        ),
                        itemBuilder: (context, index) {
                          final campaign = state.ongoingCampaigns[index];
                          return CampaignCard(
                            campaign: campaign,
                            onCampaignAction: (message) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(message)),
                              );
                            },
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 40),

                  // Create Campaign Button
                  ElevatedButton.icon(
                    onPressed: _showCreateCampaignModal,
                    icon: const Icon(FontAwesomeIcons.solarPanel),
                    label: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16.0),
                      child: Text('Create New Campaign'),
                          ),
                          style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.teal,
                            shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      textStyle: const TextStyle(fontSize: 18),
                      elevation: 8,
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Referral Section
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade800,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Earn R500 Credit',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Share your referral code and get R100 credit for each friend who joins a campaign',
                          style: TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  referralCode,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              onPressed: () {
                                Clipboard.setData(ClipboardData(text: referralCode));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Referral code copied!')),
                                );
                              },
                              icon: const Icon(FontAwesomeIcons.solidShareFromSquare, size: 16),
                              label: const Text('Share'),
                              style: ElevatedButton.styleFrom(
                                foregroundColor: Colors.black,
                                backgroundColor: Colors.white,
                          ),
                        ),
                      ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Testimonial Carousel
                  TestimonialCarousel(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// --- Card Widgets and Components ---
class TrustPanel extends StatelessWidget {
  const TrustPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDarkMode ? Colors.black.withValues(alpha: 0.4) : Colors.white.withValues(alpha: 0.2);
    final borderColor = isDarkMode ? Colors.grey.shade600 : Colors.grey.shade200;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildMetric('Supplier Rating', '4.8/5', isDarkMode),
            _buildMetric('Delivery Success', '94%', isDarkMode),
            _buildMetric('Dispute Resolution', '24h', isDarkMode),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, bool isDarkMode) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: isDarkMode ? Colors.white70 : Colors.grey),
        ),
        const SizedBox(height: 4),
                                    Text(
          value,
          style: TextStyle(
            fontSize: 20,
                                        fontWeight: FontWeight.bold,
            color: isDarkMode ? Colors.white : Colors.black,
          ),
        ),
      ],
    );
  }
}

class SavingsCalculator extends StatefulWidget {
  const SavingsCalculator({super.key});

  @override
  SavingsCalculatorState createState() => SavingsCalculatorState();
}

class SavingsCalculatorState extends State<SavingsCalculator> {
  int selectedCampaignId = 1;
  double systemSize = 5;
  final int monthlyUsage = 500;

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDarkMode ? Colors.black.withValues(alpha: 0.4) : Colors.white.withValues(alpha: 0.2);

    final campaigns = Provider.of<GroupBuyingState>(context, listen: false).ongoingCampaigns;
    final selectedCampaign = campaigns.firstWhere((c) => c.id == selectedCampaignId);
    final savingsPerUnit = (selectedCampaign.originalPrice - selectedCampaign.groupPrice).toDouble();
    final yearlySavings = (monthlyUsage * 0.95 * systemSize * savingsPerUnit) / 100;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Advanced Savings Calculator',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<int>(
                  initialValue: selectedCampaignId,
                  decoration: const InputDecoration(
                    labelText: 'Select Campaign',
                    border: OutlineInputBorder(),
                  ),
                  items: campaigns.map((campaign) {
                    return DropdownMenuItem(
                      value: campaign.id,
                      child: Text(campaign.product),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        selectedCampaignId = value;
                      });
                    }
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  initialValue: systemSize.toString(),
                  decoration: const InputDecoration(
                    labelText: 'System Size (kW)',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                  onChanged: (value) {
                    setState(() {
                      systemSize = double.tryParse(value) ?? 0;
                    });
                  },
                                          ),
                                        ),
                                      ],
                                    ),
          const SizedBox(height: 16),
          Text(
            'Projected 5-Year Savings:',
            style: TextStyle(color: isDarkMode ? Colors.grey.shade400 : Colors.grey.shade600),
          ),
                                    Text(
            'R${(yearlySavings * 5).toStringAsFixed(0)}',
                                      style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.green,
            ),
          ),
          Text(
            '${systemSize.toStringAsFixed(1)}kW system | ${monthlyUsage}kWh/month',
            style: TextStyle(fontSize: 12, color: isDarkMode ? Colors.grey.shade500 : Colors.grey.shade400),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDarkMode ? Colors.black.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Savings Breakdown:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Unit Price Saving:'),
                    Text('R${savingsPerUnit.toStringAsFixed(0)}'),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total System Saving:'),
                    Text('R${(savingsPerUnit * systemSize).toStringAsFixed(0)}'),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Annual Energy Saving:'),
                    Text('R${yearlySavings.toStringAsFixed(0)}'),
                  ],
                                    ),
                                  ],
                                ),
          ),
        ],
      ),
    );
  }
}

class TestimonialCarousel extends StatelessWidget {
  TestimonialCarousel({super.key});

  final List<Testimonial> testimonials = [
    Testimonial(
      name: "Lihle M.",
      savings: "R12,400",
      text: "Joined a battery campaign and saved enough to power my entire home!",
      location: "Johannesburg",
      avatar: "assets/avatars/avatar1.png", // Replace with your own assets
    ),
    Testimonial(
      name: "Kgosi T.",
      savings: "R8,200",
      text: "The group buying process was smooth and the support team helped with all my questions.",
      location: "Pretoria",
      avatar: "assets/avatars/avatar2.png",
    ),
    Testimonial(
      name: "Zanele S.",
      savings: "R5,600",
      text: "Never thought solar could be this affordable until I found these group deals.",
      location: "Cape Town",
      avatar: "assets/avatars/avatar3.png",
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          'Verified Buyer Stories',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        Column(
          children: testimonials.map((testimonial) {
            return Card(
              margin: const EdgeInsets.only(bottom: 24),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundImage: AssetImage(testimonial.avatar),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '"${testimonial.text}"',
                      style: const TextStyle(fontSize: 18, fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      testimonial.name,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Chip(
                      label: Text('Saved ${testimonial.savings}'),
                      backgroundColor: Colors.green.shade200,
                              ),
                            ],
                          ),
                        ),
                      );
          }).toList(),
        ),
      ],
    );
  }
}

class CreateCampaignModal extends StatefulWidget {
  const CreateCampaignModal({super.key});

  @override
  CreateCampaignModalState createState() => CreateCampaignModalState();
}

class CreateCampaignModalState extends State<CreateCampaignModal> {
  final NewCampaign newCampaign = NewCampaign();
  final _formKey = GlobalKey<FormState>();
  bool _isCreating = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create New Solar Campaign'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Product Name'),
                onChanged: (value) => newCampaign.product = value,
                validator: (value) => value!.isEmpty ? 'Please enter a product name' : null,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Product Description'),
                onChanged: (value) => newCampaign.description = value,
                maxLines: 3,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Original Price (R)'),
                keyboardType: TextInputType.number,
                onChanged: (value) => newCampaign.originalPrice = double.tryParse(value) ?? 0,
                validator: (value) => value!.isEmpty || double.tryParse(value) == null ? 'Please enter a valid number' : null,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Group Price (R)'),
                keyboardType: TextInputType.number,
                onChanged: (value) => newCampaign.groupPrice = double.tryParse(value) ?? 0,
                validator: (value) => value!.isEmpty || double.tryParse(value) == null ? 'Please enter a valid number' : null,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Target Buyers'),
                keyboardType: TextInputType.number,
                onChanged: (value) => newCampaign.targetBuyers = int.tryParse(value) ?? 0,
                validator: (value) => value!.isEmpty || int.tryParse(value)! <= 0 ? 'Please enter a valid goal' : null,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isCreating ? null : () async {
            if (_formKey.currentState!.validate()) {
              setState(() {
                _isCreating = true;
              });
              final groupBuyingState = Provider.of<GroupBuyingState>(context, listen: false);
              final campaign = Campaign(
                id: groupBuyingState.ongoingCampaigns.length + 1, // This ID will be replaced by backend ID
                product: newCampaign.product,
                image: 'assets/images/solar_panel.png', // Mock image for new campaign
                originalPrice: newCampaign.originalPrice.toInt(),
                groupPrice: newCampaign.groupPrice.toInt(),
                goal: newCampaign.targetBuyers,
                participants: 0,
                deadline: '2025-01-01',
                description: newCampaign.description,
                timeLeft: 'Just started!',
                category: newCampaign.category,
                icon: FontAwesomeIcons.solarPanel,
                milestones: [
                  Milestone(price: newCampaign.groupPrice.toInt(), participants: newCampaign.targetBuyers),
                ],
              );
              await groupBuyingState.addCampaign(campaign);
              setState(() {
                _isCreating = false;
              });
              if (groupBuyingState.errorMessage.isEmpty) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Campaign created successfully!')),
                );
                if (!mounted) return;
                Navigator.of(context).pop();
              } else {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Failed to create campaign: ${groupBuyingState.errorMessage}')),
                );
              }
            }
          },
          child: _isCreating ? const CircularProgressIndicator() : const Text('Create'),
        ),
      ],
    );
  }
}

class CampaignCard extends StatelessWidget {
  final Campaign campaign;
  final Function(String) onCampaignAction;

  const CampaignCard({super.key, required this.campaign, required this.onCampaignAction});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final cardBgColor = isDarkMode ? Colors.black.withValues(alpha: 0.6) : Colors.white.withValues(alpha: 0.15);
    final cardColor = isDarkMode ? Colors.white : Colors.grey.shade800;

    final progressValue = (campaign.participants / campaign.goal) * 100;
    final savingsPercentage = ((campaign.originalPrice - campaign.groupPrice) / campaign.originalPrice * 100).toStringAsFixed(0);

    return Card(
      elevation: 8,
      color: cardBgColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.18)),
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                campaign.image,
                height: 180,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const SizedBox(
                  height: 180,
                  child: Center(child: Text('Image not found', textAlign: TextAlign.center)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              campaign.product,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: cardColor),)
            ,
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(FontAwesomeIcons.tag, size: 16, color: cardColor),
                const SizedBox(width: 8),
                Text(
                  'Original: R${campaign.originalPrice}',
                  style: TextStyle(color: cardColor),)
                ,
                if (savingsPercentage != '0') ...[
                  const Spacer(),
                  Chip(
                    label: Text('Save $savingsPercentage%'),
                    backgroundColor: Colors.green.shade200,
                  ),
                ],
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Group Price: R${campaign.groupPrice}',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              campaign.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: cardColor),)
            ,
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(FontAwesomeIcons.users, size: 16, color: cardColor),
                const SizedBox(width: 8),
                Text(
                  '${campaign.participants} of ${campaign.goal} joined',
                  style: TextStyle(color: cardColor),)
                ,
              ],
            ),
            const SizedBox(height: 8),
            ThermometerProgress(progress: progressValue, goal: campaign.goal),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(FontAwesomeIcons.clock, size: 16, color: cardColor),
                const SizedBox(width: 8),
                Text(
                  campaign.timeLeft,
                  style: TextStyle(color: cardColor),)
                ,
              ],
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: campaign.participants >= campaign.goal ||
                      Provider.of<GroupBuyingState>(context).isLoading
                  ? null
                  : () async {
                final groupBuyingState = Provider.of<GroupBuyingState>(context, listen: false);
                await groupBuyingState.joinCampaign(campaign.id);
                if (groupBuyingState.errorMessage.isEmpty) {
                  onCampaignAction('Joined Campaign!');
                } else {
                  onCampaignAction('Failed to join campaign: ${groupBuyingState.errorMessage}');
                }
              },
              style: ElevatedButton.styleFrom(
                foregroundColor: Colors.white,
                backgroundColor: Colors.green,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Provider.of<GroupBuyingState>(context).isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(
                campaign.participants >= campaign.goal ? 'Goal Reached!' : 'Join Campaign',
              ),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () {
                // Handle AR Preview logic here, perhaps another dialog
              },
              icon: const Icon(FontAwesomeIcons.glasses, size: 16),
              label: const Text('AR Preview'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.purple,
                side: BorderSide(color: Colors.purple.shade400),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 16),
            PriceHistoryChart(campaign: campaign),
          ],
        ),
      ),
    );
  }
}

class ThermometerProgress extends StatelessWidget {
  final double progress;
  final int goal;

  const ThermometerProgress({super.key, required this.progress, required this.goal});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 20,
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        AnimatedContainer(
          duration: const Duration(milliseconds: 500),
          height: 20,
          width: MediaQuery.of(context).size.width * (progress / 100),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Colors.blue, Colors.green],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        Positioned(
          right: 10,
          top: 0,
          bottom: 0,
          child: Center(
            child: Text(
              '${progress.toStringAsFixed(0)}%',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}

class PriceHistoryChart extends StatelessWidget {
  final Campaign campaign;

  const PriceHistoryChart({super.key, required this.campaign});

  List<FlSpot> _generateData() {
    final basePrice = campaign.originalPrice.toDouble();
    return List.generate(7, (i) {
      return FlSpot(
        i.toDouble(),
        basePrice - ((basePrice - campaign.groupPrice) * (i / 6)) + (Random().nextDouble() * (basePrice * 0.05)),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.dark ? Colors.black.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Price Evolution',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: LineChart(
              LineChartData(
                minX: 0,
                maxX: 6,
                minY: campaign.groupPrice.toDouble() - (campaign.originalPrice - campaign.groupPrice) / 2,
                maxY: campaign.originalPrice.toDouble() + (campaign.originalPrice - campaign.groupPrice) / 2,
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: const FlTitlesData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: _generateData(),
                    isCurved: true,
                    color: Colors.green.shade400,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(show: false),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Predicted final price: R${campaign.groupPrice.toStringAsFixed(0)} (Current discount: ${((campaign.originalPrice - campaign.groupPrice) / campaign.originalPrice * 100).toStringAsFixed(1)}%) ',
            style: TextStyle(fontSize: 12, color: Theme.of(context).brightness == Brightness.dark ? Colors.grey.shade400 : Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}
