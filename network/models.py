from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class post(models.Model):
    text_post = models.TextField(max_length=280)
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_post")
    created = models.DateField(auto_now_add=True)