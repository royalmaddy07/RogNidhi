import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../theme/app_theme.dart';
import '../../core/auth_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  String _role = 'patient'; // Matches role logic in register.tsx

  // Controllers for form fields
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _licenseController = TextEditingController(); // For Doctors

  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    // Endpoint matches your Django urls.py
    final String endpoint = _role == 'patient' 
        ? "${AuthService.baseUrl}/auth/register/patient/" 
        : "${AuthService.baseUrl}/auth/register/doctor/";

    final Map<String, dynamic> payload = {
      "first_name": _firstNameController.text.trim(),
      "last_name": _lastNameController.text.trim(),
      "email": _emailController.text.trim().toLowerCase(),
      "password": _passwordController.text,
      "phone": _phoneController.text.trim(),
    };

    if (_role == 'doctor') {
      payload["license_number"] = _licenseController.text.trim();
    }

    try {
      final response = await http.post(
        Uri.parse(endpoint),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Account created! Please login.")),
          );
          context.go('/login');
        }
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData.toString());
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${e.toString()}")),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Join RogNidhi")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Create Account",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.navy),
              ),
              const SizedBox(height: 8),
              const Text("Start your journey toward health clarity", style: TextStyle(color: AppColors.muted)),
              const SizedBox(height: 32),

              // Role Selector
              Row(
                children: [
                  _roleTab("patient", "Patient"),
                  const SizedBox(width: 12),
                  _roleTab("doctor", "Doctor"),
                ],
              ),
              const SizedBox(height: 32),

              // Name Fields
              Row(
                children: [
                  Expanded(child: _buildTextField(_firstNameController, "First Name")),
                  const SizedBox(width: 16),
                  Expanded(child: _buildTextField(_lastNameController, "Last Name")),
                ],
              ),
              const SizedBox(height: 20),

              _buildTextField(_emailController, "Email Address", keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 20),

              _buildTextField(_phoneController, "Phone Number", keyboardType: TextInputType.phone),
              const SizedBox(height: 20),

              if (_role == 'doctor') ...[
                _buildTextField(_licenseController, "Medical License Number"),
                const SizedBox(height: 20),
              ],

              _buildTextField(_passwordController, "Password", isPassword: true),
              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: AppColors.navy) 
                    : const Text("Create My Health Treasury"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _roleTab(String roleValue, String label) {
    bool isActive = _role == roleValue;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _role = roleValue),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? AppColors.navy : AppColors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isActive ? AppColors.navy : AppColors.border),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: isActive ? Colors.white : AppColors.muted,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, {bool isPassword = false, TextInputType? keyboardType}) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: Colors.white,
      ),
      validator: (value) => (value == null || value.isEmpty) ? "Required" : null,
    );
  }
}