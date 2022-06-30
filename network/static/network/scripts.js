document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#sb-post').disabled = true; 
    document.querySelector('#ta-post').onkeyup = () => {
        if (document.querySelector('#ta-post').value.length > 0){
            document.querySelector('#sb-post').disabled = false;
        } else {
            document.querySelector('#sb-post').disabled = true;
        }
    }

    document.querySelector('#sb-post').onclick = new_post;
    


})


async function new_post(event){
    event.preventDefault();
    let post_data = document.querySelector('#ta-post').value;
    await create_post(post_data);
    document.querySelector('#ta-post').value = "";
    
}


async function create_post(post_data){
    return await fetch('/newpost', { 
        method: "POST",
        body: JSON.stringify({
            post: post_data
        })
    })
    
}



async function edit_post(post_id){

    let data = document.querySelector('#ta-post').value;

    return await fetch(`/post/${post_id}`, { 
        method: "PUT",
        body: JSON.stringify({
            post: data
        })
    })
    
}


async function all_post(){
   
    let response = await fetch('/allpost');
    let data = await response.json();
    console.log(data)
   
}


async function get_post(post_id){
    let response = await fetch(`/post/${post_id}`, {
        method: "GET"
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


async function profile(user_id){
    
    await fetch(`/profile/${user_id}`)   
   
}