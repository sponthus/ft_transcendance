# **Proof of concept** : Transcendance

## Description
<table>
  <p align="center">
     <img src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Pong.png" alt="Pong wikipedia image" width="400"/>
  </p>
  </tr>
  <tr>
    <td>
      Transcendance is the last group common core project at 42 school. The goal is to create a website to play <a href="https://fr.wikipedia.org/wiki/Pong">Pong</a>, with a lot of modules around this concept : frontend, DevObs architecture, user authentification and chat, match history, online games and cybersecurity. 
      Therefore, many programming languages and concepts are expected. This repo contains our WIP for this project.
    </td>
  </tr>
</table>

## :memo: Status
<p align="center">
  <strong>Ongoing :</strong> <br>
  :star: Complete the status service in backend<br>
  :star: Complete frontend style<br>
  :star: Complete AI opponent<br>
  :star: Complete user authentication (2 FA) <br>
</p>

## :orange_book: Features (WIP)
+ Basic SPA website with router and back/forward navigation working
+ 3D pong game (local), tournaments
+ User system with registration and log-in
+ Using `docker-compose` to launch the project with micro-services architecture :<br>
     - Nginx
     - Frontend compilation, then served by nginx in prod mode / vite server in dev mode
     - Backend servers : api-controller, game-service, users-service, upload-service

## :cyclone: Clone
Clone the repository and enter it :
```shell
git clone https://github.com/sponthus/ft_transcendance
cd ft_transcendance
```

## 	:runner: Run
From the project directory, use :
```shell
make
```
Be awarwe that this is a WIP, and not designed to be a finished product !

:hugs: Thanx !
---
Made by ebriere, endoliam, mbogey, sponthus
