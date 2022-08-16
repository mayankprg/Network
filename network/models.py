from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):

    following = models.ManyToManyField("self", blank=True, symmetrical=False)

    def follower_count(self):
        return  User.objects.filter(following=self).count()

class Post(models.Model):

    body = models.TextField(null=False)
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_post")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    edited = models.BooleanField(default=False)
    likes = models.ManyToManyField("User", blank=True, related_name="like_post")


