
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # api
    path("allposts/<string:page>", views.all_post, name="allpost"),
    path("newpost", views.create_post, name="newpost"),
    path("post/<int:post_id>", views.post, name="post"),
    path("comment/<int:post_id>", views.comment, name="comment"),
    path("editcomment/<int:comment_id>", views.edit_comment, name="editcomment"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("following/<int:user_id>", views.following, name="following"),
    path("like/<int:post_id>", views.like, name="like"),
]
