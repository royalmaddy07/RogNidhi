import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';

class AppSidebar extends StatelessWidget {
  final Map<String, dynamic> user;
  const AppSidebar({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.navy,
      child: Column(
        children: [
          DrawerHeader(
            child: Row(
              children: [
                const Text("📋", style: TextStyle(fontSize: 32)),
                const SizedBox(width: 12),
                const Text(
                  "RogNidhi",
                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
          _buildNavItem(context, Icons.dashboard_outlined, "Dashboard", '/dashboard/patient'),
          _buildNavItem(context, Icons.history_outlined, "Records", '/dashboard/patient'),
          _buildNavItem(context, Icons.chat_bubble_outline, "AI Chat", '/dashboard/patient'),
          const Spacer(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.white54),
            title: const Text("Logout", style: TextStyle(color: Colors.white54)),
            onTap: () => context.go('/login'),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, IconData icon, String title, String path) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70),
      title: Text(title, style: const TextStyle(color: Colors.white70)),
      onTap: () => context.go(path),
    );
  }
}