#!/bin/sh

# Run the database migrations
flask db migrate
flask db upgrade

# Start the Flask application
exec python app.py
