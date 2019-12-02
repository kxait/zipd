param (
    [string]$message = "auto deploy"
)

git add .
git commit -m $message
git push heroku master
heroku logs --tail