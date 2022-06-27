from django.contrib.auth import authenticate, login, logout
import json
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


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
   
    if request.method == "GET":
        posts = Post.objects.all().order_by("created")
        return  JsonResponse([post.serialize() for post in posts], safe=False)
    

 
@csrf_exempt
@login_required
def create_post(request):

    if request.method == "POST":

        data = json.loads(request.body)
        if len(data.get("post")) < 1 or len(data.get("post")) > 280:
            return JsonResponse({"error": "post "})
        
        body = data.get("post")
        post = Post(body=body, author=request.user)
        post.save()
        return HttpResponse(status=201)
    else:
        return JsonResponse({"error": "only POST method"})

@login_required
def post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except:
        return JsonResponse({"no post"}, status=404)

    if request.method == "GET":
        return JsonResponse(post.serialize())

    if request.method == "PUT":
        
        data = json.loads(request.body)
        
        post.body = 