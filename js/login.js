if(localStorage.getItem("jwtToken"))
  window.location.replace("./dashboard.html");    // replace() removes the current URL from history stack instead of keeping the current URL in history stack, so the user cannot go back to the previous URL

$(document).ready(function() {

  $("#loginForm").submit(function(event) {
    event.preventDefault();
    var username = $("#login-username").val();
    var password = $("#login-password").val();
    var formData = {
      username: username,
      password: password,
    };
    $.ajax({
      method: "POST",
      url: "http://643eb335.ngrok.io/login",
      data: formData,
      success: (result) => {
        if(result.isValid) {
          localStorage.setItem("jwtToken", result.jwtToken);
          window.location.replace("./dashboard.html");

        } else {
          $("#loginMessage").text(result.message);
        }
      },
      error: (error) => {
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
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("profile_pic", profile_pic);
    $.ajax({
      method: "POST",
      url: "http://643eb335.ngrok.io/register",
      enctype: 'multipart/form-data',
      data: formData,
      cache: false,
      processData: false,
      contentType: false,
      success: (result) => {
        $("#registerMessage").text(result.message);
      },
      error: (error) => {
        $("#registerMessage").text(error.responseJSON.message);
      }
    });
  });
});
