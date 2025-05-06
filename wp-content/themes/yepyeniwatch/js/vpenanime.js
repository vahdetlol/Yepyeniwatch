var $ = jQuery;
function myFunctionyeni() {
  document.getElementById("myDropdown").classList.toggle("show");
}
function filterFunction() {
  var e, t, n;
  for (
    e = document.getElementById("myInpu").value.toUpperCase(),
      div = document.getElementById("myDropdown"),
      t = div.getElementsByTagName("a"),
      n = 0;
    n < t.length;
    n++
  )
    -1 < t[n].innerHTML.toUpperCase().indexOf(e)
      ? (t[n].style.display = "")
      : (t[n].style.display = "none");
}
function uyebilgi() {
  var e = document.getElementById("uyebilgi"),
    t = document.getElementById("infokapa");
  (e.style.display = "none"), (t.style.display = "none");
}
function toggle() {
  "block" != document.getElementById("perde").style.display
    ? ($("#perde").fadeIn(600),
      1e3 < $(window).width() &&
        ($(".ac-kapa").css("display", "none"),
        $(".dizialani").css({
          position: "absolute",
          width: "100%",
          left: "0",
          top: "70px",
        })),
      $("#dizinot").css("display", "none"),
      $("#dizinot2").css("display", "none"))
    : ($("#perde").fadeOut(600),
      $("#dizinot").css("display", "inline-block"),
      $("#dizinot2").css("display", "inline-block"));
}
function dizilistele() {
  var e, t, n;
  for (
    e = document.getElementById("dizilist").value.toUpperCase(),
      t = document.getElementById("listul").getElementsByTagName("li"),
      n = 0;
    n < t.length;
    n++
  )
    -1 < t[n].getElementsByTagName("a")[0].innerHTML.toUpperCase().indexOf(e)
      ? (t[n].style.display = "")
      : (t[n].style.display = "none");
}
function navmenufunc() {
  var e = document.getElementById("myTopnav");
  "topnav" === e.className
    ? (e.className += " responsive")
    : (e.className = "topnav");
}
function fetchResults() {
  var searchInputValue = document.getElementById("searchInput").value;
  if (searchInputValue.length < 2) {
    document.getElementById("datafetch").innerHTML = "";
    document.getElementById("datafetch").style.display = "none";
    return;
  }

  document.getElementById("datafetch").style.display = "block";
  
  // API araması için AJAX isteği
  $.ajax({
    url: "https://api.openani.me/anime/search?q=" + searchInputValue,
    type: "GET",
    success: function(data) {
      var results = "";
      if (data && data.animes && data.animes.length > 0) {
        data.animes.slice(0, 5).forEach(function(anime) {
          results += `<a href="https://openani.me/anime/${anime.slug}" target="_blank">
                        <div class="search-item">
                          <div class="search-item-image">
                            <img src="${anime.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" alt="${anime.english}">
                          </div>
                          <div class="search-item-info">
                            <div class="search-item-title">${anime.english}</div>
                          </div>
                        </div>
                      </a>`;
        });
      } else {
        results = "<div class='search-no-results'>Sonuç bulunamadı</div>";
      }
      document.getElementById("datafetch").innerHTML = results;
    },
    error: function() {
      document.getElementById("datafetch").innerHTML = "<div class='search-no-results'>Arama sırasında bir hata oluştu</div>";
    }
  });
}

// Açılan menüyü tıklamalar için kapatma
$(document).on("click", function(e) {
  if (!$(e.target).closest("#searchInput, #datafetch").length) {
    document.getElementById("datafetch").style.display = "none";
  }
});
jQuery(document).ready(
  jQuery(function (i) {
    i(".dag_spoiler_header").each(function () {
      i(this).click(function () {
        var e = i(this).children("span.dag_spoiler_help_text");
        i(this)
          .siblings(".dag_spoiler_content")
          .slideToggle("fast", function () {
            e.html(
              e.html() == '<i class="fa ' + n + '"></i>'
                ? '<i class="fa ' + t + '"></i>'
                : '<i class="fa ' + n + '"></i>'
            );
          });
      });
      var t = i(this).attr("data-dag-spoiler-show"),
        n = i(this).attr("data-dag-spoiler-hide");
      i(this).prepend(
        ' <span class="dag_spoiler_help_text" style="margin-right: 5px; font-size: 14px;"> <i class="fa ' +
          t +
          '"></i></span>'
      );
    });
  })
),
  $(document).ready(function () {
    var owl = $(".slider");
    owl.owlCarousel({
      autoplay: true,
      autoplaySpeed: 700,
      autoplayTimeout: 10000,
      autoplayHoverPause: false,
      margin: 0,
      nav: true,
      dots: false,
      loop: false,
      rewind: true,
      responsive: {
        0: { items: 2 },
        450: { items: 3 },
        600: { items: 5 },
        1000: { items: 6 },
        1440: { items: 7 },
      },
      navText: [
        "<i class='fas fa-arrow-left'></i>",
        "<i class='fas fa-arrow-right'></i>",
      ],
    });
    $(".lazy").each(function () {
      $(this).attr("src", $(this).attr("data-src"));
    });
    $(".comment_spoiler").click(function () {
      var o = $("#comment"),
        a = o.val().length,
        s = o[0].selectionStart,
        r = o[0].selectionEnd,
        l =
          "[spoiler] Yorumunuzu bu araya yazın [/spoiler]" +
          o.val().substring(s, r);
      o.val(o.val().substring(0, s) + l + o.val().substring(r, a)), n(o[0], 9);
    });
    ($.expr[":"].contains = $.expr.createPseudo(function (t) {
      return function (e) {
        return 0 <= $(e).text().toUpperCase().indexOf(t.toUpperCase());
      };
    })),
      $("#myBtnContainer .btn")
        .filter(function (e) {
          var t = $("#myBtnContainer .btn").eq(e).attr("search-text");
          return 0 === $('.bolumust:contains("' + t + '")').length;
        })
        .remove(),
      $("#myBtnContainer .btn")
        .filter(function (e) {
          var t = $("#myBtnContainer .btn").eq(e).attr("search-text");
          return 0 < $('.bolumust:contains("' + t + '")').length;
        })
        .first()
        .addClass("active"),
      $("#myBtnContainer .btn").click(function () {
        var e = $(this).attr("search-text");
        $(".btn").removeClass("active"),
          $(this).addClass("active"),
          $(".bolumust").removeClass("show"),
          $('.bolumust:contains("' + e + '")').addClass("show");
      }),
      $("#myBtnContainer .btn.active").trigger("click");
  }),

  $(document).ready(function () {
    function initializeCarousel() {
      if ($(window).width() >= 1000) {
        var owl = $(".episodes");
        owl.owlCarousel({
          autoplay: true,
          autoplaySpeed: 700,
          autoplayTimeout: 10000,
          autoplayHoverPause: false,
          margin: 0,
          nav: true,
          dots: false,
          loop: false,
          rewind: true,
          responsive: {
            0: { items: 0 },
            450: { items: 0 },
            600: { items: 0 },
            1000: { items: 6 },
            1440: { items: 7 },
          },
          navText: [
            "<i class='fas fa-arrow-left'></i>",
            "<i class='fas fa-arrow-right'></i>",
          ],
        });
      } else {
        $(".episodes").removeClass("owl-carousel");
      }
    }
  
    initializeCarousel();
  
    $(window).resize(function () {
      initializeCarousel();
    });
  
    $(".lazy").each(function () {
      $(this).attr("src", $(this).attr("data-src"));
    });
  
    $(".comment_spoiler").click(function () {
      var o = $("#comment"),
        a = o.val().length,
        s = o[0].selectionStart,
        r = o[0].selectionEnd,
        l =
          "[spoiler] Yorumunuzu bu araya yazın [/spoiler]" +
          o.val().substring(s, r);
      o.val(o.val().substring(0, s) + l + o.val().substring(r, a)), n(o[0], 9);
    });
  
    ($.expr[":"].contains = $.expr.createPseudo(function (t) {
      return function (e) {
        return 0 <= $(e).text().toUpperCase().indexOf(t.toUpperCase());
      };
    })),
      $("#myBtnContainer .btn")
        .filter(function (e) {
          var t = $("#myBtnContainer .btn").eq(e).attr("search-text");
          return 0 === $('.bolumust:contains("' + t + '")').length;
        })
        .remove(),
      $("#myBtnContainer .btn")
        .filter(function (e) {
          var t = $("#myBtnContainer .btn").eq(e).attr("search-text");
          return 0 < $('.bolumust:contains("' + t + '")').length;
        })
        .first()
        .addClass("active"),
      $("#myBtnContainer .btn").click(function () {
        var e = $(this).attr("search-text");
        $(".btn").removeClass("active"),
          $(this).addClass("active"),
          $(".bolumust").removeClass("show"),
          $('.bolumust:contains("' + e + '")').addClass("show");
      }),
      $("#myBtnContainer .btn.active").trigger("click");
  });

  $(document).ready(function () {
    $(".menu-item-has-children a").append(" <i class='fas fa-caret-down'></i>");
    if ($(window).width() < 768) {
      $(".menu-item-has-children").click(function (e) {
        $(this).find(".sub-menu").slideToggle("fast");
      });
    } else {
      $(".menu-item-has-children").hover(function (e) {
        var $width = $(this).find("a").width();
        $(this).find(".sub-menu").slideToggle("fast");
        $(this)
          .find(".sub-menu")
          .css("min-width", $width + 21);
      });
    }
    $(".spclose").click(function () {
      $(".spad-splash").attr("style", "display:none !important");
    });
    $(".mobil-diziler").click(function () {
      $(".alphabetical-category-wrapper").fadeIn();
    });
    $(".series-close").click(function () {
      $(".alphabetical-category-wrapper").fadeOut();
    });
    $("#hata").click(function (e) {
      $("#pencere").fadeIn(600);
    });
  }),
  $(document).ready(function () {
    if ($(".footerleft").height() == 75) {
      $(".footerleft").after(
        '<div class="readMore"><i class="fas fa-chevron-down"></i></div>'
      );
      $(".footerleft").css("margin-bottom", "30px");
    }
    $(".readMore").click(function () {
      $(".readMore").hide();
      $(".footerleft").css({ "margin-bottom": "", "max-height": "unset" });
    });
    $("#izledim").on("click", function () {
      alert("Sadece kayıtlı kullanıcılar bu özelliği kullanabilir.");
    });
    $("#sonra").on("click", function () {
      alert("Sadece kayıtlı kullanıcılar bu özelliği kullanabilir.");
    });
    $(".hatakapat").click(function (e) {
      $("#pencere").fadeOut(600);
    });
  }),
  $(document).on("keydown", function (e) {
    27 === e.keyCode && $("#pencere").fadeOut(600);
  }),
  $(document).on("keydown", function (e) {
    27 === e.keyCode &&
      ($("#perde").fadeOut(600),
      $("#dizinot").css("display", "inline-block"),
      $("#dizinot2").css("display", "inline-block"),
      1e3 < $(window).width() &&
        ($(".ac-kapa").css("display", ""),
        $(".dizialani").css({ position: "", width: "", left: "", top: "" })));
  }),
  (window.onclick = function (e) {
    e.target == document.getElementById("perde")
      ? ($("#perde").fadeOut(600),
        $("#dizinot").css("display", "inline-block"),
        $("#dizinot2").css("display", "inline-block"),
        1e3 < $(window).width() &&
          ($(".ac-kapa").css("display", ""),
          $(".dizialani").css({ position: "", width: "", left: "", top: "" })))
      : e.target == document.getElementById("pencere") &&
        $("#pencere").fadeOut(600);
  }),
  $(document).ready(function () {
    $(".alphabetical-category-link").click(function (e) {
      e.preventDefault();
      var t = $(this),
        n = t.attr("href");
      $("ul[data-index='" + n + "']")
        .siblings(".alphabetical-category-list")
        .slideUp(),
        $("ul[data-index='" + n + "']").slideDown(),
        t.hasClass("active-letter") &&
          $("ul[data-index='" + n + "']").slideUp(),
        $(".alphabetical-category-link").not(this).removeClass("active-letter"),
        $(this).toggleClass("active-letter");
    }),
      $(".custom-scrollbar").perfectScrollbar();
  });
function setCookiex(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
}
function getCookiex(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
$(document).ready(function () {
  $(".boxshow").click(function () {
    setCookiex("box-show-cookie", "var", 30);
    $(".listshow").css("color", "#cdc2ff"),
      $(".boxshow").css("color", "#ffffff"),
      $(".listhead").css("display", "none"),
      $(".bolumismi").css("display", "none"),
      $(".bolumust").css({
        width: "calc(25% - 10px)",
        "margin-right": "10px",
        "margin-bottom": "12px",
        height: "51px",
        float: "left",
      }),
      $(".tarih").css({
        float: "left",
        "margin-top": "-24px",
        "margin-left": "17px",
        color: "#cdc2ff",
      }),
      $(".baslik").css({ width: "calc(100% - 28px)", float: "none" }),
      $("#scrollbar-container").css({ "max-height": "284px", width: "101%" });
  });
  if (getCookiex("box-show-cookie")) {
    $(".listshow").css("color", "#cdc2ff"),
      $(".boxshow").css("color", "#ffffff"),
      $(".listhead").css("display", "none"),
      $(".bolumismi").css("display", "none"),
      $(".bolumust").css({
        width: "calc(25% - 10px)",
        "margin-right": "10px",
        "margin-bottom": "12px",
        height: "51px",
        float: "left",
      }),
      $(".tarih").css({
        float: "left",
        "margin-top": "-24px",
        "margin-left": "17px",
        color: "#cdc2ff",
      }),
      $(".baslik").css({ width: "calc(100% - 28px)", float: "none" }),
      $("#scrollbar-container").css({ "max-height": "284px", width: "101%" });
  }
  $(".listshow").click(function () {
    setCookiex("box-show-cookie", "", -1);
    $(".listshow").css("color", ""),
      $(".boxshow").css("color", ""),
      $(".listhead").css("display", ""),
      $(".bolumismi").css("display", ""),
      $(".bolumust").css({
        width: "",
        "margin-right": "",
        "margin-bottom": "",
        height: "",
        float: "",
      }),
      $(".tarih").css({
        float: "",
        "margin-top": "",
        "margin-left": "",
        color: "",
      }),
      $(".baslik").css({ width: "", float: "" }),
      $("#scrollbar-container").css({ "max-height": "", width: "" });
  });
});
$("#trd").click(function () {
  $(".dil").hide();
  $('[dil="trd"]').css("display", "inline-block");
  $(".source_button").removeClass("dil_aktif");
  $("#trd").addClass("dil_aktif");
});
$("#tra").click(function () {
  $(".dil").hide();
  $('[dil="tra"]').css("display", "inline-block");
  $(".source_button").removeClass("dil_aktif");
  $("#tra").addClass("dil_aktif");
});
$("#eng").click(function () {
  $(".dil").hide();
  $('[dil="eng"]').css("display", "inline-block");
  $(".source_button").removeClass("dil_aktif");
  $("#eng").addClass("dil_aktif");
});
$("#org").click(function () {
  $(".dil").hide();
  $('[dil="org"]').css("display", "inline-block");
  $(".source_button").removeClass("dil_aktif");
  $("#org").addClass("dil_aktif");
});
$("#frg").click(function () {
  $(".dil").hide();
  $('[dil="frg"]').css("display", "inline-block");
  $(".source_button").removeClass("dil_aktif");
  $("#frg").addClass("dil_aktif");
});
var video = $(".trailer-video").attr("src");
$(document).ready(function () {
  $("#trailerbutton").click(function (e) {
    $("#trailer").fadeIn(600);
  });
  $(".trailerclose").click(function (e) {
    $("#trailer").fadeOut(600);
    $(".trailer-video").attr("src", "");
    $(".trailer-video").attr("src", video);
  });
  $("#trailerbutton").on("click", function (ev) {
    $(".trailer-video")[0].src += "?autoplay=1";
    ev.preventDefault();
  });
});
$(document).click(function (e) {
  if ($(e.target).closest("#trailer").length > 0) {
    $("#trailer").fadeOut(600);
    $(".trailer-video").attr("src", "");
    $(".trailer-video").attr("src", video);
  }
});
$(document).on("keydown", function (x) {
  if (x.keyCode === 27) {
    $("#trailer").fadeOut(600);
    $(".trailer-video").attr("src", "");
    $(".trailer-video").attr("src", video);
  }
});
$(function () {
  $('input[name="search-series"]').keyup(function () {
    var searchText = $(this).val().toLowerCase();
    $(".alphabetical-category-list li").each(function () {
      var currentLiText = $(this).text().toLowerCase(),
        showCurrentLi = currentLiText.indexOf(searchText) !== -1;
      $(this).toggle(showCurrentLi);
    });
  });
});
