<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetOtp;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class ForgotPasswordController extends Controller
{
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Check if user exists and is active
        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address'
            ], 404);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is inactive. Please contact administrator.'
            ], 403);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP and expiry (10 minutes)
        $user->update([
            'otp' => Hash::make($otp),
            'otp_expires_at' => Carbon::now()->addMinutes(10),
            'remember_token' => Str::random(60) // This will be used as verification token
        ]);

        // Send OTP via email
        try {
            Mail::to($user->email)->send(new PasswordResetOtp($otp, $user->name));
            
            return response()->json([
                'message' => 'OTP sent successfully to your email',
                'email' => $user->email,
                'verification_token' => $user->remember_token // Return token for verification
            ], 200);
            
        } catch (\Exception $e) {
            // If email fails, still return success for development
            // In production, you might want to log this error
            return response()->json([
                'message' => 'OTP generated. For development: ' . $otp,
                'email' => $user->email,
                'verification_token' => $user->remember_token,
                'debug_otp' => $otp // Remove this in production
            ], 200);
        }
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'verification_token' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('remember_token', $request->verification_token)
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid verification token'
            ], 400);
        }

        // Check if OTP exists and not expired
        if (!$user->otp || !$user->otp_expires_at) {
            return response()->json([
                'message' => 'No OTP request found. Please request a new OTP.'
            ], 400);
        }

        if (Carbon::now()->gt($user->otp_expires_at)) {
            // Clear expired OTP
            $user->update([
                'otp' => null,
                'otp_expires_at' => null
            ]);
            
            return response()->json([
                'message' => 'OTP has expired. Please request a new one.'
            ], 400);
        }

        // Verify OTP
        if (!Hash::check($request->otp, $user->otp)) {
            return response()->json([
                'message' => 'Invalid OTP'
            ], 400);
        }

        // OTP verified successfully
        return response()->json([
            'message' => 'OTP verified successfully',
            'verification_token' => $user->remember_token
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'verification_token' => 'required|string',
            'password' => 'required|confirmed|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('remember_token', $request->verification_token)
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid verification token'
            ], 400);
        }

        // Verify OTP is still valid (not expired)
        if (!$user->otp || !$user->otp_expires_at || Carbon::now()->gt($user->otp_expires_at)) {
            return response()->json([
                'message' => 'OTP has expired. Please request a new OTP.'
            ], 400);
        }

        // Update password and clear OTP fields
        $user->update([
            'password' => Hash::make($request->password),
            'otp' => null,
            'otp_expires_at' => null,
            'remember_token' => null
        ]);

        return response()->json([
            'message' => 'Password reset successful. You can now login with your new password.'
        ], 200);
    }
}