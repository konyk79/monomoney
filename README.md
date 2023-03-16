## Description

Redis ports set up in .env:

- REDIS_OPTIONS_PRODUCTION=redis://localhost:6379
- REDIS_OPTIONS_STAGE=redis://localhost:6380
- REDIS_OPTIONS_DEVELOPMENT=redis://localhost:6382

If you want check redis instances in server terminal use:
`sudo ps aux |grep redis`

Output:

- `redis 4480 0.1 0.7 63896 7428 ? Ssl Mar13 7:16 /usr/bin/redis-server 127.0.0.1:6380`
- `redis 72848 0.2 0.7 63900 7684 ? Ssl 09:39 0:52 /usr/bin/redis-server 127.0.0.1:6382`
- `redis 76789 0.3 0.8 63900 7948 ? Ssl 15:12 0:20 /usr/bin/redis-server 127.0.0.1:6379`

To check statuses of all redis services:
sudo systemctl status redis-server.service
sudo systemctl status redis-server-dev.service
sudo systemctl status redis-server-stage.service

if you want check that these are independent instances,then you can use:

redis-cli -p 6379 (6380 for stage, 6382 for dev)
and run `set test prod`

After this go to another redis and check that test is not defined. Run `get test`. After this you can set test to relevant environment and go to third one. In every instance will be only own value.

Actually set new data in redis you will increase size of db and can see it in endpoint:

http://167.172.186.58:8081/redisStatus

output:
`{"redisStatus":{"production":{"status":"active","dbsize":4},"stage":{"status":"active","dbsize":3},"development":{"status":"active","dbsize":2}}}`

To install 3 different instances I used this link:
https://gist.github.com/abdulrahman911/a384a0770db6222acb9ff0d677ab47dd

Create the directory for the new instance
`sudo install -o redis -g redis -d /var/lib/redis2`

Create a new configuration file
`sudo cp -p /etc/redis/redis.conf /etc/redis/redis2.conf`

Edit the new configuration file
` sudo nano /etc/redis/redis2.conf`

- pidfile /var/run/redis/redis-server2.pid
- logfile /var/log/redis/redis-server2.log
- dir /var/lib/redis2
- port 6380

Create new service file
`sudo cp /lib/systemd/system/redis-server.service /lib/systemd/system/redis-server2.service`

Edit the new service file

`sudo vim /lib/systemd/system/redis-server2.service`

- ExecStart=/usr/bin/redis-server /etc/redis/redis2.conf
- PIDFile=/var/run/redis/redis-server2.pid
- ReadWriteDirectories=-/var/lib/redis2
- Alias=redis2.service

Enable and start the service
`sudo systemctl enable redis-server2.service`
`sudo systemctl start redis-server2.service`

Cck status
` ps aux |grep redis`
