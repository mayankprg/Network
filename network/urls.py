
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # api
    path("allpost", views.all_post, name="allpost"),
    path("newpost", views.create_post, name="newpost"),
    path("post/<int:post_id>", views.post, name="post"),
    path("comment/<int:post_id>", views.comment, name="comment"),
]
