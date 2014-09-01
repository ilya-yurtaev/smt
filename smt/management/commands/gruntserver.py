import os
import subprocess
import atexit
import signal
from django.conf import settings
from django.contrib.staticfiles.management.commands.runserver import Command\
    as StaticfilesRunserverCommand


class Command(StaticfilesRunserverCommand):

    def inner_run(self, *args, **options):
        self.start_grunt()
        return super(Command, self).inner_run(*args, **options)

    def get_grunt_root(self):
        try:
            return getattr(settings, 'GRUNTFILE_ROOT', settings.BASE_DIR)
        except AttributeError, e:
            if not getattr(settings, 'GRUNTFILE_ROOT', False):
                self.stderr.write('The GRUNTFILE_ROOT setting must not be empty')
                self.stderr.write('Set the GRUNTFILE_ROOT setting to the directory containing Gruntfile.js')
            else:
                raise e
            # Need to use an OS exit because sys.exit doesn't work in a thread
            os._exit(1)

    def start_grunt(self):
        try:
            os.kill(self.grunt_process.pid, signal.SIGTERM)
        except AttributeError:
            pass

        grunt_root = self.get_grunt_root()

        self.stdout.write('>>> Starting grunt')
        self.grunt_process = subprocess.Popen(
            ['cd {} && grunt'.format(grunt_root)],
            shell=True,
            stdin=subprocess.PIPE,
            stdout=self.stdout,
            stderr=self.stderr,
        )

        self.stdout.write('>>> Grunt process on pid {0}'.format(self.grunt_process.pid))

        def kill_grunt_process(pid):
            self.stdout.write('>>> Closing grunt process')
            os.kill(pid, signal.SIGTERM)

        atexit.register(kill_grunt_process, self.grunt_process.pid)
