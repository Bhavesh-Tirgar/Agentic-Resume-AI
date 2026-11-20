from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.token_url = reverse("token_obtain_pair")
        self.profile_url = reverse("profile")
        
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
