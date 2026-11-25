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

    def test_storage_agnostic_stream_pdf_extraction(self):
        """Test extract_text_from_pdf reads in-memory bytes without requiring disk .path (S3 compatible)"""
        import pymupdf
        from Resume.Utils.pdfExtractor import extract_text_from_pdf

        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text((72, 72), "Jane Doe - Senior Python & Distributed Systems Engineer\nBuilt high-throughput REST APIs, Redis session stores, and cloud storage pipelines in AWS S3.")
        pdf_bytes = doc.tobytes()
        doc.close()

        extracted = extract_text_from_pdf(pdf_bytes, filename="cloud_resume.pdf")
        self.assertIn("Senior Python & Distributed Systems Engineer", extracted)

    def test_one_free_resume_quota_and_at_cost_unlock(self):
        """Test 1 free resume limit, 402 paywall on 2nd upload, and at-cost credit unlock."""
        import os
        from unittest.mock import patch
        import pymupdf

        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text((72, 72), "Alex Rivera - Backend Engineer with Python, Django, PostgreSQL, Redis, Docker.")
        pdf_bytes = doc.tobytes()
        doc.close()

        upload_url = reverse("resume-upload")
        quota_url = reverse("resume-quota")
        unlock_url = reverse("resume-quota-unlock")

        # 1. Initial quota: 1 free remaining, 0 paid credits
        q_res = self.client.get(quota_url)
        self.assertEqual(q_res.status_code, status.HTTP_200_OK)
        self.assertEqual(q_res.data["free_remaining"], 1)
        self.assertEqual(q_res.data["paid_credits"], 0)

        # 2. 1st resume upload is free
        f1 = SimpleUploadedFile("first.pdf", pdf_bytes, content_type="application/pdf")
        r1 = self.client.post(upload_url, {"resume_file": f1}, format="multipart")
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r1.data["quota"]["free_remaining"], 0)

        # Deleting 1st resume must NOT reset free quota
        self.client.delete(reverse("resume-detail", kwargs={"resume_id": r1.data["resume_id"]}))

        # 3. 2nd resume upload hits 402 Payment Required
        f2 = SimpleUploadedFile("second.pdf", pdf_bytes, content_type="application/pdf")
        r2 = self.client.post(upload_url, {"resume_file": f2}, format="multipart")
        self.assertEqual(r2.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertEqual(r2.data["code"], "QUOTA_EXCEEDED")

        # 4. Unlock 1 at-cost credit in sandbox mode
        with patch.dict(os.environ, {"ALLOW_SANDBOX_TOPUP": "True"}):
            unlock_res = self.client.post(unlock_url, {"credits": 1}, format="json")
        self.assertEqual(unlock_res.status_code, status.HTTP_200_OK)
        self.assertEqual(unlock_res.data["quota"]["paid_credits"], 1)

        # 5. 2nd resume upload now succeeds and consumes the paid credit
        f3 = SimpleUploadedFile("second_unlocked.pdf", pdf_bytes, content_type="application/pdf")
        r3 = self.client.post(upload_url, {"resume_file": f3}, format="multipart")
        self.assertEqual(r3.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r3.data["quota"]["paid_credits"], 0)

    def test_razorpay_order_verify_and_replay_protection(self):
        """Test Razorpay order creation, HMAC-SHA256 verification, tampered signature rejection, and replay guard."""
        import hashlib
        import hmac
        import os
        from unittest.mock import patch

        order_url = reverse("resume-quota-order")
        verify_url = reverse("resume-quota-verify")
        secret = "rzp_test_secret_12345"

        with patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_key", "RAZORPAY_KEY_SECRET": secret}):
            with patch("Authentication.views.requests.post") as mock_post:
                mock_post.return_value.status_code = 200
                mock_post.return_value.json.return_value = {"id": "order_test_999", "amount": 2900, "currency": "INR"}
                mock_post.return_value.raise_for_status.return_value = None

                order_res = self.client.post(order_url, {"credits": 1}, format="json")
                self.assertEqual(order_res.status_code, status.HTTP_200_OK)
                self.assertEqual(order_res.data["mode"], "razorpay")
                self.assertEqual(order_res.data["order_id"], "order_test_999")

            # Tampered signature -> 402
            bad_res = self.client.post(
                verify_url,
                {
                    "razorpay_order_id": "order_test_999",
                    "razorpay_payment_id": "pay_test_777",
                    "razorpay_signature": "tampered_sig",
                    "credits": 1,
                },
                format="json",
            )
            self.assertEqual(bad_res.status_code, status.HTTP_402_PAYMENT_REQUIRED)

            # Valid Razorpay HMAC-SHA256 signature -> 200 and credits added
            valid_sig = hmac.new(secret.encode(), b"order_test_999|pay_test_777", hashlib.sha256).hexdigest()
            ok_res = self.client.post(
                verify_url,
                {
                    "razorpay_order_id": "order_test_999",
                    "razorpay_payment_id": "pay_test_777",
                    "razorpay_signature": valid_sig,
                    "credits": 1,
                },
                format="json",
            )
            self.assertEqual(ok_res.status_code, status.HTTP_200_OK)
            self.assertEqual(ok_res.data["quota"]["paid_credits"], 1)

            # Replay same payment_id -> 409 Conflict
            replay_res = self.client.post(
                verify_url,
                {
                    "razorpay_order_id": "order_test_999",
                    "razorpay_payment_id": "pay_test_777",
                    "razorpay_signature": valid_sig,
                    "credits": 1,
                },
                format="json",
            )
            self.assertEqual(replay_res.status_code, status.HTTP_409_CONFLICT)
