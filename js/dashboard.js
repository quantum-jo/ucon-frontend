$(document).ready(function() {

    function renderPosts() {
        $.ajax({
            method: "GET",
            url: "http://localhost:3000/user/posts",
            data: formData,
            success: (result) => {
            },
            error: (error) => {
            }
        });
    }

    renderPosts();
    renderFriendRequests();
});
