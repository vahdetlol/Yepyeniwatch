$(document).ready(function($) {
    $('#commentform').validate( {
        rules: {
            author: {
                required: true, minlength: 2
            }
            , email: {
                required: true, email: true
            }
            , comment: {
                required: true, minlength: 2
            }
        }
        , messages: {
            author: "", email: "", comment: ""
        }
    });
});