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
    var token = getToken();
    if(token == null) {
        window.location = "/";
        return;
    }
    $.ajax({
        url: "/api/deleteLogin",
        method: "get",
        data: {token: token}
    }).done(result => {
        var passed = new Date();
        passed.setDate(passed.getDate()-1);
        document.cookie = "token=;expires=" + passed.toGMTString();
        window.location="/";
        return;
    }).fail(err => {
        window.location="/";
    })
    
}