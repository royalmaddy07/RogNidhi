// import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/record_card.dart';

class PatientDashboardPage extends StatefulWidget {
  const PatientDashboardPage({super.key});

  @override
  State<PatientDashboardPage> createState() => _PatientDashboardPageState();
}

class _PatientDashboardPageState extends State<PatientDashboardPage> {
  final ImagePicker _picker = ImagePicker();

  // Function to handle image selection and future upload logic
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        imageQuality: 85, // Compression to save bandwidth
      );

      if (pickedFile != null) {
        // Logically mirroring your React upload flow
        _showProcessingSnackBar();
        
        // TODO: Call your UploadService here once defined
        // Example: await UploadService.uploadFile(File(pickedFile.path));
        
        _showSuccessSnackBar(pickedFile.name);
      }
    } catch (e) {
      _showErrorSnackBar(e.toString());
    }
  }

  void _showProcessingSnackBar() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
            SizedBox(width: 15),
            Text("AI is processing your report..."),
          ],
        ),
        backgroundColor: AppColors.navy,
      ),
    );
  }

  void _showSuccessSnackBar(String filename) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Success: $filename added to treasury!"),
        backgroundColor: AppColors.teal,
      ),
    );
  }

  void _showErrorSnackBar(String error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Upload Failed: $error"), backgroundColor: AppColors.error),
    );
  }

  // Display a bottom sheet to choose between Camera and Gallery
  void _showSourcePicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text("Select Source", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined, color: AppColors.teal),
              title: const Text('Camera'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.teal),
              title: const Text('Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = {"name": "Aditya", "role": "patient"};

    return Scaffold(
      appBar: AppBar(
        title: const Text("Health Treasury"),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_none_outlined), onPressed: () {}),
          const SizedBox(width: 8),
        ],
      ),
      drawer: AppSidebar(user: user),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Welcome back, Aditya", style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.navy)),
            const SizedBox(height: 8),
            const Text("Your lifelong health records, protected and organized.", style: TextStyle(color: AppColors.muted, fontSize: 16)),
            const SizedBox(height: 32),
            _buildHealthScoreCard(),
            const SizedBox(height: 40),
            const Text("Your Medical Timeline", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
            const SizedBox(height: 16),
            const RecordCard(date: "28", month: "Mar", title: "Blood Test Report", type: "Pathology"),
            const RecordCard(date: "15", month: "Feb", title: "General Checkup", type: "Prescription"),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showSourcePicker,
        backgroundColor: AppColors.teal,
        icon: const Icon(Icons.add, color: AppColors.navy),
        label: const Text("Upload Record", style: TextStyle(color: AppColors.navy, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildHealthScoreCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text("HEALTH SCORE", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.teal, letterSpacing: 1.2)),
          Text("84/100", style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.navy)),
        ],
      ),
    );
  }
}