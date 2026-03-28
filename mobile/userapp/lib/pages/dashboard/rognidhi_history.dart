import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../theme/app_theme.dart';
import '../../core/auth_service.dart';
import '../../widgets/app_sidebar.dart';

class RogNidhiHistoryPage extends StatefulWidget {
  const RogNidhiHistoryPage({super.key});

  @override
  State<RogNidhiHistoryPage> createState() => _RogNidhiHistoryPageState();
}

class _RogNidhiHistoryPageState extends State<RogNidhiHistoryPage> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;

  // Initial welcome message mirroring RogNidhiHistory.tsx
  @override
  void initState() {
    super.initState();
    _messages.add({
      "sender": "ai",
      "text": "Hello! I'm RogNidhi. Ask me anything about your health records."
    });
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    String userMessage = _messageController.text.trim();
    setState(() {
      _messages.add({"sender": "user", "text": userMessage});
      _isLoading = true;
    });
    _messageController.clear();

    try {
      final token = AuthService.token;
      // Endpoint logic follows the POST request in your React code
      final response = await http.post(
        Uri.parse("${AuthService.baseUrl}/chat/sessions/new/"), // Simplified for demo
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({"question": userMessage}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _messages.add({"sender": "ai", "text": data['answer'] ?? "I processed your request."});
        });
      } else {
        throw Exception("Failed to get response");
      }
    } catch (e) {
      setState(() {
        _messages.add({"sender": "ai", "text": "Sorry, I encountered an error connecting to the treasury."});
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = {"name": "Aditya", "role": "patient"};

    return Scaffold(
      appBar: AppBar(title: const Text("RogNidhi AI Assistant")),
      drawer: AppSidebar(user: user),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                bool isUser = msg['sender'] == 'user';
                return _buildChatBubble(msg['text']!, isUser);
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: LinearProgressIndicator(color: AppColors.teal),
            ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildChatBubble(String text, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? AppColors.navy : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 0),
            bottomRight: Radius.circular(isUser ? 0 : 16),
          ),
          border: isUser ? null : Border.all(color: AppColors.border),
        ),
        child: Text(
          text,
          style: TextStyle(color: isUser ? Colors.white : AppColors.navy, fontSize: 15),
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: "Ask about your reports...",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ),
          ),
          const SizedBox(width: 12),
          IconButton(
            icon: const Icon(Icons.send, color: AppColors.teal),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }
}