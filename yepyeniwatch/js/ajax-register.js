loader_html = '<span class="button-loader"> <svg version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 40" enable-background="new 0 0 0 0" xml:space="preserve"> <circle fill="#ffffff" stroke="none" cx="30" cy="20" r="6"> <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1"/> </circle> <circle fill="#ffffff" stroke="none" cx="50" cy="20" r="6"> <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2"/> </circle> <circle fill="#ffffff" stroke="none" cx="70" cy="20" r="6"> <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3"/> </circle> </svg></span>';
jQuery('#register').on('submit', function(e){
	e.preventDefault();
    jQuery('#register-me').val('').after(loader_html);
    var action = 'register_action';
    var username = jQuery("#username").val();
    var email = jQuery("#email").val();
    var firstname = jQuery("#fname").val();
    var lastname = jQuery("#lname").val();
    var passwrd = jQuery("#psw").val();
    var passwrd2 = jQuery("#psw2").val();
    var ajax_url = user_ajax_register.ajax_url;
    var ajax_data = {
        action: 'register_action',
        username: username,
        email: email,
        firstname: firstname,
        lastname: lastname,
        passwrd: passwrd,
        passwrd2: passwrd2,
        captcha: grecaptcha.getResponse(),
    };
    jQuery.post(ajax_url, ajax_data, function(res) {
        jQuery("#error-message").html(res).show();
        jQuery('#register-me').val('Kayıt Ol');
        jQuery('.button-loader').remove();
        $('html, body').animate({
            scrollTop: $('#form-wrapper').offset().top - 70
        }, 'slow');
    });
});