const maxStorage = 512;

function setStorage(value) {
    if(isNaN(value) || value < 0 || value > 100) {
        return "er";
    }
    var percent = (value/maxStorage) * 100;
    $("p#storage-value").html(`${value}MB out of ${maxStorage}MB taken`);
    $("progress#storage-taken").attr("value", percent);
}

function getUsers(token) {
    $.ajax({
        url: "/api/admin/getUserList",
        method: "get",
        data: {
            token: token
        }
    })
    .done(res => {
        if(res.status == "success") {
            var list = $("ul#users")
            $.each(res.users, i => {
                var liElem = $("<li/>")
                    .appendTo(list);
                var uname = $("<a/>")
                    .addClass("uname")
                    .html(res.users[i].name)
                    .addClass(res.users[i].role == "admin" ? "admin" : "")
                    .appendTo(liElem);
                var changePassButton = $("<a/>")
                    .html("Change password")
                    .on("click", e => {
                        var newPass = prompt("New password for user " + res.users[i].name + ", this will delete all their tokens");
                        if(newPass == "" || !newPass) return;
                        $.ajax({
                            url: "/api/admin/setUserPassword",
                            method: "post",
                            data: {
                                name: res.users[i].name,
                                token: token,
                                password: md5(newPass)
                            },
                            success: (data, status, xhr) => {
                                $("span#users-message").html("Changed password: " + JSON.stringify(data));
                            },
                            error: (xhr, status, error) => {
                                $("span#users-message").html("error:" , error);
                            }
                        })
                    })
                    .appendTo(liElem);
                var deleteButton = $("<a/>")
                    .html("Drop")
                    .on("click", e => {
                        if(!confirm("Really delete user " + res.users[i].name + "?")) return;
                        $.ajax({
                            url: "/api/admin/deleteUser",
                            method: "get",
                            data: {
                                token: token,
                                name: res.users[i].name
                            },
                            success: (data, status, xhr) => {
                                if(data.status == "success")
                                    $("span#users-message").html("Deleted");
                                else
                                    $("span#users-message").html(JSON.stringify(data));
                                $("ul#users").empty();
                                getUsers(token);
                            },
                            error: (xhr, status, error) => {
                                console.log(status, error);
                                $("span#users-message").html("error: " + error);
                                $("ul#users").empty();
                                getUsers(token);
                            }
                        })
                    })
                    .appendTo(liElem);
                var wipeButton = $("<a/>")
                    .html("Wipe")
                    .on("click", e => {
                        if(!confirm("Really wipe user " + res.users[i].name + "?")) return;
                        $.ajax({
                            url: "/api/admin/wipeUser",
                            method: "get",
                            data: {
                                token: token,
                                name: res.users[i].name
                            },
                            success: (data, status, xhr) => {
                                if(data.status == "success")
                                    $("span#users-message").html("Wiped " + data.filesDeleted);
                                else
                                    $("span#users-message").html(JSON.stringify(data));
                                $("ul#users").empty();
                                getUsers(token);
                            },
                            error: (xhr, status, error) => {
                                console.log(status, error);
                                $("span#users-message").html("error: " + error);
                                $("ul#users").empty();
                                getUsers(token);
                            }
                        })
                    })
                    .appendTo(liElem);
            })
        }else{
            $("span#users-message").html(res.status + ": " + res.error);
        }
    })
    .fail(err => {
        console.error(err);
    })
}

$(() => {
    var token = getToken();

    /* NEW USER FORM SUBMIT */
    $("form#newUser").on("submit", e => {
        e.preventDefault();
        var self = $("form#newUser");
        $("span#newUser-message").html("adding user...");
        
        var user = $("input#newUser-name").val();
        var pass = $("input#newUser-pass").val();
        if(user == "" || pass == "") {
            $("span#newUser-message").html("can't be empty");
            return;
        }

        $.ajax({
            url: self[0].action,
            method: self[0].method,
            data: {
                token: token,
                name: user,
                pass: md5(pass),
            }
        })
        .done(res => {
            $("span#newUser-message").html(JSON.stringify(res))
            $("ul#users").empty();
            getUsers(token);
            console.log(res);
        })
        .fail(err => {
            $("span#newUser-message").html(JSON.stringify(err));
            console.error(err);
        });
    })

    /* LOAD USERS LIST */
    getUsers(token);

    $("#popup").on("click", e => {

    })
});