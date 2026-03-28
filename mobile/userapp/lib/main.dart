import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'theme/app_theme.dart';
import 'pages/auth/login_page.dart';
import 'pages/auth/register_page.dart';
import 'pages/landing_page.dart';
import 'pages/dashboard/patient_dashboard.dart';
import 'pages/dashboard/doctor_dashboard.dart';

void main() {
  runApp(const RogNidhiApp());
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/',          builder: (_, __) => const LandingPage()),
    GoRoute(path: '/login',     builder: (_, __) => const LoginPage()),
    GoRoute(path: '/register',  builder: (_, __) => const RegisterPage()),
    GoRoute(path: '/dashboard/patient',
            builder: (_, __) => const PatientDashboardPage()),
    GoRoute(path: '/dashboard/doctor',
            builder: (_, __) => const DoctorDashboardPage()),
  ],
);

class RogNidhiApp extends StatelessWidget {
  const RogNidhiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'RogNidhi',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: _router,
    );
  }
}