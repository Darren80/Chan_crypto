git add .
git commit -am "Auto Push"
git push origin master

# Remote reload
token=$( curl -S -XPOST -H "Content-type: application/json" -d '{
    "user": {
        "email": "we444465@gmail.com",
        "password": "secretpw"
    }
}' 'https://cryptostar.ga/api/users/login' | ./jq '.user.token' -r )
token="Token $token"
echo $token

curl -S -XGET -H "Authorization: $token" 'https://cryptostar.ga/restart-server'

read -n 1 -s -r -p "Press any key to exit"