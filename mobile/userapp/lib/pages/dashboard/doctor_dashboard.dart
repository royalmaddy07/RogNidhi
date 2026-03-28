import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_sidebar.dart';

class DoctorDashboardPage extends StatelessWidget {
  const DoctorDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Current user context for a Doctor
    final user = {
      "name": "Dr. Sharma",
      "role": "doctor"
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text("Clinical Overview"),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppColors.muted),
            onPressed: () {},
          ),
          const Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundColor: AppColors.teal,
              radius: 18,
              child: Text("S", style: TextStyle(color: AppColors.navy, fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
      drawer: AppSidebar(user: user),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Patient Queue",
              style: TextStyle(
                fontSize: 28, 
                fontWeight: FontWeight.w800, 
                color: AppColors.navy
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Analyze AI clinical summaries for patients with active access.",
              style: TextStyle(color: AppColors.muted, fontSize: 16),
            ),
            const SizedBox(height: 32),

            // Patient Table Header (Mirroring DoctorDashboard.tsx table)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: const BoxDecoration(
                color: AppColors.offWhite,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(18), 
                  topRight: Radius.circular(18)
                ),
              ),
              child: const Row(
                children: [
                  Expanded(child: Text("PATIENT NAME", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.muted))),
                  Expanded(child: Text("STATUS", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.muted))),
                  Text("ACTION", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.muted)),
                ],
              ),
            ),

            // Patient Rows
            _buildPatientRow(
              name: "Yash Patel", 
              status: "Access Granted", 
              onPressed: () {
                // Future: Navigate to detailed AI Summary View
              }
            ),
            _buildPatientRow(
              name: "Aditya Kumar", 
              status: "Access Granted", 
              onPressed: () {}
            ),
            
            // Bottom border for the "Table"
            Container(
              height: 1, 
              color: AppColors.border,
              margin: const EdgeInsets.symmetric(horizontal: 1),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPatientRow({required String name, required String status, required VoidCallback onPressed}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          left: BorderSide(color: AppColors.border),
          right: BorderSide(color: AppColors.border),
          top: BorderSide(color: AppColors.border),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              name, 
              style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.navy)
            )
          ),
          Expanded(
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: AppColors.teal, size: 16),
                const SizedBox(width: 6),
                Text(status, style: const TextStyle(color: AppColors.teal, fontSize: 13, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          TextButton(
            onPressed: onPressed,
            style: TextButton.styleFrom(
              side: const BorderSide(color: AppColors.teal),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            child: const Text(
              "View AI Summary", 
              style: TextStyle(color: AppColors.teal, fontSize: 12, fontWeight: FontWeight.w700)
            ),
          ),
        ],
      ),
    );
  }
}