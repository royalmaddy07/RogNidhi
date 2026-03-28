import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  // 10.0.2.2 is the alias for localhost on Android Emulators
  static const String baseUrl = "http://10.0.2.2:8000/api";
  static String? _token;

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse("$baseUrl/auth/login/"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['access']; // JWT Access Token
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? "Login failed");
    }
  }

  static String? get token => _token;
}