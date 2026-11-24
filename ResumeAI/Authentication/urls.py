from django.urls import path
from .views import RegisterView, ProfileView, DataExportView, DeleteAccountView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),

    # India DPDP Act (2023) & EU GDPR Privacy Endpoints
    path("privacy/export-data/", DataExportView.as_view(), name="privacy-export-data"),
    path("privacy/delete-account/", DeleteAccountView.as_view(), name="privacy-delete-account"),
]
