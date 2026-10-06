"""Python Memory Cards - Flask server.

This file keeps the Python side intentionally small and readable.
Flask serves the web page, CSS, JavaScript, and a tiny JSON API that
creates a shuffled deck for each new game.
"""

import random
from flask import Flask, jsonify, render_template

# Create the Flask app. Flask automatically knows where to find:
# - templates/ for HTML files
# - static/ for CSS and JavaScript files
app = Flask(__name__)

# These simple text/emoji values become the matching card pairs.
CARD_VALUES = ["🐍", "⭐", "🚀", "🎲", "🍕", "🎯", "💡", "🌈"]

FLOWER_VALUES = ["🌸","🌼","🌺","🌻","🌹","💐","🥀","🌷"]

NUMS_VALUES = ["1","3","6","7","11","33","66","77"]

@app.route("/")
def index():
    """Show the main browser game page."""
    return render_template("index.html")


@app.route("/api/new-game-emoji")
def new_game_emoji():
    """Return a freshly shuffled list of card values as JSON.

    Each value appears twice so the browser can build matching pairs.
    The JavaScript code calls this endpoint when the player starts or
    restarts the game.
    """
    cards = CARD_VALUES * 2
    random.shuffle(cards)
    return jsonify({"cards": cards})



@app.route("/api/new-game-numbers")
def new_game_numbers():
    """Return a freshly shuffled list of card values as JSON.

    Each value appears twice so the browser can build matching pairs.
    The JavaScript code calls this endpoint when the player starts or
    restarts the game.
    """
    cards = NUMS_VALUES * 2
    random.shuffle(cards)
    return jsonify({"cards": cards})


@app.route("/api/new-game-flowers")
def new_game_flowers():
    """Return a freshly shuffled list of card values as JSON.

    Each value appears twice so the browser can build matching pairs.
    The JavaScript code calls this endpoint when the player starts or
    restarts the game.
    """
    cards = FLOWER_VALUES * 2
    random.shuffle(cards)
    return jsonify({"cards": cards})


if __name__ == "__main__":
    # host="0.0.0.0" lets Flask accept connections from outside the
    # container. Port 5000 matches the Dockerfile and README commands.
    app.run(host="0.0.0.0", port=5000, debug=True)
