if (!localStorage.getItem("jwtToken")) window.location.replace("./login.html");

function parseJwt() {
  let token = localStorage.getItem("jwtToken");
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

function acceptFriend(button, from) {
  $.ajax({
    method: "PUT",
    url: "http://localhost:3000/friendrequests",
    data: { from: from },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    beforeSend: function() {
      button.disabled = true;
    },
    success: function(result) {
      console.log("accepted", result);
      // Rerendering the friend requests as the current request has to be removed
      renderFriendRequests();
      // Friends list should be updated with the new friend
      renderFriends();
      // Posts feed should be updated with the new friend's post
      renderPosts();
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function rejectFriend(button, from) {
  $.ajax({
    method: "DELETE",
    url: "http://localhost:3000/friendrequests",
    crossDomain: true,
    data: { from: from },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    beforeSend: function() {
      button.disabled = true;
    },
    success: function(result) {
      console.log("rejected", { result });
      // Rerender friendrequests for removing the current request. No need to rerender posts or friends as that is not going to be affected.
      renderFriendRequests();
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function renderFriendRequests() {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/friendrequests",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: function(result) {
      let friendsHTML = "";
      console.log({ result });
      result.friendrequests.forEach(function(friendRequest) {
        friendsHTML += friendsTemplate(friendRequest);
      });
      $("#friendRequests").html(
        `<ul class="list-group">` + friendsHTML + `</ul>`
      );
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function renderFriends() {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/user/friends",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: function(result) {
      let friendsListHTML = "";
      console.log("friendsList", { result });
      result.message.forEach(friend => {
        friendsListHTML += `<li class="list-group-item">${friend}</li>`;
      });
      $("#friendsList").html(
        `<ul class="list-group">` + friendsListHTML + `</ul>`
      );
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function toggleLike(post_id, btn) {
  // This line helps to convert DOM into JQuery object which allows extra functionalities which are shown below
  let button = $(btn);
  button.attr("disabled", true);
  $.ajax({
    method: "POST",
    url: "http://localhost:3000/post/like",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: { post_id: post_id },
    success: function(result) {
      console.log("like res", result);
      // Finds the contents span tag inside the button tag which called the function
      // The contents will be in form of string. So, we convert it into int by Number()
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
    error: function(error) {
      console.log(error);
    }
  });
}

function postTemplate(post) {
  return `<div class="card col-sm-11 col-md-8 m-auto">
      <div class="card-body">
        ${post.image
          ? `<img class="img-fluid" src="${"http://localhost:3000" + post.image}" alt="post image" style="width:100%">`
          : ""
        }
        <h4 class="card-title">${post.post_by}</h4>
        <p class="card-text">
          ${post.description}
        </p>
        ${
          post.likes.filter(like => like.liked_by === parseJwt().username).length > 0
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
    </div>`;
}

function friendsTemplate(friendRequest) {
  return `<tr>
      <td>${friendRequest.from}</td>
      <td>
        <ul class="list-inline">
        <li class="list-inline-item"><button class="btn btn-success" onclick="acceptFriend(this, '${friendRequest.from}')">Accept</button></li>
        <li class="list-inline-item"><button class="btn btn-danger" onclick="rejectFriend(this, '${friendRequest.from}')">Reject</button></li>
        </ul>
      </td>
    </tr>`;
}

function renderPosts() {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/post",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: function(result) {
      console.log(result);
      let postsHTML = "";
      result.message.forEach(post => {
        postsHTML += postTemplate(post);
      });
      $("#feed").html(postsHTML);
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function createPost(event) {
  event.preventDefault();
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
    enctype: "multipart/form-data",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: formData,
    cache: false,
    processData: false,
    contentType: false,
    success: function(response) {
      console.log({ response });
      $("#post-image").val("");
      $("#post-desc").val("");
      $("#post-image").attr("disabled", false);
      $("#post-desc").attr("disabled", false);
      $("#post-submit").attr("disabled", false);
      renderPosts();
    },
    error: function(err) {
      console.log(err);
    }
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

  // Define event handlers
  $("#btn-logout").click(logout);
  $("#form-post").submit(createPost);
});
