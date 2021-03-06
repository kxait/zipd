// function to set a given theme/color-scheme
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.setAttribute("data-theme", themeName == "dark" ? "dark" : "light");
    document.getElementById("theme-switch").checked = (themeName == "dark");
}
// function to toggle between light and dark theme
function toggleTheme() {
   if (localStorage.getItem('theme') === 'dark'){
       setTheme('light');
   } else {
       setTheme('dark');
   }
}

$(() => {

    if (localStorage.getItem('theme') === 'dark') {
        setTheme('dark');
    } else {
        setTheme('the-light');
    }

    document.getElementById("theme-switch").onchange = (ev => {
        toggleTheme();
    });

    token = getToken();
    if(token == null && window.location.pathname != "/") {
        window.location = "/";
        return;
    }

    $("a#logout").on("click", e => {
        logout();
    });

    $.ajax({
        url: "/api/getUserRole",
        method: "get",
        data: {
            token: token,
            user: ""
        }
    }).done(result => {
        if(result.status == "success") {
            // got uname
            var unameDisplay = $('<a/>')
                .html(result.name)
                .addClass("uname");
                if(result.role == "admin") {
                    // is admin
                    var adminLink = $('<a/>')
                        .attr("href", "/admin")
                        .html("Admin panel")
                        .appendTo($("nav"));
                    unameDisplay
                        .addClass("admin");
                }
                unameDisplay
                    .prependTo($("nav"));
        }else{
            console.log("couldnt pull local user name and role");
        }
    }).fail(err => {
        console.log("failed pulling local user name");
    })
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