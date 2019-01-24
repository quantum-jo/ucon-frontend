if (!localStorage.getItem("jwtToken"))
  window.location.replace("./login.html");

function parseJwt () {
    let token = localStorage.getItem("jwtToken");
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
};

function acceptFriend(button, from) {
  $.ajax({
    method: "PUT",
    url: "http://localhost:3000/friendrequests",
    crossDomain: true,
    data: `from=${from}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    beforeSend: () => {
      button.disabled = true;
    },
    success: result => {
      console.log("accepted", {result})
      renderFriendRequests();
      renderFriends();
    },
    error: err => {
      console.log({err})
    }
  });
}

function rejectFriend(button, from) {
  $.ajax({
    method: "DELETE",
    url: "http://localhost:3000/friendrequests",
    crossDomain: true,
    data: `from=${from}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    beforeSend: () => {
      button.disabled = true;
    },
    success: result => {
      console.log("rejected", {result})
      renderFriendRequests();
    },
    error: err => {
      console.log({err})
    }
  });
}

function renderFriendRequests() {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/friendrequests",
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      let friendsHTML = "";
      console.log({result});
      result.friendrequests.forEach(friendRequest => {
        friendsHTML += friendsTemplate(friendRequest)
      });
      $("#friendRequests").html(`<ul class="list-group">` + friendsHTML + `</ul>`);
    },
    error: err => {
      console.log({ err });
    }
  });
}

function renderFriends() {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/user/friends",
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      let friendsListHTML = "";
      console.log("friendsList", {result});
      result.message.forEach(friend => {
        friendsListHTML += `<li class="list-group-item">${friend}</li>`
      });
      $("#friendsList").html(`<ul class="list-group">` + friendsListHTML + `</ul>`);
    },
    error: console.log
  });
}

function toggleLike(post_id, btn) {
  let button = $(btn);
  button.attr("disabled", true);
  $.ajax({
    method: "POST",
    url: "http://localhost:3000/post/like",
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: {post_id: post_id},
    success: result => {
      console.log("like res", result);
      let likes = Number(button.find("span").text());
      if (result.message === "Post unliked") {
        likes = likes - 1;
        button.find("span").text(likes);
        button.removeClass("btn-primary").addClass("btn-light");
        button.attr("disabled", false);
      } else {
        likes = likes + 1;
        button.find("span").text(likes);
        button.removeClass("btn-light").addClass("btn-primary");
        button.attr("disabled", false);
      }
    },
    error: console.log
  });
}

function postTemplate(post) {
  return (
    `<div class="card col-sm-11 col-md-8 m-auto">
      <div class="card-body">
        ${post.image
          ? `<img class="img-fluid" src="${"http://localhost:3000" + post.image}" alt="post image" style="width:100%">`
          : ""
        }
        <h4 class="card-title">${post.post_by}</h4>
        <p class="card-text">
          ${post.description}
        </p>
        ${post.likes.filter((like) => like.liked_by === parseJwt().username).length > 0
          ? `<button class="btn btn-primary btn-sm" onclick="toggleLike(${post.id}, this)">
              <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
              <span>${post.likes.length}</span>
            </button>`
          : `<button class="btn btn-light btn-sm" onclick="toggleLike(${post.id}, this)">
              <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
              <span>${post.likes.length}</span>
            </button>`
        }
      </div>
    </div>`
  );
}

function friendsTemplate(friendRequest) {
  return(
    `<tr>
      <td>${friendRequest.from}</td>
      <td>
        <ul class="list-inline">
        <li class="list-inline-item"><button class="btn btn-success" onclick="acceptFriend(this, '${friendRequest.from}')">Accept</button></li>
        <li class="list-inline-item"><button class="btn btn-danger" onclick="rejectFriend(this, '${friendRequest.from}')">Reject</button></li>
        </ul>
      </td>
    </tr>`
  );
}

function renderPosts() {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/post",
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      console.log(result);
      let postsHTML = "";
      result.message.forEach(post => {
        postsHTML += postTemplate(post)
      });
      $("#feed").html(postsHTML);
    },
    error: console.log
  });
}

function createPost(e) {
  e.preventDefault();
  console.log(e)
  let imageFile = $("#post-image")[0].files[0];
  let desc = $("#post-desc").val();
  $("#post-image").attr("disabled", true);
  $("#post-desc").attr("disabled", true);
  $("#post-submit").attr("disabled", true);
  let formData = new FormData();
  formData.append("image", imageFile);
  formData.append("description", desc);
  $.ajax({
    method: "POST",
    url: "http://localhost:3000/post",
    enctype: 'multipart/form-data',
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: formData,
    cache: false,
    processData: false,
    contentType: false,
    success: response => {
      console.log({response})
      $("#post-image").val("");
      $("#post-desc").val("");
      $("#post-image").attr("disabled", false);
      $("#post-desc").attr("disabled", false);
      $("#post-submit").attr("disabled", false);
      renderPosts();
    },
    error: err => console.log({err})
  });
}

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.replace("./login.html");
}

$(document).ready(function() {
  renderPosts();
  renderFriendRequests();
  renderFriends();
  $("#btn-logout").click(logout);
  $("#form-post").submit(createPost);
});
