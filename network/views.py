from django.contrib.auth import authenticate, login, logout
import json
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Comment, Following


def index(request):
    return render(request, "network/index.html")


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



@login_required
def all_post(request):
   
   # get all post 
    if request.method == "GET":
        posts = Post.objects.all().order_by("created")
        return  JsonResponse([post.serialize() for post in posts], safe=False)
    

 
@csrf_exempt
@login_required
def create_post(request):

    if request.method == "POST":

        # check for post length
        data = json.loads(request.body)
        if len(data.get("post")) < 1 or len(data.get("post")) > 280:
            return JsonResponse({"error": "post length =  1 to 280"})
        
        # save user's post 
        body = data.get("post")
        post = Post(body=body, author=request.user)
        post.save()
        return HttpResponse(status=201)
    else:
        return JsonResponse({"error": "only POST method"})


@csrf_exempt
@login_required
def post(request, post_id):

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        # no post found
        return JsonResponse({"error": "No Post Found"}, status=404)

    if request.method == "GET":
        # get particular post
        return JsonResponse(post.serialize())


    if request.method == "PUT":

        # ceck is user is post's author 
        if request.user != post.author:
            return JsonResponse({"error": "Not Authorised"}, status=403)

        data = json.loads(request.body)

        if len(data.get("post")) < 1 or len(data.get("post")) > 280:
            return JsonResponse({"error": "post"}, status=400)

        # save edited post 
        post.body = data.get("post")
        post.edited = True
        post.save()
        return HttpResponse(status=201)

    return JsonResponse({"error": "only GET & PUT request accepted"}, status=405)



@login_required
@csrf_exempt
def comment(request, post_id):

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post Doesn't Exists"}, status=400)


    if request.method == "GET":
        comments = Comment.objects.all()
        print(comments[0].commentor)
        return JsonResponse([comment.serialize() for comment in comments], safe=False)
    
    if request.method == "POST":
        data = json.loads(request.body)
        
        if len(data.get("comment")) < 1 or len(data.get("comment")) > 380:
            return HttpResponse(status=401)
        
        comment = Comment(comment=data.get("comment"), post=post, commentor=request.user)
        comment.save()
        print("saved")
        return HttpResponse(status=201)
    
    return JsonResponse({"error": "POST & GET only"}, status=405)