function onLoad() {
    $("#upload-file-button").click(onClickUploadFileButton);
    
    $.getJSON(
        "/command/get-all-project-metadata",
        null,
        function(data) {
            renderProjects(data);
        },
        "json"
    );
}
$(onLoad);

function onClickUploadFileButton(evt) {
    if ($("#project-name-input")[0].value.trim().length == 0) {
        window.alert("You must specify a project name.");
        
        evt.preventDefault();
        return false;
    } else {
        $("#file-upload-form").attr("action", 
            "/command/create-project-from-upload?" + [
                "skip=" + $("#skip-input")[0].value,
                "limit=" + $("#limit-input")[0].value
            ].join("&"));
    }
}

function renderProjects(data) {
    var projects = [];
    for (var n in data.projects) {
        if (data.projects.hasOwnProperty(n)) {
            var project = data.projects[n];
            project.id = n;
            project.date = Date.parseExact(project.modified, "yyyy-MM-ddTHH:mm:ssZ");
            projects.push(project);
        }
    }
    
    if (projects.length == 0) {
        $('#body-empty').show();
        $('#create-project-panel').remove().appendTo($('#body-empty-create-project-panel-container'));
    } else {
        $('#body-nonempty').show();
        $('#create-project-panel').remove().appendTo($('#body-nonempty-create-project-panel-container'));

        projects.sort(function(a, b) { return b.date.getTime() - a.date.getTime(); });
        if (projects.length > 10) {
            $('#body-nonempty-logo-container').css("vertical-align", "top");
            $('#body-nonempty-create-project-panel-container').css("vertical-align", "top");
        }
        
        var container = $("#projects").empty().show();
        $('<h1>').text("Projects").appendTo(container);
        
        var renderProject = function(project) {
            var div = $('<div>').addClass("project").appendTo(container);
        
            $('<a></a>')
                .addClass("delete-project")
                .attr("title","Delete this project")
                .attr("href","")
                .html("<img src='/images/close.png' />")
                .click(function() {
                    if (window.confirm("Are you sure you want to delete project \"" + project.name + "\"?")) {
                        $.ajax({
                            type: "POST",
                            url: "/command/delete-project",
                            data: { "project" : project.id },
                            dataType: "json",
                            success: function (data) {
                                if (data && typeof data['code'] != 'undefined' && data.code == "ok") {
                                    window.location.reload()
                                }
                            }
                        });                    
                    }
                    return false;
                }).appendTo(div);
            
            $('<a></a>').text(project.name).attr("href", "/project.html?project=" + project.id).appendTo(div);
            $('<span></span>').text(formatDate(project.date)).addClass("last-modified").appendTo(div);
        };
        
        for (var i = 0; i < projects.length; i++) {
            renderProject(projects[i]);
        }
        
        $(table).appendTo(container);
    }
}

function formatDate(d) {
    var yesterday = Date.today().add({ days: -1 });
    var today = Date.today();
    var tomorrow = Date.today().add({ days: 1 });
    if (d.between(today, tomorrow)) {
        return "Today " + d.toString("HH:mm");
    } else if (d.between(yesterday, today)) {
        return "Yesterday " + d.toString("HH:mm");
    } else {
        return d.toString("M-ddd-yyyy");
    }
}