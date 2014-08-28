# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Users'
        db.create_table('users', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('paycheck', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('date_joined', self.gf('django.db.models.fields.DateField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'test_task', ['Users'])

        # Adding model 'Rooms'
        db.create_table('rooms', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('department', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('spots', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'test_task', ['Rooms'])


    def backwards(self, orm):
        # Deleting model 'Users'
        db.delete_table('users')

        # Deleting model 'Rooms'
        db.delete_table('rooms')


    models = {
        u'test_task.rooms': {
            'Meta': {'object_name': 'Rooms', 'db_table': "'rooms'"},
            'department': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'spots': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        u'test_task.users': {
            'Meta': {'object_name': 'Users', 'db_table': "'users'"},
            'date_joined': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'paycheck': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        }
    }

    complete_apps = ['test_task']