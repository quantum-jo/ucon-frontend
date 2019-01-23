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
      url: "http://localhost:3000/login",
      data: formData,
      success: (result) => {
        if(result.isValid) {
          localStorage.setItem("jwtToken", result.jwtToken);
          window.location.replace("./dashboard.html");

        } else {
          $("#loginMessage").html(result.message);
        }
      },
      error: (error) => {
        $("#loginMessage").html(error.responseJSON.message);
      }
    });
  });

  $("#registerForm").submit(function(event) {
    event.preventDefault();
    var username = $("#register-username").val();
    var password = $("#register-password").val();
    var name = $("#register-name").val();
    var bio = $("#register-bio").val();
    var formData = {
      username: username,
      password: password,
      name: name,
      bio: bio,
    };
    $.ajax({
      method: "POST",
      url: "http://localhost:3000/register",
      data: formData,
      success: (result) => {
        $("#registerMessage").html(result.message);
      },
      error: (error) => {
        $("#registerMessage").html(error.responseJSON.message);
      }
    });
  });
});
