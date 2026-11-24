from rest_framework import serializers
from .models import Resume


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id",
            "resume_file",
            "uploaded_at",
            "status",
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
            "status",
        ]

    def validate_resume_file(self, value):
        filename = value.name.lower()
        is_pdf = filename.endswith(".pdf")
        is_docx = filename.endswith(".docx")

        if not (is_pdf or is_docx):
            raise serializers.ValidationError("Only PDF and DOCX files are allowed.")

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Maximum file size is 5 MB.")

        # Validate magic header bytes for file authenticity
        try:
            initial_bytes = value.read(5)
            value.seek(0)
            if is_pdf and initial_bytes != b"%PDF-":
                raise serializers.ValidationError("The uploaded file is not a valid PDF document.")
            elif is_docx and not initial_bytes.startswith(b"PK"):
                raise serializers.ValidationError("The uploaded file is not a valid DOCX document.")
        except Exception as e:
            if isinstance(e, serializers.ValidationError):
                raise
            pass

        return value
