from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):

    following = models.ManyToManyField("self", blank=True, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "following": self.following.count(),
            "followers": User.objects.filter(following=self).all().count(),
            "posts": [post.serialize() for post in self.user_post.all()],
        }


class Post(models.Model):

    body = models.TextField(max_length=280, null=False)
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_post")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    edited = models.BooleanField(default=False)
    likes = models.ManyToManyField("User", related_name="like_post")

    def serialize(self):
        return {
            "id": self.id,
            "body": self.body,
            "author": self.author.id,
            "created": self.created.strftime("%b %d %Y, %I:%M %p"),
            "modified": self.modified.strftime("%b %d %Y, %I:%M %p"),
            "edited": self.edited,
            "likes":  self.likes.all().count(),
            "comments": self.comments.all().count()
        }


class Comment(models.Model):

    comment = models.TextField(max_length=300, null=False)
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    commentor = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comment")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    edited = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "comment": self.comment,
            "created": self.created.strftime("%b %d %Y, %I:%M %p"),
            "modified": self.modified.strftime("%b %d %Y, %I:%M %p"),
            "edited": self.edited,
            "commentor":  self.commentor.username,
        }
