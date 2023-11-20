let postId = 0;
let user;

const encoder = new TextEncoder('utf-8')


window.addEventListener('load', initialize);

const handleError =  function (err) {
  console.warn(err);
  alert("Some Error occured!");
  return;
}


async function initialize() {
  user = getSession()
  const postForm = document.getElementById('post-form');
  const signOutButton = document.getElementById('signout');
  const currentUserElm = document.getElementById('currentUsername');
  if (!user) {
    //Hide the form if no user
    postForm.style.display = 'none';
    currentUserElm.textContent = '';
    signOutButton.textContent = "Log in";
  } else {
    currentUserElm.textContent = user;
    signOutButton.textContent = "Sign out";
  }

  

  const result = await fetch('/api/feed').catch(handleError);
  const resultJson =  await result.json();
  if (!resultJson.posts) {
    alert("Some error occured in request");
    return;
  }

  await renderPosts(resultJson.posts);
}

async function processPost(post) {
  const go = new Go();
  for (const comment of post.comments) {
    //Initialize WASM
    const wasmInstance = await WebAssembly.instantiateStreaming(fetch('wordprocessor.wasm'), go.importObject);
    go.argv = ['wordprocessor.wasm', comment.comment_content]; //Pass Comment content to argv
    let memory = wasmInstance.instance.exports.mem.buffer;
    
    //Set shared variable at a 0x5000
    new Uint8Array(memory, 0x5000, 0x300).set(encoder.encode(post.post_content + "\0"));

    try {
      //Run WASM instance
      go.run(wasmInstance.instance);

      //Call GO module to transform comment
      comment.comment_content = toLeetSpeak(comment.comment_content);
      post.post_content = processSharedVar();
    } catch (err) {
      console.warn("GO couldn't process comment", comment);
      console.warn(err);
    }
  }

}

async function getPostHTML(post) {    
    //Process Text using GO WASM
    await processPost(post);

    let html =  `
        <p><strong>${post.post_author}</strong>: ${post.post_content}</p>
        <br/>
        <br/>
        <br/>
         -------------------------------------------------------
        `
        +
       `     
        <div class="comments" id="comments_${postId}">
      `;

      html += `<div>`;
      post.comments.forEach(function(comm) {
        html += getCommentHTML(comm.comment_author, comm.comment_content)
      });
      html += "</div>";
    if (user) {
      html += getCommentForm(post.id);
    }
    return html;
}
      
      

function getCommentForm(postId) {
  return `<div class="comment-form">
  <textarea id="commentText_${postId}" placeholder="Add a comment"></textarea>
  <button onclick="addComment(${postId})">Comment</button>
  </div>`
}

function getCommentHTML(commentUsername, commentText) {
  return `<p><strong>${commentUsername}</strong>: ${commentText}</p>`
}

function createPost() {
  const username = user;
  const postText = document.getElementById('postText').value.trim();
  
}


async function renderPosts(postsList) {
  for (const post of postsList) {
    const postContainer = document.getElementById('posts');
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = await getPostHTML(post);
    postContainer.prepend(postElement);
  };  
}

  
async function addComment(postId) {
  const commentUsername = user;
  const commentText = document.getElementById(`commentText_${postId}`).value.trim();
  //Network call to store comment in DB
  await fetch('/api/comment', {
      method: 'POST',
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      },
    body: JSON.stringify({user: commentUsername, post_id: postId, comment_content: commentText})
  }).catch(handleError);

  location.reload();
}

async function createPost() {
  const username = user;
  const postText = document.getElementById('postText').value.trim();
  //Network call to create post in DB and refresh
  await fetch('/api/post', {
    method: 'POST',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({user: username,  post_content: postText})
  }).catch(handleError);

  location.reload();
}

  
function signOut() {
  //Redirect to signOut
  destorySession();
  window.location.href = '/public';
}
