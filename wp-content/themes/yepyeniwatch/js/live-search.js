function fetchResults() {
	var ajax_url = live_search_ajax.ajax_url;
    loader = '<span class="button-loader"><svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve"> <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"> <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" /> </path> </svg></span>';
    var keyword = jQuery('#searchInput').val();
    var length = jQuery('#searchInput').val().length;
    if (length > 2) {
        jQuery.ajax({
            url: ajax_url,
            type: 'post',
            data: {
                action: 'data_fetch',
                keyword: keyword,
				_wpnonce: live_search_ajax.admin_ajax_nonce,
            },
            beforeSend: function(xhr) {
                jQuery('#searchInput').after(loader);
            },
            success: function(data) {
                jQuery('.button-loader').remove();
                jQuery('#datafetch').html(data);
            }
        });
    } else {
        jQuery('#datafetch').html("");
    }
}