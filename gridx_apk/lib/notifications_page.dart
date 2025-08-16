import 'package:flutter/material.dart';
import 'dart:ui';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  // Mock data for notifications
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': 1,
      'title': 'New Energy Report',
      'description': 'Your monthly energy consumption report is ready.',
      'status': 'info',
      'timestamp': DateTime.now().subtract(const Duration(hours: 3)),
      'isDismissed': false,
    },
    {
      'id': 2,
      'title': 'Low Battery Alert',
      'description': 'Your solar battery is at 20%. Consider reducing usage.',
      'status': 'warning',
      'timestamp': DateTime.now().subtract(const Duration(minutes: 45)),
      'isDismissed': false,
    },
    {
      'id': 3,
      'title': 'Payment Confirmation',
      'description': 'Your recent electricity bill payment was successful.',
      'status': 'success',
      'timestamp': DateTime.now().subtract(const Duration(days: 1)),
      'isDismissed': false,
    },
    {
      'id': 4,
      'title': 'System Error',
      'description': 'An issue detected with your solar inverter. Please contact support.',
      'status': 'error',
      'timestamp': DateTime.now().subtract(const Duration(days: 2)),
      'isDismissed': false,
    },
  ];

  List<Map<String, dynamic>> get _visibleNotifications =>
      _notifications.where((n) => !n['isDismissed']).toList();

  void _dismissNotification(int id) {
    setState(() {
      final index = _notifications.indexWhere((n) => n['id'] == id);
      if (index != -1) {
        _notifications[index]['isDismissed'] = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Notification dismissed!")),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'warning':
        return Colors.orangeAccent;
      case 'info':
        return Colors.blueAccent;
      case 'success':
        return Colors.greenAccent;
      case 'error':
        return Colors.redAccent;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'warning':
        return Icons.warning;
      case 'info':
        return Icons.info;
      case 'success':
        return Icons.check_circle;
      case 'error':
        return Icons.error;
      default:
        return Icons.notifications;
    }
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
                      children: <Widget>[
                        const Text(
                          "Notifications",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "${_visibleNotifications.length} unread notifications",
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                            fontFamily: 'Montserrat',
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 30),
                      ],
                    ),
                  ),
                  _visibleNotifications.isNotEmpty
                      ? ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _visibleNotifications.length,
                          itemBuilder: (context, index) {
                            final notification = _visibleNotifications[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              color: Color.fromARGB(25, 255, 255, 255),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15.0),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(15.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Icon(
                                      _getStatusIcon(notification['status']),
                                      color: _getStatusColor(notification['status']),
                                      size: 28,
                                    ),
                                    const SizedBox(width: 15),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          Text(
                                            notification['title'],
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 5),
                                          Text(
                                            notification['description'],
                                            style: const TextStyle(
                                              color: Colors.white70,
                                              fontSize: 14,
                                            ),
                                          ),
                                          const SizedBox(height: 5),
                                          Text(
                                            "${notification['timestamp'].day}/${notification['timestamp'].month}/${notification['timestamp'].year} ${notification['timestamp'].hour}:${notification['timestamp'].minute}",
                                            style: const TextStyle(
                                              color: Colors.white54,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.close, color: Colors.white70),
                                      onPressed: () => _dismissNotification(notification['id']),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        )
                      : Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          color: Colors.white.withOpacity(0.1),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          child: const Padding(
                            padding: EdgeInsets.all(20.0),
                            child: Center(
                              child: Column(
                                children: <Widget>[
                                  Icon(Icons.notifications_off, color: Colors.white70, size: 50),
                                  SizedBox(height: 10),
                                  Text(
                                    "No new notifications",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(height: 5),
                                  Text(
                                    "You're all caught up!",
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
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
