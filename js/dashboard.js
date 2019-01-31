if (!localStorage.getItem("jwtToken"))
  window.location.replace("./login.html");


function renderProfile(username) {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/user/profile/" + username,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    success: function(result) {
      console.log(result);
      if (result.profile.profile_pic) {
        $("#profile-image").attr("src", "http://localhost:3000" + result.profile.profile_pic);
      } else {
        $("#profile-image").removeAttr("src");
      }
      $("#profile-username").text("Username:" + result.profile.username);
      $("#profile-name").text("Name:" + result.profile.name);
      $("#profile-bio").text("Bio:" + result.profile.bio);

      if (result.profile.isSelf === true) {
        $("#form-post-card").show();
      } else {
        $("#form-post-card").hide();
      }
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function postTemplate(post) {
  return `
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">${post.post_by}</h4>
        ${post.image
          ? `<img class="img-fluid" src="${"http://localhost:3000" + post.image}" alt="post image" style="width:50%">`
          : ""
        }
        <p class="card-text">
          ${post.description}
        </p>
      </div>
    </div>`;
}

function renderPosts(username) {
  $.ajax({
    method: "GET",
    url: "http://localhost:3000/post/"+username,
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

  let formData = new FormData();
  formData.append("image", imageFile);
  formData.append("description", desc);

  $.ajax({
    method: "POST",
    url: "http://localhost:3000/post",
    enctype: 'multipart/form-data',
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
    },
    data: formData,
    cache: false,
    processData: false,
    contentType: false,
    success: function(response) {
      console.log(response);
      $("#post-image").val("");
      $("#post-desc").val("");
      renderPosts(localStorage.getItem("username"));
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("username");
  window.location.replace("./login.html");
}

function searchUser(event) {
  event.preventDefault();
  var username = $("#user-search").val();
  renderProfile(username);
  renderPosts(username);
}

$(document).ready(function() {
  renderProfile(localStorage.getItem("username"));
  renderPosts(localStorage.getItem("username"));

  // Define event handlers
  $("#btn-logout").click(logout);
  $("#form-post").submit(createPost);
  $("#user-search-form").submit(searchUser);
});
