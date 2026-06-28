import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:livelyness_detection/livelyness_detection.dart';
import '../providers/election_provider.dart';
import '../services/supabase_service.dart';
import 'voting_screen.dart';

class BiometricScreen extends StatefulWidget {
  const BiometricScreen({super.key});

  @override
  State<BiometricScreen> createState() => _BiometricScreenState();
}

class _BiometricScreenState extends State<BiometricScreen> {
  bool _isProcessing = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Start detection automatically when the screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startVerification();
    });
  }

  Future<void> _startVerification() async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
      _error = null;
    });

    try {
      final provider = Provider.of<ElectionProvider>(context, listen: false);
      
      // Configure the liveness detection steps
      final List<LivelynessStepItem> livenessSteps = [
        LivelynessStepItem(
          step: LivelynessStep.blink,
          title: "Blink Naturally",
          isCompleted: false,
        ),
        LivelynessStepItem(
          step: LivelynessStep.smile,
          title: "Smile for the camera",
          isCompleted: false,
        ),
      ];

      // Start the built-in AI liveness detection UI
      final CapturedImage? response = await LivelynessDetection.instance.detectLivelyness(
        context,
        config: DetectionConfig(
          steps: livenessSteps,
          startWithInfoScreen: true,
        ),
      );

      if (response != null && response.imgPath.isNotEmpty) {
        // Success! Proceed to ballot verification in Supabase
        setState(() => _error = '🔍 Verifying Identity with Election DB...');
        
        final File imageFile = File(response.imgPath);
        
        try {
          final result = await SupabaseService.verifyBiometric(
            voterId: provider.currentVoterId!,
            liveImageBytes: await imageFile.readAsBytes(),
          );

          if (result['status'] == 'success') {
            setState(() => _error = '🧬 AI Match Confirmed! Proceeding...');
            await Future.delayed(const Duration(milliseconds: 1000));
            
            if (mounted) {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const VotingScreen()),
              );
            }
          }
        } catch (e) {
          setState(() {
            _error = e.toString().replaceFirst('Exception: ', '');
            _isProcessing = false;
          });
        }
      } else {
        setState(() {
          _error = 'Verification cancelled.';
          _isProcessing = false;
        });
      }
    } catch (e) {
      print('Liveness Error: $e');
      setState(() {
        _error = 'Technical Error: ${e.toString()}';
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF003366),
        title: const Text('Security Verification'),
        elevation: 0,
      ),
      body: Consumer<ElectionProvider>(
        builder: (context, provider, child) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Verification Card
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _error != null ? Icons.error_outline : Icons.face_retouching_natural,
                          size: 80,
                          color: _error != null ? Colors.red : const Color(0xFF003366),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Identity Verification',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF333333),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Voter: ${provider.currentVoterName}',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 32),
                        if (_isProcessing && _error == null)
                          const CircularProgressIndicator(color: Color(0xFFFF9933))
                        else if (_error != null)
                          Text(
                            _error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w500),
                          ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isProcessing ? null : _startVerification,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF003366),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              _error != null ? 'Try Again' : 'Start Camera',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  const Text(
                    'Ensure you are in a well-lit area\nand not wearing sunglasses or masks.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}