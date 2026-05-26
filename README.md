# **Project** : Transcendance

<table>
  <tr>
    <td>
      <img src="https://github.com/ayogun/42-project-badges/blob/main/badges/ft_transcendencem.png" alt="ft_transcendance 42 project badge" width="400"/>
    </td>
    <td>
      ft_transcendance is the last group common core project at 42 school. The goal is to build everything needed to run a website to play <a href="https://fr.wikipedia.org/wiki/Pong">Pong</a>, with a lot of different modules around this concept : frontend, DevObs architecture, user authentification and chat, match history, online games and cybersecurity. 
    </td>
  </tr>
</table>

## :memo: Status
<p align="center">
  <img src="https://github.com/sponthus/assets/blob/main/42school/scores/125.png" alt="125 grade"/>
  <br><strong>Validated 2025-11-06</strong>
  <br>All bonuses
</p>

## :orange_book: Features
+ SPA website with spongebob theme
+ 3D pong game and lobby, tournaments (local), AI opponent (q-learning algorithm)
+ User system with registration and log-in, 2FA with github sign-in
+ Profile pages with friend system and real-time notifications
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

:hugs: Thanx !
---
Made by ebriere, endoliam, mbogey, sponthus
