from dataclasses import field
from rest_framework import serializers

from network.models import User, Comment, Post

class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='author.username',
        read_only=True
    )
    likes = serializers.CharField(
        source='likes.count',
        read_only=True
    )
    class Meta:
        model = Post
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    following_count = serializers.IntegerField(
            source='following.count', 
            read_only=True
        )
    followers = serializers.IntegerField(
            source='followers_count', 
            read_only=True
        )
    class Meta:
        model = User
        fields = ['id', 'username', 'following', 'followers', 'following_count']