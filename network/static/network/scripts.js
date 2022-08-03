document.addEventListener('DOMContentLoaded', () => {

    is_logged_in()
    .then(data => {
    if (data.status === "true"){
        submitPost();
        document.addEventListener('click', event => {
            element = event.target;
            if (element.id === "profile") {
                let user_id = element.dataset.id;
                history.pushState({user_id: user_id, page_num: 1}, "", `/?user=${user_id}&page=1`);
                load_profile_page(user_id, 1)
                // console.log(user_profile)
                // console.log(user_posts)
            }
        })
    } else {
            document.addEventListener('click', event => {
                element = event.target;
                if (element.id === "profile") {
                    document.querySelector('#login').click();
                }
            })
        }
    })
})


window.onpopstate = function (event) {
   //doo
   if (event.state.user_id){
    let id = event.state.user_id;
    let page = event.state.page_num 
    load_profile_page(id, page);
   }
}


async function is_logged_in(){
    let response = await fetch("status");
    return await response.json();
}


function like(){
    document.addEventListener('click', event => {
        element = event.target;
        if (element.className === "like-btn"){

        }
    })
}




async function  load_profile_page(user_id, page_num) {
    let user_profile = await profile(user_id);
    // TODO repair load profile page in windowOnPopState
    let user_posts = await get_user_posts(user_id, 1);
    ChangeView("profile-view");
    load_profile(user_profile, user_posts);
}


function load_profile(user_profile, user_posts) {
    const profile_view = document.querySelector('#profile-view');
    profile_view.innerHTML = "";

    let posts = user_posts.results;
    let div = document.createElement('div');
    div.className = "follow-data";
    
    let name = document.createElement('p');
    let followers = document.createElement('p');
    let following = document.createElement('p');
    let followers_num = document.createElement('span');
    let following_num = document.createElement('span');

    name.innerHTML = user_profile.username.toLowerCase().charAt(0).toUpperCase() + user_profile.username.slice(1,);
    followers_num.innerHTML = user_profile.followers;
    following_num.innerHTML = user_profile.following;
    followers.append("Followers", followers_num);
    following.append("Following", following_num);
    div.append(followers, following);
    
    let profile_div = document.createElement('div');
    profile_div.className = "flex usr-div";
    profile_div.dataset.id = user_profile.id;
    is_logged_in()
    .then(data => { 
        if (data.user !== user_profile.id){
            let btn = document.createElement('button');
            if (data.user in user_profile.following) {
                btn.className = "btn btn-secondary";
                btn.innerHTML = "Unfollow";
                btn.onclick = () => {follow(user_profile.id)};
            } else {
                btn.className = "btn btn-success";
                btn.innerHTML = "Follow";
                btn.onclick = () => {follow(user_profile.id)};
            }
           
            profile_div.append(name, div, btn);
        } else {
            profile_div.append(name, div);
            
        }
     })
     profile_view.append(profile_div);
    
  
    posts.forEach( data => {
        let profile_name = document.createElement('p');
        let body = document.createElement('p');
        let date = document.createElement('p');
        let likes = document.createElement('p');

        let post_footer = document.createElement('div');
        post_footer.className = "post-footer";
        let span = document.createElement('span');
        span.innerHTML = "❤️";
        span.className = "like-btn links";
        
        profile_name.className = "fs-4 fw-semibold links";
        body.dataset.id = data.id;
        profile_name.innerHTML = data.username.toLowerCase().charAt(0).toUpperCase() + data.username.slice(1,);
        body.innerHTML = data.body;
        date.innerHTML = data.created;
        likes.innerHTML = data.likes;
        likes.append(span);
        post_footer.append(likes, date);
        let divider = document.createElement('div');
        divider.className = "divider";
        let div =  document.createElement('div');
        div.className = "flex post";

        is_logged_in()
        .then(json_data => {
            let user_id = json_data.user;
            if (user_id === data.author){
                let edit_btn = document.createElement("a");
                edit_btn.className = "edit-link";
                edit_btn.href = "#";
                edit_btn.innerHTML = "Edit";
                edit_btn.onclick = edit_post;
                div.append(divider, profile_name, body, post_footer, edit_btn);
            } else {
                div.append(divider, profile_name, body, post_footer);
            }
        })
        profile_view.append(div) 
    });


    let nav_list = document.createElement('ul');
    nav_list.className = "pagination";
    // do something with this nav
    // let nav = document.createElement('nav');
    
    profile_view.appendChild(nav_list);
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
            history.pushState({user_id: user_id, page_num:page_num}, "", `/?user=${user_id}&page=${page_num}`);
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
            history.pushState({user_id: user_id, page_num:page_num}, "", `/?user=${user_id}&page=${page_num}`);
            load_profile(user_profile, user_posts);
        }
    } 
}





async function edit_post(event){
   
    let post_element = event.target.parentElement;
    
    let user_id = post_element.parentElement.firstElementChild.dataset.id;
    let parent = post_element.parentElement;
    
    let cancel_btn = document.createElement('a');
    cancel_btn.href = "#";
    cancel_btn.innerHTML = "Cancel";

    let post_body = post_element.children.item(1).innerHTML;
    let post_id = post_element.children.item(1).dataset.id

    // const post_div = document.querySelector('#post');
    // let text_area = post_div.children.item(0).children.item(0);
    // let post_btn = post_div.children.item(0).children.item(1);


    let text_area = document.createElement("textarea");
    text_area.className = "form-control";

    let post_div = document.createElement('div');
    post_div.className = "form-floating";
    
    let form = document.createElement('form');

    let post_btn = document.createElement('input');
    post_btn.type = "submit";
    post_btn.className = "btn btn-primary mb-3";

    form.append(text_area, post_btn, cancel_btn);
    post_div.append(form);

    post_btn.onclick = async (event) => {
        event.preventDefault();
        if (text_area.value == post_body) {
            parent.replaceChild(post_element, post_div);
        } else {
            let body = text_area.value;
            let response = await fetch(`/post/${post_id}`, { 
                method: "PUT",
                headers: {'X-CSRFToken': csrftoken},
                body: JSON.stringify({
                    post: body
                })
            })
            let data = await response.json();
            // console.log(data);
            // send fetch call =- get current edited post 
        }
    }

    text_area.value = post_body;
    parent.replaceChild(post_div, post_element);

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





function follow(user_id){
    
    fetch(`/following/${user_id}`, {
        headers: {'X-CSRFToken': csrftoken},
        method: "POST"
    })
    .then(response => {
        if (response.status == 201){
            
        }
    })   

}


async function get_user_posts(user_id, pagnum){
    let response = await fetch(`userpost/${user_id}/${pagnum}`)
    return await response.json()
    
}



// first work on design and add 
// lots of lorem ispsum posts 
