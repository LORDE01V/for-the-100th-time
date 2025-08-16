import 'package:flutter/material.dart';
import 'dart:ui';

class ExpensesPage extends StatelessWidget {
  const ExpensesPage({super.key});

  // Mock data for expenses
  final List<Map<String, dynamic>> expenses = const [
    {'category': 'Electricity Bill', 'date': '2024-07-25', 'amount': 550.75, 'status': 'Paid'},
    {'category': 'Water Bill', 'date': '2024-07-20', 'amount': 210.00, 'status': 'Paid'},
    {'category': 'Internet Bill', 'date': '2024-07-15', 'amount': 300.00, 'status': 'Due'},
    {'category': 'Maintenance Fee', 'date': '2024-07-10', 'amount': 150.00, 'status': 'Paid'},
  ];

  double get totalExpenses => expenses.fold(0.0, (sum, item) => sum + item['amount']);
  double get monthlyAverage => totalExpenses / (expenses.isNotEmpty ? expenses.length : 1); // Simple average

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
                    "Expenses",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Montserrat',
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Summary Grid
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 3,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    childAspectRatio: 1.2,
                    children: <Widget>[
                      _buildSummaryCard(
                        icon: Icons.attach_money,
                        title: "Total Expenses",
                        value: "R${totalExpenses.toStringAsFixed(2)}",
                        valueColor: Colors.tealAccent,
                      ),
                      _buildSummaryCard(
                        icon: Icons.trending_up,
                        title: "Monthly Average",
                        value: "R${monthlyAverage.toStringAsFixed(2)}",
                        valueColor: Colors.orangeAccent,
                      ),
                      _buildSummaryCard(
                        icon: Icons.event,
                        title: "Last Payment",
                        value: expenses.isNotEmpty ? expenses[0]['date'] : "N/A",
                        valueColor: Colors.lightBlueAccent,
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),

                  // Recent Expenses List
                  Card(
                    color: Colors.white.withOpacity(0.1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Text(
                            "Recent Expenses",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Montserrat',
                            ),
                          ),
                          const SizedBox(height: 15),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: expenses.length,
                            itemBuilder: (context, index) {
                              final expense = expenses[index];
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: <Widget>[
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: <Widget>[
                                        Text(
                                          expense['category'],
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        Text(
                                          expense['date'],
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Row(
                                      children: <Widget>[
                                        Text(
                                          "R${expense['amount'].toStringAsFixed(2)}",
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Chip(
                                          label: Text(expense['status']),
                                          backgroundColor: expense['status'] == 'Paid' ? Colors.green[700] : Colors.red[700],
                                          labelStyle: const TextStyle(color: Colors.white),
                                        ),
                                      ],
                                    ),
                                  ],
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
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard({required IconData icon, required String title, required String value, required Color valueColor}) {
    return Card(
      color: Colors.white.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(15.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(icon, color: Colors.white70, size: 30),
            const SizedBox(height: 5),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              value,
              style: TextStyle(
                color: valueColor,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
