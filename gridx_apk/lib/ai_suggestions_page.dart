import 'package:flutter/material.dart';
import 'dart:ui';

class AiSuggestionsPage extends StatefulWidget {
  const AiSuggestionsPage({super.key});

  @override
  State<AiSuggestionsPage> createState() => _AiSuggestionsPageState();
}

class _AiSuggestionsPageState extends State<AiSuggestionsPage> {
  // Mock data for suggestions
  final List<Map<String, dynamic>> _suggestions = [
    {
      'id': 1,
      'title': "Optimize Solar Usage",
      'description': "Shift high-consumption activities to daylight hours to maximize solar energy utilization.",
      'category': "Energy Saving",
      'votes': 45,
      'priority': "high",
      'estimated_savings': 120.50,
    },
    {
      'id': 2,
      'title': "Check for Phantom Loads",
      'description': "Unplug electronics when not in use to eliminate phantom load and save electricity.",
      'category': "Energy Saving",
      'votes': 30,
      'priority': "medium",
      'estimated_savings': 50.25,
    },
    {
      'id': 3,
      'title': "Insulate Your Home",
      'description': "Improve home insulation to reduce heating and cooling costs significantly.",
      'category': "Upgrades",
      'votes': 55,
      'priority': "high",
      'estimated_savings': 200.00,
    },
    {
      'id': 4,
      'title': "Schedule Appliance Usage",
      'description': "Run large appliances like washing machines and dishwashers during off-peak hours.",
      'category': "Energy Saving",
      'votes': 20,
      'priority': "low",
      'estimated_savings': 30.75,
    },
    {
      'id': 5,
      'title': "Regular Solar Panel Cleaning",
      'description': "Clean your solar panels regularly to maintain optimal efficiency and power generation.",
      'category': "Maintenance",
      'votes': 38,
      'priority': "medium",
      'estimated_savings': 80.00,
    },
  ];

  List<Map<String, dynamic>> _filteredSuggestions = [];
  String _searchTerm = '';
  String _activeCategory = "All";
  bool _sortByVotes = true;

  @override
  void initState() {
    super.initState();
    _filteredSuggestions = _suggestions;
  }

  void _handleSearch(String term) {
    setState(() {
      _searchTerm = term;
      _filterSuggestions();
    });
  }

  void _handleCategoryChange(String category) {
    setState(() {
      _activeCategory = category;
      _filterSuggestions();
    });
  }

  void _filterSuggestions() {
    List<Map<String, dynamic>> tempSuggestions = _suggestions.where((s) {
      final String title = s['title'].toLowerCase();
      final String description = s['description'].toLowerCase();
      final String searchTermLower = _searchTerm.toLowerCase();
      return (title.contains(searchTermLower) ||
              description.contains(searchTermLower)) &&
          (_activeCategory == "All" || s['category'] == _activeCategory);
    }).toList();

    if (_sortByVotes) {
      tempSuggestions.sort((a, b) => (b['votes'] as int).compareTo(a['votes'] as int));
    } else {
      // For simplicity, let's sort by title if not by votes (in real app, use creation date)
      tempSuggestions.sort((a, b) => (a['title'] as String).compareTo(b['title'] as String));
    }

    _filteredSuggestions = tempSuggestions;
  }

  void _handleVote(int id, int direction) {
    setState(() {
      final index = _suggestions.indexWhere((s) => s['id'] == id);
      if (index != -1) {
        _suggestions[index]['votes'] += direction;
        _filterSuggestions(); // Re-filter and re-sort after voting
      }
    });
    // In a real app, you would send this vote to a backend
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(direction > 0 ? "Upvoted!" : "Downvoted!")),
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
                  const Text(
                    "AI Suggestions",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Montserrat',
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Get personalized energy-saving tips and suggestions to optimize your usage.",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                      fontFamily: 'Montserrat',
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Search Bar
                  TextField(
                    onChanged: _handleSearch,
                    decoration: InputDecoration(
                      hintText: "Search suggestions...",
                      hintStyle: const TextStyle(color: Colors.white70),
                      prefixIcon: const Icon(Icons.search, color: Colors.white70),
                      filled: true,
                      fillColor: Colors.white.withValues(alpha: 0.1),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30.0),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 20),

                  // Category Filter Buttons
                  SizedBox(
                    height: 40,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildCategoryButton("All"),
                        _buildCategoryButton("Energy Saving"),
                        _buildCategoryButton("Maintenance"),
                        _buildCategoryButton("Upgrades"),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Sort Toggle Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ChoiceChip(
                        label: const Text("Most Voted"),
                        selected: _sortByVotes,
                        onSelected: (selected) {
                          setState(() {
                            _sortByVotes = true;
                            _filterSuggestions();
                          });
                        },
                        selectedColor: const Color(0xFF80CBC4),
                        backgroundColor: Colors.white10,
                        labelStyle: TextStyle(color: _sortByVotes ? Colors.black : Colors.white),
                      ),
                      const SizedBox(width: 10),
                      ChoiceChip(
                        label: const Text("Most Recent"),
                        selected: !_sortByVotes,
                        onSelected: (selected) {
                          setState(() {
                            _sortByVotes = false;
                            _filterSuggestions();
                          });
                        },
                        selectedColor: const Color(0xFF80CBC4),
                        backgroundColor: Colors.white10,
                        labelStyle: TextStyle(color: !_sortByVotes ? Colors.black : Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Suggestions List
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _filteredSuggestions.length,
                    itemBuilder: (context, index) {
                      final suggestion = _filteredSuggestions[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 10),
                        color: Colors.white.withValues(alpha: 0.1), // Card background with opacity
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                suggestion['title'],
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Montserrat',
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                suggestion['description'],
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                  fontFamily: 'Montserrat',
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: <Widget>[
                                  Text(
                                    "Category: ${suggestion['category']}",
                                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.thumb_up, color: Colors.greenAccent),
                                        onPressed: () => _handleVote(suggestion['id'], 1),
                                      ),
                                      Text(
                                        "${suggestion['votes']}",
                                        style: const TextStyle(color: Colors.white, fontSize: 16),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.thumb_down, color: Colors.redAccent),
                                        onPressed: () => _handleVote(suggestion['id'], -1),
                                      ),
                                    ],
                                  ),
                                ],
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

  Widget _buildCategoryButton(String category) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 5.0),
      child: ChoiceChip(
        label: Text(category),
        selected: _activeCategory == category,
        onSelected: (selected) {
          _handleCategoryChange(category);
        },
        selectedColor: const Color(0xFF80CBC4),
        backgroundColor: Colors.white10,
        labelStyle: TextStyle(color: _activeCategory == category ? Colors.black : Colors.white),
      ),
    );
  }
}
