document.addEventListener('DOMContentLoaded', () => {
    submitPost();
    document.addEventListener('click', event => {
        element = event.target;
        if (element.id === "profile") {
            event.preventDefault();
            let user_id = element.dataset.id;
            load_profile_page(user_id, 1);
            // history.pushState({page: "index"}, "", `/`);  
            history.pushState({user_id: user_id, page_num:1}, "", `/profile?user=${user_id}&page=${1}`); 
            
        } else if (element.id === 'following-btn') {
            event.preventDefault();
            history.pushState({page: "following", page_num: 1}, "", `/following?page=1`);
            follow_page();
        }     
    })
})
   

// make every link a anchor tag 
// prevent default that tag 

async function following_data(page){
    let response = await fetch(`/followingpage/${page}`,{
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
    });
    return await response.json();
}


function follow_page(page_num=1){  
    following_data(page_num)
    .then(data => {
        ChangeView("profile-view");
        console.log(data)
        create_post_div(data.results);
        // create pagination 
    })
}

window.onpopstate = function (event) {
   //doo
    if (event.state.page === "index"){
        console.log("here")
        window.location.reload(true)
    } else if (event.state.user_id){
        let id = event.state.user_id;
        let page = event.state.page_num; 
        load_profile_page(id, page);

    } else if ( event.state.page === "following") {
        let page = event.state.page_num;
        follow_page(page);
    } else {
        
    }
    
}


async function is_logged_in(){
    let response = await fetch("status");
    return await response.json();
}

// for index page
// function like(){
//     document.addEventListener('click', event => {
//         element = event.target;
//         if (element.className === "like-btn"){

//         }
//     })
// }


async function  load_profile_page(user_id, page_num = 1) {
    let user_profile = await profile(user_id);
    if (user_profile != null ){
        let user_posts = await get_user_posts(user_id, page_num);
        ChangeView("profile-view");
        load_profile(user_profile, user_posts);
        document.body.scrollIntoView({behavior: "smooth"});
    } else {
        document.querySelector('#login').click();
    }
}
   


function create_profile_div(user_profile){
    let profile_div = document.querySelector('.usr-div');
    profile_div.innerHTML = "";

    let follow_data_div = document.createElement('div');
    follow_data_div.className = "follow-data flex";
    
    let name = document.createElement('p');
    let followers = document.createElement('p');
    let following = document.createElement('p');
    let followers_num = document.createElement('span');
    let following_num = document.createElement('span');

    name.innerHTML = user_profile.username.toLowerCase().charAt(0).toUpperCase() + user_profile.username.slice(1,);
    name.className ="fs-2 text fw-bold"
    followers_num.innerHTML = user_profile.followers_count;
    following_num.innerHTML = user_profile.following_count;
    followers.append("Followers", followers_num);
    following.append("Following", following_num);
    follow_data_div.append(followers, following);
    
    const user_id = document.querySelector("#user-id").dataset.id;
    if (user_id != user_profile.id){
        let btn = document.createElement('button');
        if (user_profile.following.includes(parseInt(user_id))) {
            btn.className = "btn btn-secondary";
            btn.innerHTML = "Unfollow";
            btn.onclick = () => {unfollow(user_profile.id)};
        } else {
            btn.className = "btn btn-success";
            btn.innerHTML = "Follow";
            btn.onclick = () => {follow(user_profile.id)};
        }
        profile_div.append(name, follow_data_div, btn);
    } else {
        profile_div.append(name, follow_data_div);
    }

}



async function like(id){
    let like_div = document.querySelector(`#like-${id}`);
    let likes = like_div.children[0];
    let like_btn = like_div.children[1];
    let response = await fetch(`like/${id}`, {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken}
    });
    let obj =  await response.json();
    likes.innerHTML = obj.likes_count;
    like_btn.innerHTML = "❤️";
    like_btn.onclick = () => {dislike(id)};
   
}


async function dislike(id){
    let like_div = document.querySelector(`#like-${id}`);
    let likes = like_div.children[0];
    let like_btn = like_div.children[1];
   
    let response = await fetch(`like/${id}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken}
    });
    let obj =  await response.json();
    likes.innerHTML = obj.likes_count;
    like_btn.innerHTML =  "🖤";
    like_btn.onclick = () => {like(id)};
   
}


function create_post_div(posts){
    const user_id = document.querySelector("#user-id").dataset.id;
    const profile_view = document.querySelector('#profile-view');
    posts.forEach(data=>{

        let post_div = document.createElement('div');
        post_div.className = "flex post";
        post_div.dataset.id = data.id;
        post_div.id = `post-${data.id}`;
    
        let name = document.createElement('a');
        name.href = "#";
        name.className = "fs-4 fw-semibold links";
        name.onclick = (e) => { e.preventDefault();  load_profile_page(data.author, 1);}
        name.innerHTML = data.username.toLowerCase().charAt(0).toUpperCase() + data.username.slice(1,);

        post_div.append(name);

        let body = document.createElement('p');
        body.innerHTML = data.body;
        post_div.append(body);

        let like_div = document.createElement('p');
        like_div.id = `like-${data.id}`;
        let likes = document.createElement('span');
        let like_btn = document.createElement('span');

        if (data.likes.includes(parseInt(user_id))){
            likes.innerHTML = data.likes_count;
            like_btn.innerHTML = "❤️";
            like_btn.className = "like-btn links";
            like_btn.onclick = () => {dislike(data.id)};
        } else {
            likes.innerHTML = data.likes_count;
            like_btn.innerHTML =  "🖤";
            like_btn.className = "like-btn links";
            like_btn.onclick = () => {like(data.id)};
        }
        like_div.append(likes, like_btn);
        post_div.append(like_div);

        let date = document.createElement('p');
        date.className = "text-muted fs-6";
        if (data.edited){
            date.innerHTML = `${data.modified} -Edited`;
        } else {
            date.innerHTML = data.created;
        }
        post_div.append(date)
        if (user_id == data.author){
                let edit_btn = document.createElement("a");
                edit_btn.className = "edit-link";
                edit_btn.href = "#";
                edit_btn.innerHTML = "Edit";
                if (!edit_btn.classList.contains('isDisabled')){    
                    edit_btn.onclick = ()=>{edit_post(data.id)};
                }
                post_div.append(edit_btn)
        }
        profile_view.append(post_div);
    });  

}



function disable_edit_btn(state){
    let edit_post_btn = document.querySelectorAll('.edit-link')
    if (state == true){
        edit_post_btn.forEach(btn =>{
            btn.classList.add('isDisabled');
            btn.onclick = null;
        });
    } else if (state == false) {
        edit_post_btn.forEach(btn =>{
            btn.classList.remove('isDisabled');
            let post_id = btn.parentElement.dataset.id;
            btn.onclick = (e)=>{
                e.preventDefault();
                edit_post(post_id);
            };
        });
    }
}



async function edit_post(id){
    let post_div = document.querySelector(`#post-${id}`);
    let post_id = post_div.dataset.id;
    let body = post_div.childNodes[1].innerText;
    disable_edit_btn(true);
    const form = document.createElement('form');
    const text_area = document.createElement('textarea');
    text_area.cols = "60";
    text_area.rows = "4";
    text_area.className = "form-control";
    text_area.value = body;

    const input_btn = document.createElement('input');
    input_btn.type = "submit";
    input_btn.value = "Save";
    input_btn.className = "btn btn-primary mb-3";
    input_btn.disabled = true;

    const form_div = document.createElement('div');
    form_div.id= "form";
    form_div.className = "form-floating";

    
    const cancel_btn = document.createElement('a');
    cancel_btn.href = "#";
    cancel_btn.innerHTML = "Cancel";
    cancel_btn.onclick = (e)=> {
        e.preventDefault();
        view.replaceChild(post_div,form_div);
        disable_edit_btn(false);
    }
   
    const btn_div = document.createElement('div');
    btn_div.append(input_btn, cancel_btn)

    form.append(text_area, btn_div);
    form_div.appendChild(form);

    const view = document.querySelector('#profile-view');
    view.replaceChild(form_div, post_div);

    text_area.onkeyup = ()=> {
       if (text_area.value.length < 1 || text_area.value == body){
            input_btn.disabled = true;
       } else {
            input_btn.disabled = false;
       }
    }
    input_btn.onclick = (e) => {
        e.preventDefault();
        let body = text_area.value;
        edit(post_id, body)
        .then(data => {
            post_div.childNodes[1].innerHTML = data.body;
            post_div.childNodes[2].childNodes[0].innerHTML = data.likes_count;
            post_div.childNodes[3].innerHTML = `${data.modified} -Edited`
            view.replaceChild(post_div ,form_div);
            disable_edit_btn(false);
        })
    }
}


async function edit(post_id, body){
    let response = await fetch(`/editpost/${post_id}`, {
        method: "PUT",
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
            post: body
        })
    })
    return response.json();

}


async function load_profile(user_profile, user_posts) {
    const profile_view = document.querySelector('#profile-view');
    profile_view.innerHTML = "";

    let posts = user_posts.results;

    let profile_div = document.createElement('div');
    profile_div.className = "flex usr-div";
    profile_div.dataset.id = user_profile.id;

    profile_view.append(profile_div);

    create_profile_div(user_profile);
    
    create_post_div(posts);

    let nav_list = document.createElement('ul');
    nav_list.className = "pagination";
    // do something with this nav
    // let nav = document.createElement('nav');
    
    profile_view.appendChild(nav_list);
    
    if (user_posts.has_previous) {
        let previous_btn = document.createElement('li');
        let previous_link = document.createElement('a'); 
        previous_link.href = "#";
        previous_link.innerHTML = "Previous";
        previous_link.className = "page-link";
        previous_btn.append(previous_link);

        previous_btn.className = "page-item";
        previous_btn.dataset.page_num = parseInt(user_posts.current_page) - 1;
        previous_btn.dataset.user_id = user_profile.id;
        nav_list.append(previous_btn);

        previous_link.onclick = async () => {
            let page_num = previous_btn.dataset.page_num;
            let user_id = previous_btn.dataset.user_id;
            let user_profile = await profile(user_id);
            let user_posts = await get_user_posts(user_id, page_num);
            history.pushState({user_id: user_id, page_num:page_num}, "", `/profile?user=${user_id}&page=${page_num}`);
            load_profile(user_profile, user_posts);
            document.body.scrollIntoView({behavior: "smooth"});
        }
    } 
    if (user_posts.has_next) {
        let next_btn = document.createElement('li');
        let next_link = document.createElement('a'); 
        next_link.href = "#";
        next_link.innerHTML = "Next";
        next_link.className = "page-link";
        next_btn.append(next_link);

        next_btn.className = "page-item";
        next_btn.dataset.page_num = parseInt(user_posts.current_page) + 1;
        next_btn.dataset.user_id = user_profile.id;
        nav_list.append(next_btn);
        next_link.onclick = async () => {
            let page_num = next_btn.dataset.page_num;
            let user_id = next_btn.dataset.user_id;
            let user_profile = await profile(user_id);
            let user_posts = await get_user_posts(user_id, page_num);
            history.pushState({user_id: user_id, page_num:page_num}, "", `/profile?user=${user_id}&page=${page_num}`);
            load_profile(user_profile, user_posts);
            document.body.scrollIntoView({behavior: "smooth"});
        }
    }
    
}


function follow(user_id){
    fetch(`/following/${user_id}`, {
        headers: {'X-CSRFToken': csrftoken},
        method: "POST"
    })
    .then(response => {
        if (response.status == 201){
            profile(user_id)
            .then( data => {
                create_profile_div(data);
            })
        }
    })
}


function unfollow(user_id){
    fetch(`/following/${user_id}`, {
        headers: {'X-CSRFToken': csrftoken},
        method: "PUT"
    })
    .then(response => {
        if (response.status == 201){
            profile(user_id)
            .then( data => {
                create_profile_div(data);
            }) 
        }
    })   
}


async function profile(user_id){
    let response = await fetch(`/profile/${user_id}`,{
        headers: {'X-CSRFToken': csrftoken},
    })
    if (response.status == 403) {
        return null;
    } else {
        return await response.json();
    }   
       
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
    if (document.querySelector('#sb-post') != null){
        document.querySelector('#sb-post').disabled = true;
        document.querySelector('#cancel-form-btn').classList.add("isDisabled"); 
        document.querySelector('#ta-post').onkeyup = () => {
            if (document.querySelector('#ta-post').value.length > 0){
                document.querySelector('#sb-post').disabled = false;
                document.querySelector('#cancel-form-btn').classList.remove("isDisabled");
                document.querySelector('#cancel-form-btn').onclick = cancel_post
            } else {
                document.querySelector('#cancel-form-btn').classList.add("isDisabled");
                document.querySelector('#sb-post').disabled = true;
            }
        }
        document.querySelector('#sb-post').onclick = new_post;
    }
   
}

function cancel_post(e){
    e.preventDefault()
    document.querySelector('#ta-post').value = "";
    document.querySelector('#cancel-form-btn').classList.add("isDisabled");
    document.querySelector('#sb-post').disabled = true;
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


async function get_user_posts(user_id, pagnum){
    let response = await fetch(`userpost/${user_id}/${pagnum}`, {
        headers: {'X-CSRFToken': csrftoken},
    })
    return await response.json()
}

