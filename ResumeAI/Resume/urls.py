from django.urls import path
from .views import ResumeUploadView, ResumeDetailView

urlpatterns = [
    path("", ResumeUploadView.as_view(), name="resume-list"),
    path("upload/", ResumeUploadView.as_view(), name="resume-upload"),
    path("<int:resume_id>/", ResumeDetailView.as_view(), name="resume-detail"),
]
