var app = app || {};

(function(){
    'use strict'; 

    app.root_url = "/test_task/api/v1/";
    app._requests = 0;
    app.models = {};
    app.routes = {};
    app.collections = {};
    app.exclude_fields = ['resource_uri'];
    app.current_collection = undefined;

    app.set_title = function(title){
        document.title = title;
    };

    app.get_current_collection = function(){
        return app.collections[app.current_collection];
    };

    app.build = function(params){
        var name = params.resource_name;

        var Model = Backbone.Model.extend({
        });

        params.model = Model;
        params.parse = function(data, options){
            return data.objects;
        };

        var Collection = Backbone.Collection.extend(params);

        app.routes[name] = params.verbose_name_plural;
        app.models[name] = Model;
        app.collections[name] = new Collection();
    };

    app.switch_collection = function(collection_name){
        app.current_collection = collection_name;
        var collection = app.get_current_collection();
        app.set_title(collection.verbose_name_plural);
        collection.fetch();
        app.render_table(collection);
    };

    app.set_initial_collection = function(collection_name){
        if(app.current_collection === undefined){
            app.current_collection = collection_name;
        }
    };

    app.build_router = function(){
        var Router = Backbone.Router.extend({
            routes: {
                ":collection": "switchCollection",
            },

            switchCollection: function(collection){
                app.switch_collection(collection);
            },
        });

        app.router = new Router();
    };

    app.observe = function(n){
        // dummy observer
        app._requests += n;
        if(app._requests === 0){
            $.event.trigger("requests_completed");
        }
    };

    app.inflect = function(key){
        return app.get_current_collection().schema.inflections[key];
    };

    app.pluralize = function(n, forms){
        var f1 = forms[0];
        var f2 = forms[1];
        var f5 = forms[2];

        var n1 = n % 100;
        var n2 = n % 10;

        if(n1 > 10 && n1 < 20){
            return f5;
        }
        if(n2 > 1 && n2 < 5){
            return f2;
        }
        if(n2 === 1){
            return f1;
        }

        return f5;
    };

    app.init = function(){
        var csrftoken = $.cookie('csrftoken');

        function csrfSafeMethod(method) {
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });


        $.getJSON(app.root_url, function(data){
            app.observe(Object.keys(data).length);

            // redundant queries,
            // but overriding tastypie.Api.top_level is much uglier

            $.each(data, function(resource_name, resource_description){
                app.set_initial_collection(resource_name);

                $.getJSON(resource_description.schema, function(schema){
                    app.build({
                        url: resource_description.list_endpoint,
                        resource_name: resource_name,
                        schema: schema,
                        verbose_name: schema.verbose_name,
                        verbose_name_plural: schema.verbose_name_plural,
                    });
                    app.observe(-1);
                });
            });
        });
    };

    app.build_url = function(resource_name){
        return "#" + resource_name;
    };

    app.mount = function(){
        app.build_router();

        Backbone.history.start();

        //app.router.navigate(app.build_url(app.current_collection), {trigger: true});

        app.render_menu();
    };

    app.init();

})();

$(document).on("requests_completed", app.mount);
