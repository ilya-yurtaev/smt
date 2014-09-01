/** @jsx React.DOM */

var app = app || {};

(function(){
    'use strict';

    function _id(id){
        return $(id).get()[0];
    };

    function stop(event){
        event.preventDefault();
        event.stopPropagation();
    };

    function remount(id){
        if((id).length > 1){
            React.unmountComponentAtNode(_id(id));
            $(id).empty();
        };
    };

    var FIELD_MAP = {
        'string': 'text',
        'datetime': 'datetime',
        'integer': 'number',
        'boolean': 'checkbox',
    }


    var Table = React.createClass({displayName: 'Table',
        mixins: [Backbone.React.Component.mixin],

        getInitialState: function(){
            return {
                'form': "hidden",
            }
        },

        cellClicked: function(event){
            var el = event.target;
        },

        create_cell: function(value, key){
            return (
                React.DOM.td({className: key, 
                    onClick: this.cellClicked
                }, value)
            );
        },

        create_th: function(key, value){
            return (
                React.DOM.th({className: key.type, scope: "col"}, key.verbose_name)
            )
        },

        create_thead: function(){
            var fields = this.schema.fields;
            return (
                React.DOM.tr(null, _.map(fields, this.create_th))
            )
        },

        create_row: function(obj){
            return (
                React.DOM.tr({key: obj.id, 'data-url': obj.resource_uri}, _.map(obj, this.create_cell))
            );
        },

        create_inputs: function(field, name){
            if(name == "id" || name == "resource_uri") return;

            var id = "id_"+name;
            return (
                React.DOM.p(null, 
                    React.DOM.label({for: id}, field.verbose_name), 
                    React.DOM.input({id: id, type: FIELD_MAP[field.type]})
                )
            )
        },

        toggle_form: function(event){
            this.setState({form: this.state.form == "visible" ? "hidden": "visible"});
            $("#modelform").toggle();
        },

        handleSubmit: function(event){
            stop(event);
            alert($(event.target).serializeArray());
        },

        render: function(){
            this.schema = this.props.schema;
            var add_link_title = "Добавить элемент ";
            add_link_title += this.state.form == "visible"? "-" : "+";

            return (
                React.DOM.div(null, 
                    React.DOM.table({id: "data-table"}, 
                        React.DOM.thead(null, this.create_thead()), 
                        React.DOM.tbody(null, 
                            this.props.collection.map(this.create_row)
                        )
                    ), 

                    React.DOM.p(null, React.DOM.span({className: "link", onClick: this.toggle_form}, add_link_title)), 

                    React.DOM.form({method: "post", 
                        id: "modelform", 
                        action: this.props.root_url, 
                        className: this.state.form, 
                        onSubmit: this.handleSubmit
                        }, 

                        React.DOM.fieldset(null, 
                            _.map(this.schema.fields, this.create_inputs)
                        ), 
                        React.DOM.p({class: "submit"}, React.DOM.input({type: "submit", value: "Добавить"}))
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

        switchCollection: function(event){
            this.setState({'path': event.target.href.split("#")[1]});
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
        remount("#data");
        React.renderComponent(
            Table({
                collection: collection, 
                schema: collection.schema, 
                root_url: collection.url}
            ),
            _id("#data")
        );

        $(".hidden").hide();
        $("input[type=datetime]").datepicker({dateFormat: "yy-mm-dd"});
    };

})();
