from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import NoteViewSet, UploadView

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")

urlpatterns = [
    path("", include(router.urls)),
    path("upload/", UploadView.as_view(), name="upload"),
]
