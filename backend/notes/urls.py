from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import NoteViewSet, UploadedFileDetailView, UploadedFileListView, UploadView

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")

urlpatterns = [
    path("", include(router.urls)),
    path("upload/", UploadView.as_view(), name="upload"),
    path("uploads/", UploadedFileListView.as_view(), name="uploads"),
    path("uploads/<int:upload_id>/", UploadedFileDetailView.as_view(), name="upload-detail"),
]
