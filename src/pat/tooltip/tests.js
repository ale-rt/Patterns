define(["pat-tooltip", "pat-inject"], function(pattern, inject) {
    var utils = {
        createTooltip: function(c) {
            var cfg = c || {};
            return $("<a/>", {
                "id":   cfg.id || "tooltip",
                "href": cfg.href || "#anchor",
                "title": cfg.title || "tooltip title attribute",
                "data-pat-tooltip": "" || cfg.data,
                "class": "pat-tooltip"
            }).appendTo($("div#lab"));
        },

        removeTooltip: function removeTooltip() {
            var $el = $("a#tooltip");
            $el.remove();
        },

        createTooltipSource: function() {
            return $("<span style='display: none' id='tooltip-source'>"+
                    "<strong>Local content</strong></span>")
                .appendTo($("div#lab"));
        },

        click: {
            type: "click",
            preventDefault: function () {}
        }
    };

    describe("pat-tooltip", function () {
        beforeEach(function() {
            $("<div/>", {id: "lab"}).appendTo(document.body);
        });

        afterEach(function() {
            $("#lab").remove();
        });

        describe("A Tooltip", function () {

            it("will be closed when a form with class .close-panel is submitted", function () {
                runs(function () {
                    var $div = $("<div/>", {id: "content"});
                    var $form = $("<form/>", {"class": "close-panel"});
                    $div.appendTo(document.body);
                    $form.appendTo($div[0]);
                    utils.createTooltip({
                        data: "source: content",
                        href: "#content"
                    });
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    spyOn(pattern, "hide").andCallThrough();
                    pattern.init($el);
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                });
                waits(100); // hide events get registered 50 ms after show
                runs(function () {
                    $(document).on("submit", function (ev) { ev.preventDefault(); });
                    $("form.close-panel").submit();
                    expect(pattern.hide).toHaveBeenCalled();
                    $("div#content").remove();
                });
            });

            it("will NOT be closed when a form WITHOUT class .close-panel is submitted", function () {
                runs(function () {
                    var $div = $("<div/>", {id: "content"});
                    var $form = $("<form/>");
                    $div.appendTo(document.body);
                    $form.appendTo($div[0]);
                    utils.createTooltip({
                        data: "source: content",
                        href: "#content"
                    });
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    spyOn(pattern, "hide").andCallThrough();
                    pattern.init($el);
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                });
                waits(100); // hide events get registered 50 ms after show
                runs(function () {
                    $(document).on("submit", function (ev) { ev.preventDefault(); });
                    $("#content form").submit();
                    expect(pattern.hide).not.toHaveBeenCalled();
                    $("div#content").remove();
                });
            });

            it("gets a .close-panel element when closing=close-button", function () {
                utils.createTooltip({
                    data: "closing: close-button",
                    href: "/tests/content.html#content"
                });
                var $el = $("a#tooltip");
                pattern.init($el);
                $el.trigger(utils.click);
                expect($(".close-panel").length).toBeTruthy();
            });

            it("is closed when one clicks on a .close-panel element", function () {
                runs(function () {
                    utils.createTooltip({
                        data: "trigger: click; closing: close-button",
                        href: "/tests/content.html#content"
                    });
                    spyOn(pattern, "show").andCallThrough();
                    spyOn(pattern, "hide").andCallThrough();
                    var $el = $("a#tooltip");
                    pattern.init($el);
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                });
                waits(100); // hide events get registered 50 ms after show
                runs(function () {
                    $(".close-panel").click();
                    expect(pattern.hide).toHaveBeenCalled();
                });
            });

            it("is NOT closed when an injection happens", function () {
                runs(function () {
                    utils.createTooltip({
                        data: "trigger: click; closing: auto",
                        href: "/tests/content.html#content"
                    });
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    spyOn(pattern, "hide").andCallThrough();
                    pattern.init($el);
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                });
                waits(100); // hide events get registered 50 ms after show
                runs(function () {
                    var $el = $("a#tooltip");
                    var $container = $el.data("patterns.tooltip.container");
                    $container.trigger("patterns-inject-triggered");
                });
                waits(100); // hide events get registered 50 ms after show
                runs(function () {
                    expect(pattern.hide).not.toHaveBeenCalled();
                });
            });
        });

        describe("When a tooltip is clicked", function () {
            describe("if the tootip is a hyperlink", function () {
                beforeEach(function() {
                    utils.createTooltip();
                });
                afterEach(function() {
                    utils.removeTooltip();
                });
                it("the default click action is prevented", function () {
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    spyOn(utils.click, "preventDefault");
                    pattern.init($el);
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                    expect(utils.click.preventDefault).toHaveBeenCalled();
                });
            });

            describe("if the 'source' parameter is 'title'", function () {
                afterEach(function() {
                    utils.removeTooltip();
                });
                it("will show the contents of the 'title' attribute", function () {
                    utils.createTooltip({data: "source: title"});
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    var title = $el.attr("title");
                    pattern.init($el);
                    // The 'title' attr gets removed, otherwise the browser's
                    // tooltip will appear
                    expect($el.attr("title")).toBeFalsy();

                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                    var $container = $el.data("patterns.tooltip.container");
                    expect($container.find('p').text()).toBe(title);
                });
            });

            describe("if the 'source' parameter is 'ajax'", function () {
                afterEach(function() {
                    utils.removeTooltip();
                });
                it("will fetch its contents via ajax", function () {
                    utils.createTooltip({data: "source: auto", href: "/tests/content.html#content"});
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    spyOn(inject, "execute"); //.andCallThrough();
                    pattern.init($el);
                    runs(function () {
                        $el.trigger(utils.click);
                    });
                    waits(200);
                    runs(function () {
                        expect(pattern.show).toHaveBeenCalled();
                        expect(inject.execute).toHaveBeenCalled();
                        /* XXX: The ajax call works fine in the browser but not
                         * via PhantomJS. Will have to debug later.
                         *
                        var $container = $el.data("patterns.tooltip.container");
                        // Content is fetched from ./tests/content.html#content
                        expect($container.text()).toBe(
                            "External content fetched via an HTTP request.");
                        */
                    });
                });
            });

            describe("if the 'source' parameter is 'content'", function () {
                afterEach(function() {
                    utils.removeTooltip();
                });
                it("will clone a DOM element from the page", function () {
                    utils.createTooltip({data: "source: content", href: "#tooltip-source"});
                    utils.createTooltipSource();
                    var $el = $("a#tooltip");
                    spyOn(pattern, "show").andCallThrough();
                    pattern.init($el);
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                    var $container = $el.data("patterns.tooltip.container");
                    expect($container.find('strong').text()).toBe("Local content");
                });
            });

            describe("if the 'source' parameter is 'auto'", function () {
                afterEach(function() {
                    utils.removeTooltip();
                });
                it("will revert to 'ajax' if 'href' points to an external URL", function () {
                    utils.createTooltip({data: "source: auto", href: "/tests/content.html#content"});
                    var $el = $("a#tooltip");
                    pattern.init($el);
                    var options = $el.data("patterns.tooltip");
                    expect(options.source).toBe("ajax");
                });
                it("will revert to 'content' if 'href' points to a document fragment", function () {
                    utils.createTooltipSource();
                    utils.createTooltip({data: "source: auto", href: "#tooltip-source"});
                    var $el = $("a#tooltip");
                    pattern.init($el);
                    var options = $el.data("patterns.tooltip");
                    expect(options.source).toBe("content");
                });
            });
        });

        describe("A tooltip that opens on click and contains another tooltip trigger", function () {
            beforeEach(function() {
                utils.createTooltip({
                    data: "trigger: click; source: content",
                    href: "#tooltip-content"
                });
                $("<div />", {
                    "id":   "tooltip-content"
                }).appendTo($("div#lab"));
                $("<a/>", {
                    "id":   "nested-tooltip",
                    "href": "#nested-tooltip-content",
                    "title": "nested tooltip title attribute",
                    "data-pat-tooltip": "trigger: click; source: content",
                    "class": "pat-tooltip"
                }).appendTo($("div#tooltip-content"));
            });
            afterEach(function() {
                utils.removeTooltip();
            });
            it("will not close if the contained trigger is clicked", function () {
                runs(function () {
                    spyOn(pattern, "show").andCallThrough();
                    var $el = $("a#tooltip");
                    pattern.init($el);
                    pattern.init($("a#nested-tooltip"));
                    $el.trigger(utils.click);
                    expect(pattern.show).toHaveBeenCalled();
                });
                waits(100); // hide events get registered 50 ms after show
                runs(function () {
                    $(".tooltip-container a#nested-tooltip").trigger(utils.click);
                    expect($(".tooltip-container a#nested-tooltip").css("visibility")).toBe("visible");
                });
            });
        });
    });
});
// jshint indent: 4, browser: true, jquery: true, quotmark: double
