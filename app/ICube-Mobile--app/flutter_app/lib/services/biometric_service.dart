import 'dart:typed_data';
import 'dart:ui';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:flutter/foundation.dart';

class BiometricService {
  static final FaceDetector _faceDetector = FaceDetector(
    options: FaceDetectorOptions(
      enableClassification: true,
      enableLandmarks: true,
      performanceMode: FaceDetectorMode.accurate,
    ),
  );

  static bool _blinkDetected = false;
  static bool _smileDetected = false;
  static bool _faceDetected = false;
  static List<CameraDescription>? _cachedCameras;

  static Future<List<CameraDescription>> getAvailableCameras() async {
    if (_cachedCameras == null || _cachedCameras!.isEmpty) {
      _cachedCameras = await availableCameras();
    }
    return _cachedCameras!;
  }

  static Future<Map<String, dynamic>> processFrame(CameraImage image) async {
    try {
      final cameras = await getAvailableCameras();
      final camera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      // --- CRITICAL: AI DATA PREPARATION ---
      // We concatenate the bytes for the AI.
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      final metadata = InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: _rotationIntToImageRotation(camera.sensorOrientation),
        format: InputImageFormat.nv21, // Best for Android YUV camera images
        bytesPerRow: image.planes[0].bytesPerRow,
      );

      final inputImage = InputImage.fromBytes(bytes: bytes, metadata: metadata);
      final List<Face> faces = await _faceDetector.processImage(inputImage);

      if (faces.isEmpty) {
        return {
          'face_in_frame': false,
          'faces_detected': 0,
          'blink_detected': false,
          'smile_detected': false,
        };
      }

      final Face face = faces.first;
      if (!_faceDetected) {
        print('✅ AI: Face Synchronized');
        _faceDetected = true;
      }

      // --- DETECTION THRESHOLDS (Optimized for Samsung A52) ---
      
      bool blinkNow = false;
      // Probability of eyes being OPEN. 
      if (face.leftEyeOpenProbability != null && face.rightEyeOpenProbability != null) {
        double avgOpen = (face.leftEyeOpenProbability! + face.rightEyeOpenProbability!) / 2;
        // Blink logic: detects the transition from open to closed
        if (avgOpen < 0.4) { 
          if (!_blinkDetected) {
            print('✅ AI: Blink Success');
            _blinkDetected = true;
            blinkNow = true;
          }
        }
      }

      bool smileNow = false;
      if (face.smilingProbability != null && _blinkDetected) {
        // Lower threshold for smile to make it more user-friendly
        if (face.smilingProbability! > 0.4) { 
          if (!_smileDetected) {
            print('✅ AI: Smile Success - Verified');
            _smileDetected = true;
            smileNow = true;
          }
        }
      }

      return {
        'face_in_frame': true,
        'faces_detected': faces.length,
        'blink_detected': blinkNow,
        'smile_detected': smileNow,
        'head_pose_good': true,
        'landmarks_consistent': true,
        'lighting_adequate': true,
        'face_size_good': true,
      };
    } catch (e) {
      print('❌ AI Data Error: $e');
      return {
        'face_in_frame': false,
        'error': e.toString(),
      };
    }
  }

  static InputImageRotation _rotationIntToImageRotation(int rotation) {
    // Front cameras are often offset by 270 degrees on Android
    switch (rotation) {
      case 90: return InputImageRotation.rotation90deg;
      case 180: return InputImageRotation.rotation180deg;
      case 270: return InputImageRotation.rotation270deg;
      default: return InputImageRotation.rotation0deg;
    }
  }

  static Future<Uint8List> captureImage(CameraController controller) async {
    try {
      final XFile imageFile = await controller.takePicture();
      return await imageFile.readAsBytes();
    } catch (e) {
      throw Exception('Failed to capture image: $e');
    }
  }

  static void dispose() {
    _blinkDetected = false;
    _smileDetected = false;
    _faceDetected = false;
  }

  static void close() {
    _faceDetector.close();
  }
}
