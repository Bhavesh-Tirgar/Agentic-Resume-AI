from django.urls import path
from .views import JobMatchingView, ResumeProcessView, InterviewPlanningView, JobDiscoveryView

urlpatterns = [
    path("resume-process/<int:resume_id>/", ResumeProcessView.as_view(), name="resume-process"),
    path("resume/<int:resume_id>/job-match/", JobMatchingView.as_view(), name="job-matching"),
    path("resume/<int:resume_id>/job-match/<int:job_match_id>/interview-plan/", InterviewPlanningView.as_view(), name="interview-planning"),
    path("resume/<int:resume_id>/job-finder/", JobDiscoveryView.as_view(), name="job-finder"),
]
