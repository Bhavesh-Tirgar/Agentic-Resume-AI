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
        if not filename.endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed.")

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Maximum file size is 5 MB.")

        # Validate PDF magic header bytes
        try:
            initial_bytes = value.read(5)
            value.seek(0)
            if initial_bytes != b"%PDF-":
                raise serializers.ValidationError("The uploaded file is not a valid PDF document.")
        except Exception as e:
            if isinstance(e, serializers.ValidationError):
                raise
            pass

        return value
