$(() => {
    token = getToken();
    if(token == null && window.location.pathname != "/") {
        window.location = "/";
        return;
    }

    $("a#logout").on("click", e => {
        logout();
    });
})

function getToken() {
    var token = "";
    try {
        token = document.cookie.match(/token=([a-zA-Z0-9]+)/)[1];
    }catch(e) {
        // no login
        return;
    }
    return token;
}

function logout() {
    var passed = new Date();
    passed.setDate(passed.getDate()-1);
    document.cookie = "token=;expires=" + passed.toGMTString();
    $.ajax({
        url: "/api/deleteLogin",
        method: "get",
        data: {token: token}
    }).done(result => {
        window.location="/";
        return;
    }).fail(err => {
        window.location="/";
    })
    
}