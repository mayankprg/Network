
from django.urls import path

from . import views
from .views import IndexView
urlpatterns = [

    path("", IndexView.as_view(), name="index"),

    # path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
 
    # api
    path("followingpage/<int:page_num>", views.following_page, name="followingpage"),
    path("newpost", views.create_post, name="newpost"),
   
    path("profile/<int:user_id>", views.profile, name="profile"),
    
    path("like/<int:post_id>", views.like, name="like"),
    
    path("following/<int:user_id>", views.following, name="following"),
    path("status", views.status, name="status"),
    path("editpost/<int:post_id>", views.edit_post, name="editpost"),
    path("userpost/<int:user_id>/<int:page_num>", views.postPage, name="userpost")
]
