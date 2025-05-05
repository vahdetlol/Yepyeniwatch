loader_html = '<span class="button-loader"> <svg version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 40" enable-background="new 0 0 0 0" xml:space="preserve"> <circle fill="#ffffff" stroke="none" cx="30" cy="20" r="6"> <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1"/> </circle> <circle fill="#ffffff" stroke="none" cx="50" cy="20" r="6"> <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2"/> </circle> <circle fill="#ffffff" stroke="none" cx="70" cy="20" r="6"> <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3"/> </circle> </svg></span>';
jQuery('#update-me').on('click', function() {
    jQuery('#update-me').val('').after(loader_html);
    var action = 'update_action';
    var email = jQuery("#up-email").val();
    var passwrd = jQuery("#up-psw").val();
    var passwrd2 = jQuery("#up-psw2").val();
    var about = jQuery("#up-about").val();
    var facebook = jQuery("#up-fb").val();
    var twitter = jQuery("#up-tw").val();
    var instagram = jQuery("#up-in").val();
    var firstname = jQuery("#up-fname").val();
    var lastname = jQuery("#up-lname").val();
    var ajax_url = user_ajax_profile_update.ajax_url;
    var ajax_data = {
        action: 'update_action',
        email: email,
        passwrd: passwrd,
        passwrd2: passwrd2,
        about: about,
        facebook: facebook,
        twitter: twitter,
        instagram: instagram,
        firstname: firstname,
        lastname: lastname,
        captcha: grecaptcha.getResponse(),
    };
    jQuery.post(ajax_url, ajax_data, function(res) {
        jQuery("#error-message").html(res).show();
        jQuery('#update-me').val('Profili Güncelle');
        jQuery('.button-loader').remove();
        $('html, body').animate({
            scrollTop: $('#form-wrapper').offset().top - 70
        }, 'slow');
    });
});