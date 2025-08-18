import 'package:flutter/material.dart';
import 'dart:ui';

class TopUpPage extends StatefulWidget {
  const TopUpPage({super.key});

  @override
  State<TopUpPage> createState() => _TopUpPageState();
}

class _TopUpPageState extends State<TopUpPage> {
  double _currentBalance = 150.75; // Mock current balance
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _promoCodeController = TextEditingController();
  String? _selectedPaymentMethod;
  bool _isProcessing = false;

  final List<String> _paymentMethods = ['Credit Card', 'Debit Card', 'EFT', 'Voucher'];

  @override
  void dispose() {
    _amountController.dispose();
    _promoCodeController.dispose();
    super.dispose();
  }

  void _submitTopUp() async {
    if (_amountController.text.isEmpty || double.tryParse(_amountController.text) == null || double.parse(_amountController.text) < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter a valid amount (minimum R10).")),
      );
      return;
    }
    if (_selectedPaymentMethod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a payment method.")),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    // Simulate top-up process
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _currentBalance += double.parse(_amountController.text);
      _amountController.clear();
      _promoCodeController.clear();
      _selectedPaymentMethod = null; // Reset selected method
      _isProcessing = false;
    });

    if (!mounted) return; // Added mounted check
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Top-up successful!")),
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
                    child: Card(
                      color: Color.fromARGB(230, 255, 255, 255), // Background for the content card
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15.0),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              "Top Up Your Balance",
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Montserrat',
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "Current Balance: R${_currentBalance.toStringAsFixed(2)}",
                              style: const TextStyle(
                                color: Colors.black54,
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 30),
                            TextField(
                              controller: _amountController,
                              keyboardType: TextInputType.number,
                              style: const TextStyle(color: Colors.black87),
                              decoration: InputDecoration(
                                labelText: "Amount (ZAR)",
                                labelStyle: const TextStyle(color: Colors.black54),
                                filled: true,
                                fillColor: Color.fromARGB(25, 0, 0, 0), // Adjust to be slightly transparent black
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextField(
                              controller: _promoCodeController,
                              style: const TextStyle(color: Colors.black87),
                              decoration: InputDecoration(
                                labelText: "Promo Code (Optional)",
                                labelStyle: const TextStyle(color: Colors.black54),
                                filled: true,
                                fillColor: Color.fromARGB(25, 0, 0, 0),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            DropdownButtonFormField<String>(
                              initialValue: _selectedPaymentMethod,
                              hint: const Text("Select Payment Method", style: TextStyle(color: Colors.black54)),
                              dropdownColor: Colors.grey[800], // Darker background for dropdown list
                              style: const TextStyle(color: Colors.black87),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: Color.fromARGB(25, 0, 0, 0),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              items: _paymentMethods.map((String method) {
                                return DropdownMenuItem<String>(
                                  value: method,
                                  child: Text(method, style: const TextStyle(color: Colors.black)),
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _selectedPaymentMethod = newValue;
                                });
                              },
                            ),
                            const SizedBox(height: 30),
                            Center(
                              child: ElevatedButton(
                                onPressed: _isProcessing ? null : _submitTopUp,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF80CBC4),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(30.0),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                                ),
                                child: _isProcessing
                                    ? const CircularProgressIndicator(color: Colors.black)
                                    : const Text(
                                        "Confirm Top-Up",
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
