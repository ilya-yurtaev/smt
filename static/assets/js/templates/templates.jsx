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


    var Table = React.createClass({
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
                <td className={key}
                    onClick={this.cellClicked}
                >{value}</td>
            );
        },

        create_th: function(key, value){
            return (
                <th className={key.type} scope="col">{key.verbose_name}</th>
            )
        },

        create_thead: function(){
            var fields = this.schema.fields;
            return (
                <tr>{_.map(fields, this.create_th)}</tr>
            )
        },

        create_row: function(obj){
            return (
                <tr key={obj.id} data-url={obj.resource_uri}>{_.map(obj, this.create_cell)}</tr>
            );
        },

        create_inputs: function(field, name){
            if(name == "id" || name == "resource_uri") return;

            var id = "id_"+name;
            return (
                <p>
                    <label for={id}>{field.verbose_name}</label>
                    <input id={id} type={FIELD_MAP[field.type]} />
                </p>
            )
        },

        toggle_form: function(event){
            this.setState({form: this.state.form == "visible" ? "hidden": "visible"});
            $("#modelform").toggle("slow");
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
                <div>
                    <table id="data-table">
                        <thead>{this.create_thead()}</thead>
                        <tbody>
                            {this.props.collection.map(this.create_row)}
                        </tbody>
                        <tfoot>
                    </table>

                    <p><span className="link" onClick={this.toggle_form}>{add_link_title}</span></p>

                    <form method="post"
                        id="modelform"
                        action={this.props.root_url}
                        className={this.state.form}
                        onSubmit={this.handleSubmit}
                        >

                        <fieldset>
                            {_.map(this.schema.fields, this.create_inputs)}
                        </fieldset>
                        <p class="submit"><input type="submit" value="Добавить" /></p>
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
        $("input[type=datetime]").datepicker({dateFormat: "yy-mm-dd"});
    };

})();
