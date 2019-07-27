# This tutorial to run react development as service (run it when logout current session)
Enviroment: Ubuntu 18.04

Create the file *myapp.service* with the following contents:

```
# copy this file to /lib/systemd/system/

[Unit]
Description=LTPS NodeJS Test Application
After=network-online.target

[Service]
Restart=on-failure
WorkingDirectory=/path_of_this_folder/
ExecStart=/usr/bin/yarn react-scripts start

[Install]
WantedBy=multi-user.target
```

You have to change **WorkingDirectory** path to correctly.

Save it and copy to **/lib/systemd/system/**.

Run this command:

```bash
systemctl daemon-reload
```

Let SystemD know about the myapp service and instruct SystemD to load this service on boot:

```bash
systemctl enable myapp
```

Now run the myapp service:

```bash
systemctl restart myapp
```


