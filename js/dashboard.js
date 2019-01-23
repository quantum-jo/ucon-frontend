if (!localStorage.getItem("jwtToken"))
  window.location.replace("./login.html");

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
    error: err => {
      console.log({ err });
    }
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
        <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
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
    url: "http://localhost:3000/post/all",
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: result => {
      console.log(result);
      let postsHTML = "";
      result.forEach(post => {
        postsHTML += postTemplate(post)
      });
      $("#feed").append(postsHTML);
    },
    error: err => {
      console.log({ err });
    }
  });
}

function createPost(e) {
  e.preventDefault();
  console.log(e)
  let imageFile = $("#post-image")[0].files[0];
  let desc = $("#post-desc").val();
  $("#post-image").prop("disabled", true);
  $("#post-desc").prop("disabled", true);
  $("#post-submit").prop("disabled", true);
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
      $("#post-image").prop("disabled", false);
      $("#post-desc").prop("disabled", false);
      $("#post-submit").prop("disabled", false);
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
