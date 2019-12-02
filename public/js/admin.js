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
                console.log(res.users[i].name, res.users[i].role);
                var liElem = $("<li/>")
                    .appendTo(list);
                var uname = $("<a/>")
                    .addClass("uname")
                    .html(res.users[i].name)
                    .addClass(res.users[i].role == "admin" ? "admin" : "")
                    .addClass(res.users[i].role == "shrek" ? "shrek" : "")
                    .appendTo(liElem);
                var changePassButton = $("<a/>")
                    .html("Change password")
                    .on("click", e => {
                        // change user pass here
                    })
                    .appendTo(liElem);
                var deleteButton = $("<a/>")
                    .html("Drop")
                    .on("click", e => {
                        var self = e.target;
                        deleteButton.remove();
                        var newDelete = $("<a/>")
                            .on("click", e => {
                                $.ajax({
                                    url: "/api/admin/deleteUser",
                                    method: "get",
                                    data: {
                                        token: token,
                                        name: res.users[i].name
                                    },
                                    success: (data, status, xhr) => {
                                        $("span#users-message").html("Deleted");
                                        $("ul#users").empty();
                                        getUsers(token);
                                    },
                                    error: (xhr, status, error) => {
                                        console.log(status, error);
                                    }
                                })
                            })
                            .text("Are you sure?")
                            .attr("href", "#")
                            .appendTo(liElem);
                    })
                    .appendTo(liElem);
                var wipeButton = $("<a/>")
                    .html("Wipe")
                    .on("click", e => {
                        // wipe
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
});