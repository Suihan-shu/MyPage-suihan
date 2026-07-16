$(document).ready(function () {
  function slugifyHeading(text) {
    return (text || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fa5\-\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function getTocScope() {
    var $scope = $("#markdown-content");
    if (!$scope.length) {
      $scope = $(".post article").first();
    }
    if (!$scope.length) {
      $scope = $(".post").first();
    }
    return $scope;
  }

  function getTocHeadings($scope) {
    if (!$scope || !$scope.length) return $();
    var $headings = $scope.find("h1, h2, h3, h4, h5");
    var $postTitle = $(".post").first().find("h1.post-title").first();
    if ($postTitle.length && !$postTitle.is("[data-toc-skip]")) {
      $headings = $headings.add($postTitle);
    }
    return $headings;
  }

  function getScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function getFixedHeaderOffset() {
    var headerOffset = 24;
    var $fixedNavbar = $(".navbar.fixed-top").first();
    if ($fixedNavbar.length) {
      headerOffset += $fixedNavbar.outerHeight() || 0;
    }
    return headerOffset;
  }

  function getScrollAnchorPosition() {
    return getScrollTop() + getFixedHeaderOffset();
  }

  function getCurrentHeadingElement($headings) {
    if (!$headings || !$headings.length) return null;
    var anchor = getScrollAnchorPosition();
    var current = $headings.first()[0];

    $headings.each(function () {
      var top = $(this).offset().top;
      if (top <= anchor) {
        current = this;
      }
    });

    return current;
  }

  function decodeHashId(href) {
    if (!href) return "";
    var hashIndex = href.indexOf("#");
    if (hashIndex < 0) return "";
    var raw = href.substring(hashIndex + 1);
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch (error) {
      return raw;
    }
  }

  function setActiveTocLink($tocSidebar, headingId) {
    if (!$tocSidebar || !$tocSidebar.length) return;

    var $links = $tocSidebar.find("a.toc-nav-link");
    if (!$links.length) return;

    $links.removeClass("active");
    if (!headingId) return;

    var $currentLink = $links
      .filter(function () {
        return decodeHashId($(this).attr("href")) === headingId;
      })
      .first();

    if (!$currentLink.length) return;

    $currentLink.addClass("active");
    $currentLink.parents("ul.toc-nav-list").prev("a.toc-nav-link").addClass("active");
  }

  function initCustomTocState($tocSidebar, $headings) {
    if (!$tocSidebar || !$tocSidebar.length || !$headings || !$headings.length) {
      return function () {
        return "";
      };
    }

    var rafPending = false;
    var lastHeadingId = "";
    var headingPositions = [];

    function rebuildHeadingPositions() {
      headingPositions = [];
      $headings.each(function () {
        var id = this.id || "";
        if (!id) return;
        headingPositions.push({
          id: id,
          text: $(this).text().trim(),
          top: $(this).offset().top,
        });
      });
    }

    function findCurrentHeadingEntry(anchor) {
      if (!headingPositions.length) return null;

      var left = 0;
      var right = headingPositions.length - 1;
      var currentIndex = 0;

      while (left <= right) {
        var mid = Math.floor((left + right) / 2);
        if (headingPositions[mid].top <= anchor) {
          currentIndex = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      return headingPositions[currentIndex] || null;
    }

    function updateTocState() {
      var entry = findCurrentHeadingEntry(getScrollAnchorPosition());
      if (!entry) return;

      var headingId = entry.id;
      if (!headingId) return;

      if (headingId !== lastHeadingId) {
        lastHeadingId = headingId;
        setActiveTocLink($tocSidebar, headingId);
      }
    }

    function scheduleUpdate() {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(function () {
        rafPending = false;
        updateTocState();
      });
    }

    function rebuildAndUpdate() {
      rebuildHeadingPositions();
      scheduleUpdate();
    }

    $(window)
      .off("scroll.customToc resize.customToc hashchange.customToc load.customToc")
      .on("scroll.customToc hashchange.customToc", scheduleUpdate)
      .on("resize.customToc load.customToc", rebuildAndUpdate);

    $(document).off("toggle.customToc").on("toggle.customToc", "details", function () {
      window.setTimeout(rebuildAndUpdate, 0);
    });

    $tocSidebar.off("click.customToc").on("click.customToc", "a.toc-nav-link", function () {
      window.setTimeout(scheduleUpdate, 0);
    });

    rebuildAndUpdate();
    window.setTimeout(rebuildAndUpdate, 300);
    window.setTimeout(rebuildAndUpdate, 1200);

    return function () {
      var entry = findCurrentHeadingEntry(getScrollAnchorPosition());
      return entry ? entry.text : "";
    };
  }

  function buildCustomToc($tocSidebar) {
    var $scope = getTocScope();
    if (!$scope.length) return false;

    var $headings = getTocHeadings($scope).filter(':not([data-toc-skip])');
    if (!$headings.length) return false;

    var usedIds = {};
    var $root = $('<ul class="toc-nav-list"></ul>');
    
    var dummyLi = $('<li></li>').append($root);
    var stack = [{ level: 0, $li: dummyLi }];

    $headings.each(function () {
      var $heading = $(this);
      var level = parseInt(this.tagName.charAt(1), 10);

      var id = $heading.attr("id");
      if (!id) {
        var baseId = slugifyHeading($heading.text()) || "section";
        var nextId = baseId;
        var counter = 2;
        while (usedIds[nextId] || document.getElementById(nextId)) {
          nextId = baseId + "-" + counter;
          counter += 1;
        }
        id = nextId;
        $heading.attr("id", id);
      }
      usedIds[id] = true;

      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      var $parentLi = stack[stack.length - 1].$li;
      var $ul = $parentLi.children("ul.toc-nav-list");
      if (!$ul.length) {
        $ul = $('<ul class="toc-nav-list"></ul>');
        $parentLi.append($ul);
      }

      var $item = $(
        '<li class="toc-nav-item"><a class="toc-nav-link" href="#' +
          id +
          '">' +
          $heading.text() +
          "</a></li>"
      );
      $ul.append($item);
      stack.push({ level: level, $li: $item });
    });

    $tocSidebar.empty().append($root);
    return true;
  }

  function initMobileTocDrawer($tocSidebar, getCurrentHeadingText) {
    if (!$tocSidebar || !$tocSidebar.length) return;

    var hasTocLinks = $tocSidebar.find("a.toc-nav-link").length > 0;
    if (!hasTocLinks) return;

    var inferredZh = (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0;
    var tocLabel = $tocSidebar.data("mobileLabel") || (inferredZh ? "目录" : "Contents");
    var closeLabel = $tocSidebar.data("mobileCloseLabel") || (inferredZh ? "关闭" : "Close");
    var currentPrefix = $tocSidebar.data("mobileCurrentPrefix") || "";

    if (!$("#mobile-toc-toggle").length) {
      $("body").append(
        '<button id="mobile-toc-toggle" type="button" aria-label="Open table of contents" aria-expanded="false"><span id="mobile-toc-current"></span><span class="mobile-toc-dot"> · </span><span id="mobile-toc-label"></span></button>'
      );
      $("body").append('<div id="mobile-toc-overlay" aria-hidden="true"></div>');
      $("body").append(
        '<aside id="mobile-toc-drawer" aria-hidden="true"><div class="mobile-toc-header"><span id="mobile-toc-header-label"></span><button id="mobile-toc-close" type="button" aria-label="Close table of contents"></button></div><nav id="mobile-toc-content"></nav></aside>'
      );
    }

    var $toggle = $("#mobile-toc-toggle");
    var $overlay = $("#mobile-toc-overlay");
    var $drawer = $("#mobile-toc-drawer");
    var $drawerContent = $("#mobile-toc-content");
    var $toggleCurrent = $("#mobile-toc-current");
    var $toggleLabel = $("#mobile-toc-label");
    var $toggleDot = $toggle.find(".mobile-toc-dot");
    var $headerLabel = $("#mobile-toc-header-label");
    var $closeButton = $("#mobile-toc-close");

    $toggleLabel.text(tocLabel);
    $headerLabel.text(tocLabel);
    $closeButton.text(closeLabel);

    var $scope = getTocScope();
    var $headings = getTocHeadings($scope);

    function syncDrawerToc() {
      $drawerContent.empty().append($tocSidebar.children().clone(true, true));
    }

    function updateCurrentSectionLabel() {
      var currentTextFromTracker =
        typeof getCurrentHeadingText === "function" ? getCurrentHeadingText() : "";

      var currentText = currentTextFromTracker;
      if (!currentText) {
        var currentHeading = getCurrentHeadingElement($headings);
        currentText = currentHeading ? $(currentHeading).text().trim() : "";
      }

      if (!currentText) {
        $toggleCurrent.text("");
        $toggleDot.hide();
        return;
      }

      if (currentText) {
        var currentDisplayText = currentPrefix ? currentPrefix + ": " + currentText : currentText;
        $toggleCurrent.text(currentDisplayText);
        $toggleDot.show();
      } else {
        $toggleCurrent.text("");
        $toggleDot.hide();
      }
    }

    function openDrawer() {
      syncDrawerToc();
      $drawer.addClass("open").attr("aria-hidden", "false");
      $overlay.addClass("open").attr("aria-hidden", "false");
      $toggle.attr("aria-expanded", "true");
      $("body").addClass("mobile-toc-open");
    }

    function closeDrawer() {
      $drawer.removeClass("open").attr("aria-hidden", "true");
      $overlay.removeClass("open").attr("aria-hidden", "true");
      $toggle.attr("aria-expanded", "false");
      $("body").removeClass("mobile-toc-open");
    }

    $toggle.off("click.mobileToc").on("click.mobileToc", function () {
      if ($drawer.hasClass("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    $overlay.off("click.mobileToc").on("click.mobileToc", closeDrawer);
    $("#mobile-toc-close").off("click.mobileToc").on("click.mobileToc", closeDrawer);

    $drawerContent.off("click.mobileToc").on("click.mobileToc", "a", function () {
      closeDrawer();
    });

    $(document).off("keydown.mobileToc").on("keydown.mobileToc", function (event) {
      if (event.key === "Escape" && $drawer.hasClass("open")) {
        closeDrawer();
      }
    });

    $(window).off("scroll.mobileToc resize.mobileToc").on("scroll.mobileToc resize.mobileToc", function () {
      if (!window.matchMedia("(max-width: 991.98px)").matches) {
        closeDrawer();
      }
      updateCurrentSectionLabel();
    });

    updateCurrentSectionLabel();
  }

  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    var $tocSidebar = $("#toc-sidebar");
    var tocMode = $tocSidebar.data("toc-mode");
    var getCurrentHeadingText = null;

    if (tocMode === "jekyll") {
      var customTocBuilt = buildCustomToc($tocSidebar);
      if (customTocBuilt) {
        var $scope = getTocScope();
        var $headings = getTocHeadings($scope);
        getCurrentHeadingText = initCustomTocState($tocSidebar, $headings);
      }
    } else {
      // remove related publications years from the TOC
      $(".publications h2").each(function () {
        $(this).attr("data-toc-skip", "");
      });
      var navSelector = "#toc-sidebar";
      var $myNav = $(navSelector);
      Toc.init($myNav);
      $("body").scrollspy({
        target: navSelector,
        offset: 100,
      });
    }

    initMobileTocDrawer($tocSidebar, getCurrentHeadingText);
  }


  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
