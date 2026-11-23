from django.conf import settings
from django.db import models

from Resume.models import Resume


class InterviewSessionRecord(models.Model):
    """
    Enterprise persistent audit and session record for 3D Live Virtual HR Mock Interviews.
    Maintains full turn transcripts, STAR evaluations, client & vision telemetry,
    and Bar Raiser executive scorecards.
    """
    session_id = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="interview_sessions"
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="interview_sessions"
    )
    candidate_name = models.CharField(max_length=255, default="Candidate")
    target_role = models.CharField(max_length=255, default="Senior Software Engineer")
    status = models.CharField(max_length=32, default="active", db_index=True)
    current_round = models.IntegerField(default=1)
    max_rounds = models.IntegerField(default=4)
    turns_data = models.JSONField(default=list, blank=True)
    scorecard_data = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "InterviewSessionRecord"
        verbose_name = "Interview Session Record"
        verbose_name_plural = "Interview Session Records"

    def __str__(self):
        return f"InterviewSession ({self.session_id[:8]}) - {self.candidate_name} ({self.target_role}) - {self.status}"
