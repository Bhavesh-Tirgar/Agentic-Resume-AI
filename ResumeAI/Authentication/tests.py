from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from Resume.models import Resume


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.token_url = reverse("token_obtain_pair")
        self.profile_url = reverse("profile")
        self.export_url = reverse("privacy-export-data")
        self.delete_url = reverse("privacy-delete-account")
        
        self.user_data = {
            "username": "bhavesh",
            "email": "bhavesh@example.com",
            "password": "Password123!"
        }

    def test_user_registration_success(self):
        """Test creating a new user with valid credentials"""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="bhavesh").exists())

    def test_user_registration_duplicate_username(self):
        """Test registration fails when username already exists"""
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jwt_token_obtain_and_profile_access(self):
        """Test obtaining JWT token and using it to access protected profile"""
        # Register user
        self.client.post(self.register_url, self.user_data)
        
        # Obtain JWT token
        login_res = self.client.post(self.token_url, {
            "username": self.user_data["username"],
            "password": self.user_data["password"]
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_res.data)
        self.assertIn("refresh", login_res.data)
        
        token = login_res.data["access"]
        
        # Access protected profile without auth -> should be 401
        unauth_res = self.client.get(self.profile_url)
        self.assertEqual(unauth_res.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Access with Bearer token -> should be 200
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        auth_res = self.client.get(self.profile_url)
        self.assertEqual(auth_res.status_code, status.HTTP_200_OK)
        self.assertEqual(auth_res.data["username"], "bhavesh")

    def test_dpdp_gdpr_data_export(self):
        """Test DPDP Sec 12 / GDPR Art 20 data export returns complete user dossier"""
        user = User.objects.create_user(**self.user_data)
        Resume.objects.create(user=user, status="Completed", extracted_text="Bhavesh Resume Content")

        self.client.force_authenticate(user=user)
        response = self.client.get(self.export_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("compliance", response.data)
        self.assertEqual(response.data["compliance"]["right"], "Right to Data Portability")
        self.assertEqual(response.data["user_profile"]["username"], "bhavesh")
        self.assertEqual(len(response.data["resumes"]), 1)
        self.assertEqual(response.data["resumes"][0]["extracted_text"], "Bhavesh Resume Content")

    def test_dpdp_gdpr_delete_account_erasure(self):
        """Test DPDP Sec 12(3) / GDPR Art 17 erasure permanently shreds account and records"""
        user = User.objects.create_user(**self.user_data)
        Resume.objects.create(user=user, status="Completed", extracted_text="Bhavesh Resume")

        self.client.force_authenticate(user=user)

        # Requires confirmation
        fail_res = self.client.post(self.delete_url, {"confirm": False})
        self.assertEqual(fail_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(username="bhavesh").exists())

        # Successful erasure
        success_res = self.client.post(self.delete_url, {"confirm": True})
        self.assertEqual(success_res.status_code, status.HTTP_200_OK)
        self.assertEqual(success_res.data["status"], "Erased")
        self.assertFalse(User.objects.filter(username="bhavesh").exists())
        self.assertEqual(Resume.objects.filter(user_id=user.id).count(), 0)
