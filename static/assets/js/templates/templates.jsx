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
    };

    var Cell = React.createClass({
        getInitialState: function(){
            return {
                "editable": false,
            }
        },

        handleClick: function(event){
            this.setState({"editable": true});
        },

        handleBlur: function(event){
            this.setState({"editable": false});
            alert(event.target.innerText);
        },

        render: function(){
            return (
                <td className={this.props.field_type}
                    onClick={this.handleClick}
                    onBlur={this.handleBlur}
                    contentEditable={this.state.editable}
                >{this.props.field_name}</td>
            )
        },
    });

    var Table = React.createClass({
        mixins: [Backbone.React.Component.mixin],

        create_cells: function(obj){
            var cells = [];

            _.each(this.fields, function(field, order){
                cells.push(
                    <Cell field_type={field.field.type} field_name={obj[field.name]} />
                );
            });

            return cells;
        },

        create_th: function(field, order){
            var field = field.field;
            return (
                <th className={field.type} scope="col">{field.verbose_name}</th>
            )
        },

        create_thead: function(){
            return (
                <tr>{_.map(this.fields, this.create_th)}</tr>
            )
        },

        create_row: function(obj){
            return (
                <tr key={obj.id} data-url={obj.resource_uri}>{this.create_cells(obj)}</tr>
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
            this.schema = schema;
            this.fields = ordered_fields;

            var items_shown = this.props.collection.length;
            var plural_form = app.pluralize(items_shown, this.schema.plural_forms);
            var tfoot_text = [items_shown, plural_form].join(" "); 

            var cols = _.keys(this.fields).length;

            return (
                <div>
                    <table id="data-table">
                        <thead>{this.create_thead()}</thead>
                        <tbody>
                            {this.props.collection.map(this.create_row)}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={cols}>{tfoot_text}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <Form root_url={this.props.root_url} fields={this.fields} />
                </div>
            )
        }
    });

    var Form = React.createClass({
        getInitialState: function(){
            return {
                visible: false,
            }
        },

        toggle_form: function(event){
            this.setState({form: this.state.visible ? true: false});
            $("#modelform").toggle(300);
        },

        create_inputs: function(field, order){
            if(field.name == "id" || field.name == "resource_uri") return;

            var name = field.name;
            var field = field.field;
            var required = !field.blank? "required" : '';

            var id = "id_"+name;
            return (
                <p>
                    <label htmlFor={id}>{field.verbose_name}</label>
                    <input id={id}
                        type={FIELD_MAP[field.type]}
                        name={name}
                        required={required}
                    />
                </p>
            )
        },

        handleSubmit: function(event){
            stop(event); //wonder why html5 validation still works
            var data = Backbone.Syphon.serialize(event.target);
            var collection = app.get_current_collection();
            collection.create(data, {wait: true});

            $(event.target)
                .find("input, textarea")
                .removeAttr('checked')
                .removeAttr('selected')
                .not(':button, :submit, :reset, :hidden, :radio, :checkbox')
                .val('');
        },

        render:function(){
            var add_link_title = "Добавить "+app.inflect('accs')+" ";
            add_link_title += this.state.visible? "–" : "+";

            return (
                <div>
                    <p><span className="link" onClick={this.toggle_form}>{add_link_title}</span></p>

                    <form method="post"
                        id="modelform"
                        action={this.props.root_url}
                        className={this.state.visible?"visible":"hidden"}
                        onSubmit={this.handleSubmit}
                        >

                        <fieldset>
                            {_.map(this.props.fields, this.create_inputs)}
                        </fieldset>
                        <p className="submit"><input type="submit" value="Добавить" /></p>
                    </form>
                </div>
            );
        }
    });

    var Menu = React.createClass({
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
                <li><a id={link}
                        data-model={link}
                        onClick={this.switchCollection}
                        className={cls}
                        href={href}>{title}</a>
                </li>
            )
        },
        render: function(){
            return (
                <ul>{_.map(this.props.links, this.create_link)}</ul>
            );
        }
    });

    app.render_templates = function(){
        app.render_menu();
        app.render_table(app.get_current_collection());
    };

    app.render_menu = function(){
        React.renderComponent(
            <Menu links={app.routes} />,
            _id("#menu")
        );
    };

    app.render_table = function(collection){
        remount("#data");
        React.renderComponent(
            <Table
                collection={collection}
                schema={collection.schema}
                root_url={collection.url}
            />,
            _id("#data")
        );

        $(".hidden").hide();
        $("input[type=datetime]").datepicker($.datepicker.regional['ru']);
        $("input[type=datetime]").datepicker("option", "dateFormat", "yy-mm-dd");
    };

})();
