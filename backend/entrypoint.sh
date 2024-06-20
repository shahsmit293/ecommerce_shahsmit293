#!/bin/sh

# Run the database migrations
flask db upgrade

# Start the Flask application
exec python app.py
