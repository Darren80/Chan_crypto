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

sleep 2.5s

curl -S -XPOST -H "Authorization: $token" -H "Content-type: application/json" -d '{
    "action": "restart"
}' 'https://cryptostar.ga/server-control'

read -n 1 -s -r -p "Press any key to exit"