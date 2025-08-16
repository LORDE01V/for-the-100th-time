import 'package:flutter/material.dart';
import 'dart:ui';

class FAQPage extends StatefulWidget {
  const FAQPage({super.key});

  @override
  State<FAQPage> createState() => _FAQPageState();
}

class _FAQPageState extends State<FAQPage> {
  final List<Map<String, dynamic>> _faqItems = [
    {
      'question': 'How do I view my energy consumption?',
      'answer': 'You can view your energy consumption details on the Dashboard page, which provides daily, weekly, and monthly breakdowns.',
      'isExpanded': false,
    },
    {
      'question': 'What should I do if my payment fails?',
      'answer': 'If your payment fails, please check your payment details and ensure sufficient funds. You can try topping up again or contact support for assistance.',
      'isExpanded': false,
    },
    {
      'question': 'How can I refer a friend?',
      'answer': 'You can refer friends through the Refer & Earn page, where you\'ll find your unique referral link to share.',
      'isExpanded': false,
    },
    {
      'question': 'How do I change my account password?',
      'answer': 'You can change your password in the Settings page under Account Settings.',
      'isExpanded': false,
    },
    {
      'question': 'Where can I find information about load shedding schedules?',
      'answer': 'Load shedding schedules and predictions are available on the Load Shedding page.',
      'isExpanded': false,
    },
  ];

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
                          "Frequently Asked Questions",
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
                          ExpansionPanelList(
                            expansionCallback: (int index, bool isExpanded) {
                              setState(() {
                                _faqItems[index]['isExpanded'] = !isExpanded;
                              });
                            },
                            children: _faqItems.map<ExpansionPanel>((Map<String, dynamic> item) {
                              return ExpansionPanel(
                                backgroundColor: Color.fromARGB(13, 255, 255, 255), // Colors.white.withOpacity(0.05)
                                headerBuilder: (BuildContext context, bool isExpanded) {
                                  return ListTile(
                                    title: Text(
                                      item['question'],
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  );
                                },
                                body: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                                  child: Text(
                                    item['answer'],
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                                isExpanded: item['isExpanded'] ?? false,
                              );
                            }).toList(),
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
