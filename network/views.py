from django.contrib.auth import authenticate, login, logout
import json
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.views.generic import ListView
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions

from network.serializers import PostSerializer, UserSerializer


from .models import User, Post, Comment




 
@api_view(['GET'])
# @permission_classes((permissions.AllowAny,))
def postPage(request, user_id, page_num):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponse(status=404)
    # user has no posts
    if not Post.objects.filter(author=user).exists():
        return JsonResponse({"error": "does not exists"}, status=404)
    posts = Post.objects.filter(author=user).all().order_by("created")
    posts_obj = Paginator(posts, 10)
    page = posts_obj.page(page_num)
    page_obj = page.object_list
    context = {
        "has_next": page.has_next(),
        "has_previous": page.has_previous(),
        "page_count": posts_obj.num_pages,
        "current_page": page.number,
        "results": [PostSerializer(page).data for page in page_obj]
    }
    return Response(context)




# def index(request):
#     if request.method == "GET":
#         allPosts = Post.objects.all().order_by("created")
#         page_obj = Paginator(allPosts, per_page=10)
#         return render(request, "network/index.html", {"page_obj": page_obj})


class IndexView(ListView):
    model = Post
    template_name = 'network/index.html'
    ordering = ['-created']
    paginate_by = 10


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))



def status(request):
    if request.user.is_authenticated:
        return JsonResponse({"status": "true", "user": request.user.id}, safe=False)
    return JsonResponse({"status": "false"}, safe=False)


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })
        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def all_posts(request, page):
    """ get all posts of particular page """
    if not str(page):
        return JsonResponse({"error": "Choose All Post/Following's post"}, status=400)
    if str(page) == "allposts":
        # get all posts
        posts = Post.objects.all().order_by("created")
        return  JsonResponse([post.serialize() for post in posts], safe=False) 
    if request.user.is_authenticated and str(page) == "following": 
        if not User.objects.filter(following=request.user).exists():
             return  JsonResponse({"error": "Not following anyone"}, status=400)
        # get posts of followed users
        following = User.objects.filter(following=request.user)
        posts = Post.objects.filter(author=following[0])
        for user in following[1:]:
            posts |= Post.objects.filter(author=user)
        return  JsonResponse([post.serialize() for post in posts], safe=False)
    return  JsonResponse({"error": "Login Required/ following"}, status=401)


@login_required
def create_post(request):
    """ create new post """
    if request.method == "POST":
        # check for post length
        data = json.loads(request.body)
        if len(data.get("post")) < 1 or len(data.get("post")) > 280:
            return JsonResponse({"error": "post length =  1 to 280"}, status=400)
        # save user's post 
        body = data.get("post")
        post = Post(body=body, author=request.user)
        post.save()
        return HttpResponse(status=201)
    else:
        return JsonResponse({"error": "only POST method"}, status=405)


@login_required
@api_view(['PUT'])
def post(request, post_id):
    """ get particular post or edit post """
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        # no post found
        return JsonResponse({"error": "No Post Found"}, status=400)
   
    if request.method == "PUT":
        # ceck is user is post's author 
        if request.user != post.author:
            return JsonResponse({"error": "Not Authorised"}, status=403)
        data = json.loads(request.body)
        if len(data.get("post")) < 1 or len(data.get("post")) > 280:
            return JsonResponse({"error": "post not valid"}, status=400)
        # save edited post 
        post.body = data.get("post")
        post.edited = True
        post.save()
        data = PostSerializer(post).data
        return Response({"post": data}, status=201)
    return JsonResponse({"error": "only PUT request accepted"}, status=405)



@login_required
def comment(request, post_id):
    """ get all comments or create a new comment """
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post Doesn't Exists"}, status=400)
    if request.method == "GET":
        # get all comments for particular post
        comments = Comment.objects.all()
        return JsonResponse([comment.serialize() for comment in comments], safe=False)
    if request.method == "POST":
        data = json.loads(request.body)
        if len(data.get("comment")) < 1 or len(data.get("comment")) > 300:
            return HttpResponse(status=400)
        # save new comment
        comment = Comment(comment=data.get("comment"), post=post, commentor=request.user)
        comment.save()
        return HttpResponse(status=201)
    return JsonResponse({"error": "POST & GET only"}, status=405)



@login_required
def edit_comment(request, comment_id):
    """ Edit the exsiting comment """
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"error": "Comment Doesn't Exists"}, status=400)
    if request.method == "PUT":
        # only for author of the comment
        if comment.commentor != request.user:
            return HttpResponse(status=403)
        data = json.loads(request.body)
        if len(data.get("comment")) < 1 or len(data.get("comment")) > 300:
            return HttpResponse(status=400)
        # save edited comment
        comment.comment = data.get("comment")
        comment.edited = True
        comment.save()
        return HttpResponse(status=201)
    return JsonResponse({"error": "PUT only"}, status=405)


@api_view(['GET'])
@login_required
def profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User Doesn't Exists"}, status=400)
    return Response(UserSerializer(user).data)
  

@login_required
@api_view(['POST', 'PUT'])
def following(request, user_id):
    """ follow and unfollow user """
    try: 
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User Doesn't Exists"}, status=400)
    if request.user == user:
        return Response({"error": "Can't follow/unfollow self"}, status=400)
    current_user = request.user
    if request.method == "POST":
        if current_user in user.following.all():
            print(current_user.following.all())
            return Response({"error": "Already Following"}, status=400)
        # follow user
        user.following.add(current_user)
        user.save()
        return HttpResponse(status=201)
    if request.method == "PUT":
        if current_user not in user.following.all():
            return Response({"error": "Not Following"}, status=400)
        # unfollow user
        user.following.remove(current_user)
        user.save()
        return HttpResponse(status=201)
    return Response({"error": "PUT & POST only"}, status=405)


@login_required
@api_view(['PUT', 'POST'])
def like(request, post_id):
    """ like and unlike post """
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post Doesn't Exists"}, status=400)
    if request.method == "POST":
        if request.user in post.likes.all():
            return JsonResponse({"error": "Already liked"}, status=400)
        post.likes.add(request.user)
        post.save()
        data = PostSerializer(post).data
        return Response(data,status=201)
    if request.method == "PUT":
        if request.user not in post.likes.all():
            return JsonResponse({"error": "Not liked"}, status=400)
        post.likes.remove(request.user)
        post.save()
        data = PostSerializer(post).data
        return Response(data,status=201)
    return JsonResponse({"error": "PUT & POST only"}, status=405)

