import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/record_card.dart'; // <--- Ensure this line exists

class PatientDashboardPage extends StatelessWidget {
  const PatientDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Current user context (Mirroring localstorage user in React)
    final user = {
      "name": "Aditya",
      "role": "patient"
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text("Health Treasury"),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      drawer: AppSidebar(user: user),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Welcome back, Aditya",
              style: TextStyle(
                fontSize: 28, 
                fontWeight: FontWeight.w800, 
                color: AppColors.navy
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Your lifelong health records, protected and organized.",
              style: TextStyle(color: AppColors.muted, fontSize: 16),
            ),
            const SizedBox(height: 32),
            
            // Health Score Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "HEALTH SCORE",
                    style: TextStyle(
                      fontSize: 12, 
                      fontWeight: FontWeight.w800, 
                      color: AppColors.teal,
                      letterSpacing: 1.2
                    ),
                  ),
                  Text(
                    "84/100",
                    style: TextStyle(
                      fontSize: 24, 
                      fontWeight: FontWeight.w900, 
                      color: AppColors.navy
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            
            const Text(
              "Your Medical Timeline",
              style: TextStyle(
                fontSize: 18, 
                fontWeight: FontWeight.bold, 
                color: AppColors.navy
              ),
            ),
            const SizedBox(height: 16),

            // These are the classes causing the error
            const RecordCard(
              date: "28", 
              month: "Mar", 
              title: "Blood Test Report", 
              type: "Pathology"
            ),
            const RecordCard(
              date: "15", 
              month: "Feb", 
              title: "General Checkup", 
              type: "Prescription"
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.teal,
        icon: const Icon(Icons.add, color: AppColors.navy),
        label: const Text(
          "Upload Record", 
          style: TextStyle(color: AppColors.navy, fontWeight: FontWeight.bold)
        ),
      ),
    );
  }
}