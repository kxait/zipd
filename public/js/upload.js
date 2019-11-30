$(() => {
    var token = getToken();
    if(token == null) {
        window.location = "/";
        return;
    }

    $("a#logout").on("click", e => {
        logout();
    })

    $("input#token").val(token);


})