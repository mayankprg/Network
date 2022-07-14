document.addEventListener('DOMContentLoaded', async () => {

  
    let response = await fetch("status");
    let data = await response.json();
    if (data.status === "true"){
        submitPost();
        viewProfile();
    } 



})


function viewProfile(){

    document.addEventListener('click', async event => {
        element = event.target;
        if (element.id === "profile") {
            
            user_id = element.dataset.id;
            let user_profile = await profile(user_id);
            let posts = await getPage(user_id, 1);
            ChangeView("profile-view");
            console.log(user_profile)
            console.log(posts)

            const profileView = document.querySelector('#profile-view');


            let author = document.createElement('p');
            let following = document.createElement('p');
            let followers = document.createElement('p');
            let follow = document.createElement('button');

            let page = await getPage(user_id, 1);
            let div = document.createElement('div')
            div.innerHTML = page;
            profileView.append(div)
            

            

            
            profileView.append(author)
        }
    })
}


async function profile(user_id){
    
    let res = await fetch(`/profile/${user_id}`,{
        headers: {'X-CSRFToken': csrftoken},
    })   
    return await res.json();
    
    
}




function ChangeView(view){

    if (view === "profile-view"){
        document.querySelector('#profile-view').style.display = 'block';
        document.querySelector('#post').style.display = 'none';
        
    } else if (view === "posts-view") {
        document.querySelector('#profile-view').style.display = 'none';
        document.querySelector('#post').style.display = 'block';
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


async function getPage(user_id, pagnum){
    let response = await fetch(`api/${user_id}/${pagnum}`)
    return await response.json()
    
}