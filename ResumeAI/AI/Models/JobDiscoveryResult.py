from django.db import models
from Resume.models import Resume


class JobDiscoveryResult(models.Model):
    """
    Stores geolocated and resume-aligned job discovery results.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="job_discoveries"
    )
    location_query = models.CharField(max_length=255, default="Ahmedabad, India")
    work_type = models.CharField(max_length=50, default="All")
    discovery_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"JobDiscovery #{self.id} - {self.location_query} (Resume #{self.resume.id})"
