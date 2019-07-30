# Some issue and solution with docker
Environment: Ubuntu 18.04
# when cmd ``docker rmi [docker-image]``
``Error response from daemon: conflict: unable to delete '44c98abbbd11' (must be forced) - image is being used by stopped container '3e232b1d9ab1'``

**Solution:** fix by add option ``-f`` to forced remove image

# when login with docker
Error saving credentials: error storing credentials - err: exit status 1, out: `Cannot autolaunch D-Bus without X11 $DISPLAY`

**Solution**: 
```bash
sudo apt install gnupg2 pass
```

# push image to docker hub
- First, login with docker hub
```bash
docker login
```
After enter username and password on Docker hub.

Default password will be stored as clear text, if you want encrypt and use a password manager, you can read this article
https://github.com/docker/docker-credential-helpers/issues/102

- Second, login on docker hub and create a repository

- After that, run docker images to list images, then run:
```bash
docker tag local-repository username/server-repository:tag
```
- Finally, run:
```bash
docker push username/server-repository:tag
```

# Error with permission of ~/.docker/config.json
**Solution:**
```bash
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "/home/$USER/.docker" -R
```

