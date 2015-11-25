$(document).ready(function () {
    $(".table.dt.users").DataTable({
        processing: true,
        serverSide: true,
        // notice that the request url is set to [model]/dt 
        // /dt is an internal DataTables action which will automatically take care of search 
        // and sort of data coming into DataTables 
        ajax: { url: '/api/users/dt', type: 'post' },
        columns: [
            {
                data: 'firstname',
                name: 'firstname'
            },
            {
                data: 'lastname',
                name: 'lastname'
            },
            {
                data: 'email',
                name: 'email'
            },
            {
                data: function (object) {
                    return moment(object.dateCreated.toString()).format("LLL");
                },
                name: 'dateCreated'
            },
            {
                data: function (object) {
                    return moment(object.dateUpdated.toString()).format("LLL");
                },
                name: 'dateUpdated'
            }
        ]
    });
});