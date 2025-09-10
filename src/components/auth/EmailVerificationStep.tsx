import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Clock, RefreshCw } from 'lucide-react';
import { sendVerificationCode, verifyEmailCode } from '@/lib/authApi';

interface EmailVerificationStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  onResend: () => void;
}

const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({
  email,
  onVerified,
  onBack,
  onResend
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyEmailCode(email, code);
      
      if (result.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(result.errors?.[0] || 'Invalid verification code');
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setSuccess('Verification code sent!');
        setCountdown(60); // 1 minute cooldown
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.errors?.[0] || 'Failed to resend code');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="glass-strong border-border-soft/50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text-hero">
            Verify Your Email
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-foreground">{email}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Verification Code Input */}
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {countdown}s
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationStep;
