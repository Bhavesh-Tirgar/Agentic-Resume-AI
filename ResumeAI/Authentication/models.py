import os
from django.contrib.auth.models import User
from django.db import models


class UserResumeQuota(models.Model):
    """Tracks per-user free resume allowance (1 free) and at-cost paid credits."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="resume_quota")
    free_resumes_used = models.PositiveIntegerField(default=0)
    paid_resume_credits = models.PositiveIntegerField(default=0)
    total_paid_inr = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def free_limit(cls) -> int:
        return max(0, int(os.getenv("FREE_RESUME_LIMIT", "1")))

    @classmethod
    def unlock_price_inr(cls) -> int:
        return max(1, int(os.getenv("RESUME_UNLOCK_PRICE_INR", "29")))

    @classmethod
    def unlock_price_usd(cls) -> float:
        return max(0.1, float(os.getenv("RESUME_UNLOCK_PRICE_USD", "0.49")))

    def can_upload(self) -> bool:
        return (self.free_resumes_used < self.free_limit()) or (self.paid_resume_credits > 0)

    def to_dict(self) -> dict:
        limit = self.free_limit()
        free_remaining = max(0, limit - self.free_resumes_used)
        return {
            "free_limit": limit,
            "free_used": self.free_resumes_used,
            "free_remaining": free_remaining,
            "paid_credits": self.paid_resume_credits,
            "can_upload": self.can_upload(),
            "unlock_price_inr": self.unlock_price_inr(),
            "unlock_price_usd": self.unlock_price_usd(),
        }

    def __str__(self) -> str:
        return f"{self.user.username}: free={self.free_resumes_used}/{self.free_limit()}, credits={self.paid_resume_credits}"


class PaymentTransaction(models.Model):
    """Server-bound order & idempotency ledger preventing credit tampering and payment replay."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment_transactions")
    provider = models.CharField(max_length=32, default="razorpay")
    order_id = models.CharField(max_length=128, unique=True)
    payment_id = models.CharField(max_length=128, unique=True, null=True, blank=True)
    credits = models.PositiveIntegerField(default=1)
    amount_inr = models.PositiveIntegerField(default=29)
    status = models.CharField(max_length=16, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username} | {self.provider}:{self.order_id} ({self.status}, +{self.credits})"
