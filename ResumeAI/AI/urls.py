from django.urls import path
from .views import (
    JobMatchingView,
    ResumeProcessView,
    InterviewPlanningView,
    JobDiscoveryView,
    VirtualHRStartView,
    VirtualHRTurnView,
    VirtualHRFinishView,
    VirtualHRSessionView,
    WhisperTranscribeView,
)

urlpatterns = [
    path("resume-process/<int:resume_id>/", ResumeProcessView.as_view(), name="resume-process"),
    path("resume/<int:resume_id>/job-match/", JobMatchingView.as_view(), name="job-matching"),
    path("resume/<int:resume_id>/job-match/<int:job_match_id>/interview-plan/", InterviewPlanningView.as_view(), name="interview-planning"),
    path("resume/<int:resume_id>/job-finder/", JobDiscoveryView.as_view(), name="job-finder"),

    # Virtual HR Real-Time Mock Interview Endpoints
    path("interview/live/start/", VirtualHRStartView.as_view(), name="virtual-hr-start"),
    path("interview/live/turn/", VirtualHRTurnView.as_view(), name="virtual-hr-turn"),
    path("interview/live/finish/", VirtualHRFinishView.as_view(), name="virtual-hr-finish"),
    path("interview/live/session/<str:session_id>/", VirtualHRSessionView.as_view(), name="virtual-hr-session"),
    path("interview/live/whisper/", WhisperTranscribeView.as_view(), name="virtual-hr-whisper"),
]
