if (!localStorage.getItem("jwtToken"))
  window.location.replace("./login.html");

var currentProfileUsername;

function postTemplate(post) {
  return `
    <div class="card col-sm-11 col-md-11 m-auto">
      <div class="card-body">
        ${
          post.image
            ? `<img class="img-fluid" src="${"https://spider.nitt.edu/workshop/" +
                post.image}" alt="post image" style="width:100%">`
            : ""
        }
        <h4 class="card-title">${post.post_by}</h4>
        <p class="card-text">
          ${post.description}
        </p>
        ${
          post.likes.filter(like => like.liked_by === parseJwt().username)
            .length > 0
            ? `<button class="btn btn-primary btn-sm" onclick="toggleLike(${
                post.id
              }, this)">
              <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
              <span>${post.likes.length}</span>
            </button>`
            : `<button class="btn btn-light btn-sm" onclick="toggleLike(${
                post.id
              }, this)">
              <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
              <span>${post.likes.length}</span>
            </button>`
        }
      </div>
    </div>
  `;
}

function profileTemplate(profile) {
  let profile_action_btn = "";
  switch(profile.userStatus) {
    case "NOT_A_FRIEND":
      profile_action_btn = `<a id="profile-action-btn" href="#" class="btn btn-primary" onclick="sendFriendRequest()">SEND FRIEND REQUEST</a>`
      break;
    case "FRIEND_REQUEST_RECEIVED":
      profile_action_btn = `<a id="profile-action-btn" href="#" class="btn btn-primary" onclick="acceptFriendRequest()">ACCEPT FRIEND REQUEST</a>`
    break;
    case "SELF":
    case "FRIEND":
    case "FRIEND_REQUEST_SENT":
      profile_action_btn = "";
  }
  return `
    <div class="card col-sm-11 col-md-11 m-auto">
      <div class="card-body">
        <div class="row">
          <div class="col-auto">
            ${profile.profile_pic
              ? `<img id="profile-pic" src="${"https://spider.nitt.edu/workshop" + profile.profile_pic}" class="card-img-left" alt="profile picture">`
              : ""
            }
          </div>
          <div class="col">
            <h5 class="card-title">Username: ${profile.username}</h5>
            <p class="card-text">Name: ${profile.name}</p>
            <p class="card-text">Bio: ${profile.bio}</p>
            ${profile_action_btn}
          </div>
        </div>
      </div>
    </div>
  `;
}

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.replace("./login.html");
}

function parseJwt() {
  let token = localStorage.getItem("jwtToken");
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

function searchUser(event) {
  event.preventDefault();
  let username = $("#search-username").val();
  $.ajax({
    method: "GET",
    url: "https://spider.nitt.edu/workshop/user/profile/" + username,
    // crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      currentProfileUsername = username;
      $("#feed").html("");
      $("#profile").html("");
      renderProfile(currentProfileUsername);
      renderPosts(currentProfileUsername);
    },
    error: function(err) {
      alert(err.responseJSON.message);
    }
  });
}

function renderPosts(username) {
  $.ajax({
    method: "GET",
    url: "https://spider.nitt.edu/workshop/post/" + username,
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      console.log(result);
      let postsHTML = "";
      result.message.forEach(post => {
        postsHTML += postTemplate(post);
      });
      $("#feed").html(postsHTML);
    },
    error: console.log
  });
}

function renderProfile(username) {
  $.ajax({
    method: "GET",
    url: "https://spider.nitt.edu/workshop/user/profile/" + username,
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      $("#profile").html(profileTemplate(result.profile));
    },
    error: console.log
  });
}

function toggleLike(post_id, btn) {
  let button = $(btn);
  button.attr("disabled", true);
  $.ajax({
    method: "POST",
    url: "https://spider.nitt.edu/workshop/post/like",
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: { post_id: post_id },
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

function sendFriendRequest() {
  $.ajax({
    method: "POST",
    url: "https://spider.nitt.edu/workshop/friendrequests",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: {
      to: currentProfileUsername,
    },
    success: result => {
      $("#feed").html("");
      $("#profile").html("");
      renderProfile(currentProfileUsername);
      renderPosts(currentProfileUsername);
    },
    error: console.log
  });
};

function acceptFriendRequest() {
  $.ajax({
    method: "PUT",
    url: "https://spider.nitt.edu/workshop/friendrequests",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: {
      from: currentProfileUsername,
    },
    success: result => {
      $("#feed").html("");
      $("#profile").html("");
      renderProfile(currentProfileUsername);
      renderPosts(currentProfileUsername);
    },
    error: console.log
  });
};

$(document).ready(function() {
  currentProfileUsername = parseJwt().username;
  renderProfile(currentProfileUsername);
  renderPosts(currentProfileUsername);
  $("#btn-logout").click(logout);
  $("#form-search-user").submit(searchUser);
});
