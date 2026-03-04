import uuid

import boto3
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Note
from .models import UploadedFile
from .serializers import NoteSerializer, UploadedFileSerializer


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer


class UploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        upload_file = request.FILES.get("file")
        if not upload_file:
            return Response({"detail": "Missing 'file' field."}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.AWS_S3_BUCKET:
            return Response({"detail": "AWS_S3_BUCKET is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        object_key = f"{settings.AWS_S3_PREFIX}{uuid.uuid4()}_{upload_file.name}"
        s3_client = boto3.client("s3", region_name=settings.AWS_REGION)

        s3_client.upload_fileobj(upload_file, settings.AWS_S3_BUCKET, object_key)
        UploadedFile.objects.create(key=object_key, bucket=settings.AWS_S3_BUCKET)
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_S3_BUCKET, "Key": object_key},
            ExpiresIn=600,
        )

        return Response(
            {
                "key": object_key,
                "bucket": settings.AWS_S3_BUCKET,
                "presigned_url": presigned_url,
            },
            status=status.HTTP_201_CREATED,
        )


class UploadedFileListView(APIView):
    def get(self, request, *args, **kwargs):
        if not settings.AWS_S3_BUCKET:
            return Response({"detail": "AWS_S3_BUCKET is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        s3_client = boto3.client("s3", region_name=settings.AWS_REGION)
        uploads = UploadedFile.objects.all()[:100]

        response_payload = []
        for upload in uploads:
            presigned_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": upload.bucket, "Key": upload.key},
                ExpiresIn=600,
            )
            serialized = UploadedFileSerializer(upload).data
            serialized["presigned_url"] = presigned_url
            response_payload.append(serialized)

        return Response(response_payload, status=status.HTTP_200_OK)


class UploadedFileDetailView(APIView):
    def delete(self, request, upload_id, *args, **kwargs):
        upload = UploadedFile.objects.filter(id=upload_id).first()
        if not upload:
            return Response({"detail": "Upload not found."}, status=status.HTTP_404_NOT_FOUND)

        s3_client = boto3.client("s3", region_name=settings.AWS_REGION)
        s3_client.delete_object(Bucket=upload.bucket, Key=upload.key)
        upload.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
