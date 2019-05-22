git add .
git commit -am "Auto Push"
git push origin master

#Remote reload
curl -v -XGET -H 'Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndlNDQ0NDY1QGdtYWlsLmNvbSIsImV4cCI6MTU2Mzc0MjUxNSwiaWF0IjoxNTU4NTU4NTE1fQ.xQqg03KDqg70dxKD4LlfWNVNVWcpT-0c9gswzm-wJlc' -H "Content-type: application/json" 'https://cryptostar.ga/restart-server'

read -n 1 -s -r -p "Press any key to exit"