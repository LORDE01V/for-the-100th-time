import 'package:flutter/material.dart';
import 'dart:ui';

class ForumPage extends StatefulWidget {
  const ForumPage({super.key});

  @override
  State<ForumPage> createState() => _ForumPageState();
}

class _ForumPageState extends State<ForumPage> {
  final TextEditingController _newPostController = TextEditingController();
  final List<Map<String, dynamic>> _posts = [
    {
      'id': 1,
      'author': 'John Doe',
      'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
      'content': 'Does anyone have tips for optimizing solar panel output during cloudy days?',
      'likes': 15,
      'replies': [
        {'author': 'Jane Smith', 'timestamp': DateTime.now().subtract(const Duration(hours: 1)), 'content': 'I found that keeping them clean helps a lot!'},
        {'author': 'Peter Jones', 'timestamp': DateTime.now().subtract(const Duration(minutes: 30)), 'content': 'Consider a micro-inverter system for better performance in partial shade.'},
      ],
    },
    {
      'id': 2,
      'author': 'Alice Johnson',
      'timestamp': DateTime.now().subtract(const Duration(days: 1)),
      'content': 'What are the best practices for home battery maintenance?',
      'likes': 10,
      'replies': [],
    },
  ];

  @override
  void dispose() {
    _newPostController.dispose();
    super.dispose();
  }

  void _submitPost() {
    if (_newPostController.text.isNotEmpty) {
      setState(() {
        _posts.insert(0, {
          'id': _posts.length + 1,
          'author': 'Current User', // Placeholder for current user
          'timestamp': DateTime.now(),
          'content': _newPostController.text,
          'likes': 0,
          'replies': [],
        });
        _newPostController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Discussion posted!")),
      );
    }
  }

  void _likePost(int id) {
    setState(() {
      final index = _posts.indexWhere((post) => post['id'] == id);
      if (index != -1) {
        _posts[index]['likes']++;
      }
    });
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
                    "Community Forum",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Montserrat',
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Connect with other users, share tips, and get support!",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                      fontFamily: 'Montserrat',
                    ),
                  ),
                  const SizedBox(height: 30),

                  // New Post Section
                  Card(
                    color: Colors.white.withValues(alpha: 0.1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Text(
                            "Start a Discussion",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Montserrat',
                            ),
                          ),
                          const SizedBox(height: 15),
                          TextField(
                            controller: _newPostController,
                            maxLines: 5,
                            decoration: InputDecoration(
                              hintText: "Share your energy-saving tips or ask a question...",
                              hintStyle: const TextStyle(color: Colors.white70),
                              filled: true,
                              fillColor: Colors.white.withValues(alpha: 0.05),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10.0),
                                borderSide: BorderSide.none,
                              ),
                            ),
                            style: const TextStyle(color: Colors.white),
                          ),
                          const SizedBox(height: 15),
                          Align(
                            alignment: Alignment.centerRight,
                            child: ElevatedButton(
                              onPressed: _submitPost,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF80CBC4), // Light blue-green button
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30.0),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                              ),
                              child: const Text(
                                "Post Discussion",
                                style: TextStyle(
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
                  ),
                  const SizedBox(height: 30),

                  // Posts List
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _posts.length,
                    itemBuilder: (context, index) {
                      final post = _posts[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 10),
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: <Widget>[
                                  Text(
                                    post['author'],
                                    style: const TextStyle(
                                      color: Colors.tealAccent,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    "${post['timestamp'].day}/${post['timestamp'].month}/${post['timestamp'].year} ${post['timestamp'].hour}:${post['timestamp'].minute}",
                                    style: const TextStyle(
                                      color: Colors.white54,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                post['content'],
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 15),
                              Row(
                                children: <Widget>[
                                  IconButton(
                                    icon: const Icon(Icons.thumb_up, color: Colors.greenAccent),
                                    onPressed: () => _likePost(post['id']),
                                  ),
                                  Text(
                                    "${post['likes']}",
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                  ),
                                  const SizedBox(width: 20),
                                  const Icon(Icons.comment, color: Colors.blueAccent),
                                  const SizedBox(width: 5),
                                  Text(
                                    "${(post['replies'] as List).length} Replies",
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                  ),
                                ],
                              ),
                              // Replies Section
                              if ((post['replies'] as List).isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(left: 20.0, top: 15.0),
                                  child: Column(
                                    children: (post['replies'] as List).map<Widget>((reply) {
                                      return Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 5.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: <Widget>[
                                            Text(
                                              reply['author'],
                                              style: const TextStyle(
                                                color: Colors.cyanAccent,
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              reply['content'],
                                              style: const TextStyle(
                                                color: Colors.white70,
                                                fontSize: 12,
                                              ),
                                            ),
                                            Text(
                                              "${reply['timestamp'].day}/${reply['timestamp'].month}/${reply['timestamp'].year} ${reply['timestamp'].hour}:${reply['timestamp'].minute}",
                                              style: const TextStyle(
                                                color: Colors.white54,
                                                fontSize: 10,
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
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
