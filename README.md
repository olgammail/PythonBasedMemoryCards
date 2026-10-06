# Python Memory Cards

A simple Dockerized browser game built with Python Flask, HTML, CSS, and vanilla JavaScript.

The source code stays visible in this folder so you can edit it on your computer, learn from it, and rebuild the Docker image whenever you make changes.

## Files

- `app.py` - small Flask server with one page route and one JSON API route
- `requirements.txt` - Python package list
- `Dockerfile` - instructions for building the Docker image
- `templates/index.html` - browser page
- `static/style.css` - game styling
- `static/script.js` - card flipping, moves, timer, restart, and win logic

## 1. Go to the project folder

In Windows Git Bash, go to the folder that contains this project, then run:

```bash
cd python-web-game
```

## 2. Build the Docker image

```bash
docker build -t python-web-game .
```

## 3. Run the Docker container

```bash
docker run --rm -p 5000:5000 --name python-web-game-container python-web-game
```

Keep this terminal window open while you play the game.

## 4. Open the game in the browser

Open this address:

```text
http://localhost:5000
```

## 5. Stop the container

Press `Ctrl + C` in the terminal where the container is running.

If you need to stop it from another Git Bash terminal, run:

```bash
docker stop python-web-game-container
```

## 6. Change the source code and rebuild the image

Edit the files in `python-web-game` on your computer.

After saving your changes, rebuild the image:

```bash
docker build -t python-web-game .
```

Then run the container again:

```bash
docker run --rm -p 5000:5000 --name python-web-game-container python-web-game
```

## How the game works

- Flask serves `templates/index.html` at `/`.
- Flask serves files from the `static` folder automatically.
- JavaScript calls `GET /api/new-game` when the game starts or restarts.
- The Python API returns a shuffled list of card values.
- The browser builds the card grid, tracks moves, tracks time, and shows a win message.
