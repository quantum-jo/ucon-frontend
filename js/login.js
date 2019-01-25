if (localStorage.getItem("jwtToken"))
  window.location.replace("./dashboard.html"); // replace() removes the current URL from history stack instead of keeping the current URL in history stack, so the user cannot go back to the previous URL

$(document).ready(function() {
  $("#loginForm").submit(function(event) {
    event.preventDefault();
    var username = $("#login-username").val();
    var password = $("#login-password").val();
    var formData = {
      username: username,
      password: password
    };
    $.ajax({
      method: "POST",
      url: "https://spider.nitt.edu/workshop/login",
      data: formData,
      success: function(result) {
        localStorage.setItem("jwtToken", result.jwtToken);
        window.location.replace("./dashboard.html");
      },
      error: function(error) {
        $("#loginMessage").text(error.responseJSON.message);
      }
    });
  });

  $("#registerForm").submit(function(event) {
    event.preventDefault();
    let username = $("#register-username").val();
    let password = $("#register-password").val();
    let name = $("#register-name").val();
    let bio = $("#register-bio").val();
    let profile_pic = $("#register-profile-pic")[0].files[0];
    // With XHR2, File upload through AJAX is supported. E.g. through FormData object, but unfortunately it is not supported by all/old browsers.
    // FormData support starts from following desktop browsers versions. IE 10+, Firefox 4.0+, Chrome 7+, Safari 5+, Opera 12+
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("profile_pic", profile_pic);
    $.ajax({
      method: "POST",
      url: "https://spider.nitt.edu/workshop/register",
      enctype: 'multipart/form-data',
      data: formData,
      cache: false,
      processData: false,
      contentType: false,
      success: function(result) {
        alert(result.message);
      },
      error: function(result) {
        $("#registerMessage").text(error.responseJSON.message);
      }
    });
  });
});
