var app = app || {};

(function(){
    'use strict';

    var ESC = 27, ENTER = 13; 
    var datepicker_params = $.datepicker.regional['ru'];
    datepicker_params.dateFormat = "yy-mm-dd";
    datepicker_params.prevText = "&larr;";
    datepicker_params.nextText = "&rarr;";
    datepicker_params.onSelect = function(d, el){
        // really ugly
        var input = el.input[0];
        if($(input).attr("type")=="button"){
            var model = app.get_current_collection().get($(input).attr("data-object-id"));
            var params = {};
            params[input.name] = $(input).val();
            model.save(params);
            app.get_current_collection().fetch();
        };
    };
    app.datepicker_params = datepicker_params;

    function _id(id){
        return $(id).get()[0];
    };

    function stop(e){
        e.preventDefault();
        e.stopPropagation();
    };

    var Cell = React.createClass({displayName: 'Cell',
        getInitialState: function(){
            return {
                old_value: undefined,
                value: undefined,
                changed: false,
            }
        },

        handleFocus: function(e){
            this.setState({old_value: e.target.value});
        },

        handleBlur: function(e){
            this.setState({editable: false});
            this.setState({value: e.target.value});

            var node = e.target;
            var value = node.value;
            var name = node.name;

            if(value && (value != this.state.old_value)){
                this.setState({changed: true});
                this.save(name, value);
            }
        },

        handleKeyDown: function(e){
            switch(e.keyCode){
                case ENTER:
                    $(e.target).trigger("blur");
                    break;
                default:
                    break;
            }
        },

        handleClick: function(e){
            this.setState({editable: true});
            var input = e.target;
            $(input).focus();
            $(input).select();
        },

        save: function(name, value){
            this.setState({value: value});
            // treats model like new one and produces PUT instead of PATCH OH SHI
            var model = app.get_current_collection().get(this.obj.id);
            var params = {};
            params[name] = value;
            model.save(params);
            app.get_current_collection().fetch();
        },

        render: function(){
            this.obj = this.props.obj;
            this.field = this.props.field.field;

            var value = this.state.value || this.obj[this.props.field.name];
            var title = "Press Enter to save, Escape to cancel";

            var input = React.DOM.input({
                onClick: this.handleClick, 
                type: this.state.editable?app.get_field_type(this.field.type):"button", 
                name: this.props.field.name, 
                defaultValue: value, 
                title: title, 
                onBlur: this.handleBlur, 
                onFocus: this.handleFocus, 
                onKeyDown: this.handleKeyDown, 
                'data-object-id': this.obj.id, 
                size: value.length, 
                className: app.get_field_type(this.field.type)}
            );

            return (
                React.DOM.td(null, 
                    input
                )
            )
        }
    });

    var Table = React.createClass({displayName: 'Table',
        mixins: [Backbone.React.Component.mixin],

        create_cells: function(obj){
            var cells = [];

            _.each(this.fields, function(field, order){
                cells.push(
                    Cell({field: field, obj: obj})
                );
            });

            return cells;
        },

        create_th: function(field, order){
            var field = field.field;
            return (
                React.DOM.th({className: field.type, scope: "col"}, field.verbose_name)
            )
        },

        create_thead: function(){
            return (
                React.DOM.tr(null, _.map(this.fields, this.create_th))
            )
        },

        create_row: function(obj){
            return (
                React.DOM.tr({key: obj.id, 'data-url': obj.resource_uri, 'data-id': obj.id}, this.create_cells(obj))
            );
        },

        render: function(){
            var schema = this.props.schema;
            var ordered_fields = {};
            var order = _.invert(schema.fields_order);
            _.map(
                _.omit(schema.fields, app.exclude_fields),
                function(field, name){
                    ordered_fields[order[name]] = {
                        name: name,
                        field: field
                    }
                }
            );
            var items_shown = this.props.collection.length;
            var plural_form = app.pluralize(items_shown, schema.plural_forms);
            var tfoot_text = [items_shown, plural_form].join(" "); 
            var cols = _.keys(this.fields).length;

            this.schema = schema;
            this.fields = ordered_fields;

            return (
                React.DOM.div(null, 
                    React.DOM.table({id: "data-table"}, 
                        React.DOM.thead(null, this.create_thead()), 
                        React.DOM.tbody(null, 
                            this.props.collection.map(this.create_row)
                        ), 
                        React.DOM.tfoot(null, 
                            React.DOM.tr(null, 
                                React.DOM.td({colSpan: cols}, tfoot_text)
                            )
                        )
                    ), 
                    Form({root_url: this.props.root_url, fields: this.fields})
                )
            )
        }
    });

    var Form = React.createClass({displayName: 'Form',
        getInitialState: function(){
            return {
                visible: false,
            }
        },

        toggle_form: function(e){
            this.setState({visible: !this.state.visible});
            $("#modelform").toggle(300);
        },

        create_inputs: function(field, order){
            if(field.name == "id" || field.name == "resource_uri") return;

            var name = field.name;
            var field = field.field;
            var required = !field.blank? "required" : '';

            var id = "id_"+name;
            return (
                React.DOM.p(null, 
                    React.DOM.label({htmlFor: id}, field.verbose_name), 
                    React.DOM.input({id: id, 
                        type: app.get_field_type(field.type), 
                        name: name, 
                        required: required, 
                        className: app.get_field_type(field.type)}
                    )
                )
            )
        },

        handleSubmit: function(e){
            stop(e);
            var data = Backbone.Syphon.serialize(e.target);
            var collection = app.get_current_collection();
            collection.create(data);

            $(e.target).trigger("reset");
        },

        render:function(){
            var add_link_title = [
                "Добавить ", app.inflect('accs'), this.state.visible? "–" : "+"
            ].join(" ");

            return (
                React.DOM.div(null, 
                    React.DOM.p(null, React.DOM.span({className: "link", onClick: this.toggle_form}, add_link_title)), 

                    React.DOM.form({method: "post", 
                        id: "modelform", 
                        action: this.props.root_url, 
                        className: this.state.visible?"visible":"hidden", 
                        onSubmit: this.handleSubmit
                        }, 

                        React.DOM.fieldset(null, 
                            _.map(this.props.fields, this.create_inputs)
                        ), 
                        React.DOM.p({className: "submit"}, React.DOM.input({type: "submit", value: "Добавить"}))
                    )
                )
            );
        }
    });

    var Menu = React.createClass({displayName: 'Menu',
        getInitialState: function(){
            return {
                'path': app.build_url(app.current_collection)
            }
        },

        switchCollection: function(e){
            this.setState({'path': e.target.href.split("#")[1]});
        },

        create_link: function(title, link){
            var href = app.build_url(link);
            var cls = ~href.indexOf(this.state.path) ? 'active': '';

            return (
                React.DOM.li(null, React.DOM.a({id: link, 
                        'data-model': link, 
                        onClick: this.switchCollection, 
                        className: cls, 
                        href: href}, title)
                )
            )
        },
        render: function(){
            return (
                React.DOM.ul(null, _.map(this.props.links, this.create_link))
            );
        }
    });

    app.render_templates = function(){
        app.render_menu();
        app.render_table(app.get_current_collection());
    };

    app.render_menu = function(){
        React.renderComponent(
            Menu({links: app.routes}),
            _id("#menu")
        );
    };

    app.render_table = function(collection){
        var data = _id("#data");

        if(data){
            React.unmountComponentAtNode(data);
        };

        React.renderComponent(
            Table({
                collection: collection, 
                model: collection.model, 
                schema: collection.schema, 
                root_url: collection.url}
            ),
            data
        );

        $(document.body).on("focus", ".datetime", function(){
            $(this).datepicker(app.datepicker_params);
        });
    };

})();
