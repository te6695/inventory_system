<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetOtp extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $userName;
    public $expiryMinutes;

    public function __construct($otp, $userName = null, $expiryMinutes = 10)
    {
        $this->otp = $otp;
        $this->userName = $userName;
        $this->expiryMinutes = $expiryMinutes;
    }

    public function build()
    {
        return $this->subject('Password Reset OTP - Inventory Management System')
                    ->view('emails.password-reset-otp')
                    ->with([
                        'otp' => $this->otp,
                        'userName' => $this->userName,
                        'expiryMinutes' => $this->expiryMinutes
                    ]);
    }
}