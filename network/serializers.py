from rest_framework import serializers

from network.models import User, Post


class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='author.username',
        read_only=True
    )
    likes_count = serializers.IntegerField(
        source='likes.count',
        read_only=True
    )
    created = serializers.DateTimeField(
        format="%b %d %Y, %I:%M %p"
    )
    modified = serializers.DateTimeField(
        format="%b %d %Y, %I:%M %p"
    )
    class Meta:
        model = Post
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(
            source='following.count', 
            read_only=True
        )
    following_count = serializers.IntegerField(
            source='follower_count', 
            read_only=True
        )
    class Meta:
        model = User
        fields = ['id', 'username', 'following_count', 'following', 'followers_count']