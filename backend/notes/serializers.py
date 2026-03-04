from rest_framework import serializers

from .models import Note, UploadedFile


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class UploadedFileSerializer(serializers.ModelSerializer):
    presigned_url = serializers.URLField(read_only=True)

    class Meta:
        model = UploadedFile
        fields = ["id", "key", "bucket", "created_at", "presigned_url"]
        read_only_fields = ["id", "key", "bucket", "created_at", "presigned_url"]
