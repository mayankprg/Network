document.addEventListener('DOMContentLoaded', async () => {

    

    let response = await fetch("status");
    let data = await response.json();
    if (data.status === "true"){
        submitPost();
        viewProfile();
    } 



})


window.onpopstate = function (event) {
    console.log(event.state.user_id);

}


function viewProfile(){

    document.addEventListener('click', async event => {
        element = event.target;
        if (element.id === "profile") {

            const user_id = element.dataset.id;
            
            let user_profile = await profile(user_id);
            
            let user_posts = await get_user_posts(user_id, 1);

            history.pushState({user_id: user_id}, "", `/?user=${user_id}`);
            
            ChangeView("profile-view");

            load_profile(user_profile, user_posts);
            
            
            

            // console.log(user_profile)
            // console.log(user_posts)


        }
    })
}


function load_profile(user_profile, user_posts) {

    const profile_view = document.querySelector('#profile-view');
    profile_view.innerHTML = "";

    let posts = user_posts.results;

    let name = document.createElement('p');
    let followers = document.createElement('p');
    let following = document.createElement('p');

    name.innerHTML = user_profile.username;
    followers.innerHTML = user_profile.followers;
    following = user_profile.following;

    let profile_div = document.createElement('div');
    profile_div.append(name, followers, following)

    profile_view.append(profile_div)

    posts.forEach(data => {
        
        let profile_name = document.createElement('p');
        let body = document.createElement('p');
        let created = document.createElement('p');
        let likes = document.createElement('p');

        profile_name.innerHTML = data.username
        body.innerHTML = data.body
        created.innerHTML = data.created
        likes.innerHTML = data.likes

        let div =  document.createElement('div');

        div.className = "flex post";
        div.append(profile_name, body, created, likes)

        profile_view.append(div) 
    });


    const nav_list = document.createElement('ul');
    const nav = document.createElement('nav');
    nav_list.className = "pagination";


    profile_view.append(nav_list);

    if (user_posts.has_previous) {
        let = previous_btn = document.createElement('li');
        previous_btn.innerHTML = "Previous";
        previous_btn.className = "page-link";
        previous_btn.dataset.page_num = parseInt(user_posts.current_page) - 1;
        previous_btn.dataset.user_id = user_profile.id;
        nav_list.append(previous_btn)

        previous_btn.onclick = async () => {
            let page_num = previous_btn.dataset.page_num;
            let user_id = previous_btn.dataset.user_id;
            let user_profile = await profile(user_id);
            let user_posts = await get_user_posts(user_id, page_num);
            history.pushState({user_id: user_id}, "", `/?user=${user_id}`);
            load_profile(user_profile, user_posts);

            
        }

    } 

    if (user_posts.has_next) {
        let = next_btn = document.createElement('li');
        next_btn.innerHTML = "Next";
        next_btn.className = "page-link";
        next_btn.dataset.page_num = parseInt(user_posts.current_page) + 1;
        next_btn.dataset.user_id = user_profile.id;
        nav_list.append(next_btn);

        next_btn.onclick = async () => {
            let page_num = next_btn.dataset.page_num;
            let user_id = next_btn.dataset.user_id;

            let user_profile = await profile(user_id);
            
            let user_posts = await get_user_posts(user_id, page_num);
            history.pushState({user_id: user_id}, "", `/?user=${user_id}`);
            load_profile(user_profile, user_posts);

            
        }

    } 

   


    
}






async function profile(user_id){
    
    let res = await fetch(`/profile/${user_id}`,{
        headers: {'X-CSRFToken': csrftoken},
    })   
    return await res.json();
    
    
}




function ChangeView(view){

    if (view === "profile-view"){
        document.querySelector('#profile-view').style.display = 'flex';
        document.querySelector('#posts-view').style.display = 'none';
        
    } else if (view === "posts-view") {
        document.querySelector('#profile-view').style.display = 'none';
        document.querySelector('#posts-view').style.display = 'flex';
    }

        

}

function submitPost() {
    document.querySelector('#sb-post').disabled = true; 
        document.querySelector('#ta-post').onkeyup = () => {
            if (document.querySelector('#ta-post').value.length > 0){
                document.querySelector('#sb-post').disabled = false;
            } else {
                document.querySelector('#sb-post').disabled = true;
            }
        }
        document.querySelector('#sb-post').onclick = new_post;
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');


async function new_post(event){
    event.preventDefault();
    let post_data = document.querySelector('#ta-post').value;
    await create_post(post_data);
    document.querySelector('#ta-post').value = "";
    document.querySelector('#sb-post').disabled = true;
    
}


async function create_post(post_data){
    return await fetch('/newpost', { 
        method: "POST",
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
            post: post_data
        })
    })
    
    
}



async function edit_post(post_id){

    let data = document.querySelector('#ta-post').value;

    return await fetch(`/post/${post_id}`, { 
        method: "PUT",
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
            post: data
        })
    })
    
}


async function all_posts(page){
   
    let response = await fetch(`/allposts/${page}`);
    let data = await response.json();
    console.log(data)
   
}


async function get_post(post_id){
    let response = await fetch(`/post/${post_id}`, {
        method: "GET",
        headers: {'X-CSRFToken': csrftoken},
    })
    let data = response.json();
    console.log(data);
}


async function comment(post_id){
   
    let response = await fetch(`/comment/${post_id}`, {
        method: "GET"   
    })
    let data = await response.json();
    console.log(data);
    
}


async function comments(post_id){
    
    await fetch(`/comment/${post_id}`, {
        method: "POST",
        body: JSON.stringify({
            comment: "erojthk"
        })   
    })
  
    
}



async function editcomment(comment_id){
    
    await fetch(`/editcomment/${comment_id}`, {
        method: "PUT",
        body: JSON.stringify({
            comment: "commment edited"
        })   
    })
  
    
}



async function follow(user_id){
    
    await fetch(`/following/${user_id}`, {
        headers: {'X-CSRFToken': csrftoken},
        method: "POST"
    })   

}


async function get_user_posts(user_id, pagnum){
    let response = await fetch(`api/${user_id}/${pagnum}`)
    return await response.json()
    
}