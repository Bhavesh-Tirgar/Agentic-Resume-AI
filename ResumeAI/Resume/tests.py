from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from Resume.models import Resume
from Resume.serializers import ResumeUploadSerializer


class ResumeAppTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="Password123!")
        self.other_user = User.objects.create_user(username="otheruser", password="Password123!")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.valid_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF"

    def test_serializer_rejects_non_pdf(self):
        """Test serializer validation rejects non-PDF files"""
        file = SimpleUploadedFile("resume.txt", b"plain text content", content_type="text/plain")
        serializer = ResumeUploadSerializer(data={"resume_file": file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("resume_file", serializer.errors)

    def test_serializer_rejects_oversized_file(self):
        """Test serializer validation rejects files > 5MB"""
        large_content = b"%PDF-" + b"0" * (6 * 1024 * 1024)
        file = SimpleUploadedFile("large_resume.pdf", large_content, content_type="application/pdf")
        serializer = ResumeUploadSerializer(data={"resume_file": file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("resume_file", serializer.errors)

    def test_serializer_rejects_invalid_magic_bytes(self):
        """Test serializer validation rejects fake PDF with invalid header"""
        fake_content = b"NOTAPDF_HEADER"
        file = SimpleUploadedFile("fake.pdf", fake_content, content_type="application/pdf")
        serializer = ResumeUploadSerializer(data={"resume_file": file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("resume_file", serializer.errors)

    def test_serializer_accepts_valid_pdf(self):
        """Test serializer validation accepts valid PDF"""
        file = SimpleUploadedFile("valid.pdf", self.valid_pdf_content, content_type="application/pdf")
        serializer = ResumeUploadSerializer(data={"resume_file": file})
        self.assertTrue(serializer.is_valid())

    def test_resume_list_endpoint_isolates_users(self):
        """Test GET /api/resume/ lists only the authenticated user's resumes"""
        r1 = Resume.objects.create(user=self.user, status="Completed", extracted_text="User 1 text")
        r2 = Resume.objects.create(user=self.other_user, status="Completed", extracted_text="User 2 text")

        response = self.client.get(reverse("resume-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in response.data]
        self.assertIn(r1.id, ids)
        self.assertNotIn(r2.id, ids)

    def test_resume_detail_and_delete(self):
        """Test GET and DELETE /api/resume/<id>/"""
        resume = Resume.objects.create(user=self.user, status="Completed", extracted_text="Sample text content")
        detail_url = reverse("resume-detail", kwargs={"resume_id": resume.id})

        # Test GET
        get_res = self.client.get(detail_url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["id"], resume.id)

        # Test DELETE
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(Resume.objects.filter(id=resume.id).exists())
